import { Router, Request, Response } from 'express';
import { getDb, collection, doc, getDocs, writeBatch } from '../firebase';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const snapshot = await getDocs(collection(db, 'config'));
    const configs: any[] = [];
    snapshot.forEach((d: QueryDocumentSnapshot<DocumentData>) => {
      configs.push({ chave: d.id, ...d.data() });
    });
    res.json(configs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const items = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Esperado array de {chave, valor}' });
    }

    const batch = writeBatch(db);
    for (const item of items) {
      if (!item.chave) continue;
      const ref = doc(db, 'config', item.chave);
      batch.set(ref, { valor: item.valor || '' }, { merge: true });
    }
    await batch.commit();

    res.json({ message: 'Configurações salvas' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
