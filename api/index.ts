import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore, Firestore, DocumentData, QuerySnapshot, QueryDocumentSnapshot,
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, writeBatch, runTransaction, DocumentReference
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

function getDb(): Firestore {
  if (!db) {
    const app: FirebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
  return db;
}

function querySnapshotToArray<T>(snapshot: QuerySnapshot<DocumentData>): T[] {
  const result: T[] = [];
  snapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
    result.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
  });
  return result;
}

async function getNextId(collectionName: string): Promise<number> {
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

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/status-summary', async (_req, res) => {
  try {
    const database = getDb();
    const snapshot = await getDocs(collection(database, 'documentos'));
    const summary: Record<string, number> = { PENDENTE: 0, CONFERIDO: 0, APROVADO: 0, ARQUIVADO: 0 };
    snapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const status = docSnap.data().status;
      if (summary[status] !== undefined) summary[status]++;
    });
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/monthly-report', async (req, res) => {
  try {
    const database = getDb();
    const { ano } = req.query;
    let snapshot;
    if (ano) {
      const q = query(collection(database, 'documentos'), where('ano', '==', ano));
      snapshot = await getDocs(q);
    } else {
      snapshot = await getDocs(collection(database, 'documentos'));
    }
    const report: Record<string, any> = {};
    snapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const d = docSnap.data();
      const key = `${d.ano}|${d.mes}`;
      if (!report[key]) report[key] = { ano: d.ano, mes: d.mes, total: 0, valorTotal: 0 };
      report[key].total++;
      report[key].valorTotal += Number(d.valor) || 0;
    });
    res.json(Object.values(report));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categorias', (_req, res) => {
  res.json([
    { codigo: '01', nome: 'EQUIPE RESIDENTE' },
    { codigo: '02', nome: 'AQUISIÇÃO DE PEÇAS INSUMOS E SERVIÇOS' },
    { codigo: '03', nome: 'DEPRECIAÇÃO' },
    { codigo: '04', nome: 'IMPOSTOS E OBRIGAÇÕES' },
    { codigo: '05', nome: 'ADM LOCAL' }
  ]);
});

app.get('/api/subcategorias', (_req, res) => {
  res.json([
    { codigo: '01', nome: 'COMPRAS DE PEÇAS 10K' },
    { codigo: '02', nome: 'SERVIÇOS E TERCEIROS' },
    { codigo: '03', nome: 'VALIDAÇÃO PADROES' },
    { codigo: '04', nome: 'IMPREASSOS E TIMBRADOS' },
    { codigo: '05', nome: 'TREINAMENTOS EMH' },
    { codigo: '06', nome: 'LOCAÇÃO DE PADROES' },
    { codigo: '07', nome: 'DACTE FRETE' },
    { codigo: '08', nome: 'LISTA EPI EPC' }
  ]);
});

