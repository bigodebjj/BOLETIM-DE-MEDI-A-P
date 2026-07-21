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
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

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

function getFirebaseApp(): FirebaseApp {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
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

export async function uploadFile(file: File): Promise<{ url: string; name: string; mimeType: string; size: number }> {
  const storage = getStorage(getFirebaseApp());
  const timestamp = Date.now();
  const fileName = `uploads/${timestamp}_${file.name}`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, name: file.name, mimeType: file.type, size: file.size };
}

export type { User };
