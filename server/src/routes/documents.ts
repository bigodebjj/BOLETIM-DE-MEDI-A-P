import { Router, Request, Response } from 'express';
import {
  getDb,
  getNextId,
  querySnapshotToArray,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from '../firebase';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const { ano, mes, categoria, status, search } = req.query;

    const constraints: any[] = [];
    if (ano) constraints.push(where('ano', '==', ano));
    if (mes) constraints.push(where('mes', '==', mes));
    if (categoria) constraints.push(where('categoria', '==', categoria));
    if (status) constraints.push(where('status', '==', status));
    constraints.push(orderBy('idNumerico', 'desc'));

    const q = query(collection(db, 'documentos'), ...constraints);
    const snapshot = await getDocs(q);
    let docs = querySnapshotToArray<any>(snapshot);

    if (search) {
      const q = String(search).toLowerCase();
      docs = docs.filter(d =>
        (d.nomeArquivo && d.nomeArquivo.toLowerCase().includes(q)) ||
        (d.fornecedor && d.fornecedor.toLowerCase().includes(q)) ||
        (d.numDocumento && d.numDocumento.toLowerCase().includes(q)) ||
        (d.observacoes && d.observacoes.toLowerCase().includes(q))
      );
    }

    res.json(docs);
  } catch (err: any) {
    console.error('Erro ao listar documentos:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const snapshot = await getDocs(collection(db, 'documentos'));
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
    console.error('Erro no dashboard:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const docSnap = await getDoc(doc(db, 'documentos', String(req.params.id)));
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }
    res.json({ id: docSnap.id, ...docSnap.data() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const nextId = await getNextId('documentos');
    const dataUpload = new Date().toISOString();

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
      dataUpload,
      nomeArquivo: req.body.nomeArquivo || '',
      linkArquivo: req.body.linkArquivo || '',
      mimeType: req.body.mimeType || '',
      status: req.body.status || 'PENDENTE',
      responsavel: req.body.responsavel || '',
      observacoes: req.body.observacoes || '',
    };

    const ref = await addDoc(collection(db, 'documentos'), docData);
    const saved = await getDoc(ref);
    res.status(201).json({ id: saved.id, ...saved.data() });
  } catch (err: any) {
    console.error('Erro ao criar documento:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const docRef = doc(db, 'documentos', String(req.params.id));
    const existing = await getDoc(docRef);

    if (!existing.exists()) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const updates: any = {};
    const fields = [
      'ano', 'mes', 'categoria', 'subcategoria', 'tipoDocumento',
      'fornecedor', 'numDocumento', 'valor', 'dataEmissao',
      'nomeArquivo', 'linkArquivo', 'mimeType', 'status',
      'responsavel', 'observacoes'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        updates[f] = f === 'valor' ? Number(req.body[f]) : req.body[f];
      }
    });

    await updateDoc(docRef, updates);
    const updated = await getDoc(docRef);
    res.json({ id: updated.id, ...updated.data() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const docRef = doc(db, 'documentos', String(req.params.id));
    const existing = await getDoc(docRef);

    if (!existing.exists()) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    await deleteDoc(docRef);
    res.json({ message: 'Documento excluído' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