app.get('/api/documents/dashboard', async (_req, res) => {
  try {
    const database = getDb();
    const snapshot = await getDocs(collection(database, 'documentos'));
    const docs = querySnapshotToArray<any>(snapshot);
    const total = docs.length;
    const porAno: Record<string, number> = {};
    const porStatus: Record<string, number> = { PENDENTE: 0, CONFERIDO: 0, APROVADO: 0, ARQUIVADO: 0 };
    const porCategoria: Record<string, number> = {};
    let valorTotal = 0;
    docs.forEach(d => {
      porAno[d.ano] = (porAno[d.ano] || 0) + 1;
      if (porStatus[d.status] !== undefined) porStatus[d.status]++;
      porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + 1;
      valorTotal += Number(d.valor) || 0;
    });
    res.json({ total, porAno, porStatus, porCategoria, valorTotal });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents', async (req, res) => {
  try {
    const database = getDb();
    const { ano, mes, categoria, status, search } = req.query;
    const constraints: any[] = [];
    if (ano) constraints.push(where('ano', '==', ano));
    if (mes) constraints.push(where('mes', '==', mes));
    if (categoria) constraints.push(where('categoria', '==', categoria));
    if (status) constraints.push(where('status', '==', status));
    constraints.push(orderBy('idNumerico', 'desc'));
    const q = query(collection(database, 'documentos'), ...constraints);
    const snapshot = await getDocs(q);
    let docs = querySnapshotToArray<any>(snapshot);
    if (search) {
      const s = String(search).toLowerCase();
      docs = docs.filter(d =>
        (d.nomeArquivo && d.nomeArquivo.toLowerCase().includes(s)) ||
        (d.fornecedor && d.fornecedor.toLowerCase().includes(s)) ||
        (d.numDocumento && d.numDocumento.toLowerCase().includes(s)) ||
        (d.observacoes && d.observacoes.toLowerCase().includes(s))
      );
    }
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents/:id', async (req, res) => {
  try {
    const database = getDb();
    const docSnap = await getDoc(doc(database, 'documentos', String(req.params.id)));
    if (!docSnap.exists()) return res.status(404).json({ error: 'Documento não encontrado' });
    res.json({ id: docSnap.id, ...docSnap.data() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', async (req, res) => {
  try {
    const database = getDb();
    const nextId = await getNextId('documentos');
    const docData = {
      idNumerico: nextId,
      ano: req.body.ano || '',
      mes: req.body.mes || '',
      categoria: req.body.categoria || '',
      subcategoria: req.body.subcategoria || '',
      tipoDocumento: req.body.tipoDocumento || '',
      fornecedor: req.body.fornecedor || '',
      numDocumento: req.body.numDocumento || '',
      valor: Number(req.body.valor) || 0,
      dataEmissao: req.body.dataEmissao || '',
      dataUpload: new Date().toISOString(),
      nomeArquivo: req.body.nomeArquivo || '',
      linkArquivo: req.body.linkArquivo || '',
      mimeType: req.body.mimeType || '',
      status: req.body.status || 'PENDENTE',
      responsavel: req.body.responsavel || '',
      observacoes: req.body.observacoes || '',
    };
    const ref = await addDoc(collection(database, 'documentos'), docData);
    const saved = await getDoc(ref);
    res.status(201).json({ id: saved.id, ...saved.data() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/documents/:id', async (req, res) => {
  try {
    const database = getDb();
    const docRef = doc(database, 'documentos', String(req.params.id));
    const existing = await getDoc(docRef);
    if (!existing.exists()) return res.status(404).json({ error: 'Documento não encontrado' });
    const updates: any = {};
    const fields = ['ano', 'mes', 'categoria', 'subcategoria', 'tipoDocumento', 'fornecedor', 'numDocumento', 'valor', 'dataEmissao', 'nomeArquivo', 'linkArquivo', 'mimeType', 'status', 'responsavel', 'observacoes'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = f === 'valor' ? Number(req.body[f]) : req.body[f];
    });
    await updateDoc(docRef, updates);
    const updated = await getDoc(docRef);
    res.json({ id: updated.id, ...updated.data() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', async (req, res) => {
  try {
    const database = getDb();
    const docRef = doc(database, 'documentos', String(req.params.id));
    const existing = await getDoc(docRef);
    if (!existing.exists()) return res.status(404).json({ error: 'Documento não encontrado' });
    await deleteDoc(docRef);
    res.json({ message: 'Documento excluído' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/config', async (_req, res) => {
  try {
    const database = getDb();
    const snapshot = await getDocs(collection(database, 'config'));
    const configs: any[] = [];
    snapshot.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
      configs.push({ chave: d.id, ...d.data() });
    });
    res.json(configs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/config', async (req, res) => {
  try {
    const database = getDb();
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Esperado array de {chave, valor}' });
    const batch = writeBatch(database);
    for (const item of items) {
      if (!item.chave) continue;
      const ref = doc(database, 'config', item.chave);
      batch.set(ref, { valor: item.valor || '' }, { merge: true });
    }
    await batch.commit();
    res.json({ message: 'Configurações salvas' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
