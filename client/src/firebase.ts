import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDkdz6vqiWheza_ZM2kobaXCv5szCjsGqM',
  authDomain: 'medicao-73dcd.firebaseapp.com',
  projectId: 'medicao-73dcd',
  storageBucket: 'medicao-73dcd.firebasestorage.app',
  messagingSenderId: '941639285481',
  appId: '1:941639285481:web:5515c9e56921859cd48e78'
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function getFirebaseApp(): FirebaseApp {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export function logout() {
  return signOut(getFirebaseAuth());
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

async function getConfigValue(key: string): Promise<string> {
  const database = getFirebaseDb();
  const docSnap = await getDoc(doc(database, 'config', key));
  return docSnap.exists() ? docSnap.data().valor : '';
}

function cleanDriveFolderId(input: string): string {
  let id = input.trim();
  if (id.includes('drive.google.com')) {
    const match = id.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (match) id = match[1];
  }
  id = id.split('?')[0];
  return id;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadFileToDrive(file: File): Promise<{ url: string; name: string; mimeType: string; size: number }> {
  const uploadUrl = await getConfigValue('DRIVE_UPLOAD_URL');
  const folderIdRaw = await getConfigValue('DRIVE_ROOT_FOLDER_ID');
  const folderId = cleanDriveFolderId(folderIdRaw);

  if (!uploadUrl) {
    throw new Error('Configure a URL do Google Apps Script nas Configurações');
  }

  if (!folderId) {
    throw new Error('Configure o ID da pasta do Google Drive nas Configurações');
  }

  const fileBase64 = await fileToBase64(file);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: JSON.stringify({
      folderId: folderId,
      fileName: file.name,
      mimeType: file.type,
      fileBase64: fileBase64
    })
  });

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return {
    url: result.fileUrl,
    name: file.name,
    mimeType: file.type,
    size: file.size
  };
}

export type { User };
