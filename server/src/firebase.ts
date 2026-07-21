import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  DocumentData,
  QuerySnapshot,
  QueryDocumentSnapshot,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  runTransaction,
  DocumentReference,
  Query
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDkdz6vqiWheza_ZM2kobaXCv5szCjsGqM',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'medicao-73dcd.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'medicao-73dcd',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'medicao-73dcd.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '941639285481',
  appId: process.env.FIREBASE_APP_ID || '1:941639285481:web:5515c9e56921859cd48e78'
};

let db: Firestore;

export function initFirebase(): Firestore {
  if (db) return db;
  const app: FirebaseApp = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log('Firebase Firestore inicializado com sucesso');
  return db;
}

export function getDb(): Firestore {
  if (!db) {
    throw new Error('Firebase não inicializado. Chame initFirebase() primeiro.');
  }
  return db;
}

export async function getNextId(collectionName: string): Promise<number> {
  const database = getDb();
  const counterRef: DocumentReference<DocumentData> = doc(database, '_counters', collectionName);

  return await runTransaction(database, async (transaction) => {
    const snap = await transaction.get(counterRef);
    let nextId = 1;
    if (snap.exists()) {
      nextId = (snap.data()?.nextId || 0) + 1;
    }
    transaction.set(counterRef, { nextId }, { merge: true });
    return nextId;
  });
}

export function querySnapshotToArray<T>(snapshot: QuerySnapshot<DocumentData>): T[] {
  const result: T[] = [];
  snapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
    result.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
  });
  return result;
}

export {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch
};
