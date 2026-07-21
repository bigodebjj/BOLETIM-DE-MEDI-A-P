import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { initFirebase, getDb, collection, getDocs, query, where } from './firebase';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import documentsRouter from './routes/documents';
import configRouter from './routes/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  res.json({
    id: req.file.filename,
    name: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    size: req.file.size
  });
});

app.use('/uploads', express.static(uploadsDir));
app.use('/api/documents', documentsRouter);
app.use('/api/config', configRouter);

app.get('/api/status-summary', async (_req, res) => {
  try {
    const db = getDb();
    const snapshot = await getDocs(collection(db, 'documentos'));
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
    const db = getDb();
    const { ano } = req.query;
    let snapshot;

    if (ano) {
      const q = query(collection(db, 'documentos'), where('ano', '==', ano));
      snapshot = await getDocs(q);
    } else {
      snapshot = await getDocs(collection(db, 'documentos'));
    }

    const report: Record<string, any> = {};
    snapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const d = docSnap.data();
      const key = `${d.ano}|${d.mes}`;
      if (!report[key]) {
        report[key] = { ano: d.ano, mes: d.mes, total: 0, valorTotal: 0 };
      }
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

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

initFirebase();

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
