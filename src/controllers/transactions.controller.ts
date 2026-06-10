import { Context } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { transactionsRepository } from '../repositories/transactions.repository';
import { createTransactionSchema, updateTransactionSchema } from '../schemas/transaction.schema';
import { uploadService } from '../services/upload.service';


export const transactionsController = {
  getAll: async (c: Context) => {
    const userId = c.get('userId');
    const transactions = await transactionsRepository.findAllByUserId(userId);
    return c.json(transactions, 200);
  },

  getById: async (c: Context) => {
    const id = Number(c.req.param('id'));
    const userId = c.get('userId');
    const transaction = await transactionsRepository.findById(id);
    if (!transaction) return c.json({ message: 'Transacción no encontrada' }, 404);
    if (transaction.userId !== userId) return c.json({ message: 'No autorizado' }, 403);
    return c.json(transaction, 200);
  },

  create: async (c: Context) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) return c.json({ errors: parsed.error.issues }, 400);

    const data = {
      ...parsed.data,
      date: new Date(parsed.data.date),
      userId
    };
    const newTx = await transactionsRepository.create(data);
    return c.json(newTx, 201);
  },

  update: async (c: Context) => {
    const id = Number(c.req.param('id'));
    const userId = c.get('userId');
    const body = await c.req.json();
    const parsed = updateTransactionSchema.safeParse(body);
    if (!parsed.success) return c.json({ errors: parsed.error.issues }, 400);

    const existing = await transactionsRepository.findById(id);
    if (!existing) return c.json({ message: 'Transacción no encontrada' }, 404);
    if (existing.userId !== userId) return c.json({ message: 'No autorizado' }, 403);

    const data: any = { ...parsed.data };
    if (data.date) data.date = new Date(data.date);
    const updated = await transactionsRepository.update(id, data);
    return c.json(updated, 200);
  },

  remove: async (c: Context) => {
    const id = Number(c.req.param('id'));
    const userId = c.get('userId');
    const existing = await transactionsRepository.findById(id);
    if (!existing) return c.json({ message: 'Transacción no encontrada' }, 404);
    if (existing.userId !== userId) return c.json({ message: 'No autorizado' }, 403);

    await transactionsRepository.remove(id);
    return c.body(null, 204);
  },

  getBalance: async (c: Context) => {
    const userId = c.get('userId');
    const transactions = await transactionsRepository.findAllForBalance(userId);
    let totalIncome = 0;
    let totalExpense = 0;
    for (const tx of transactions) {
      if (tx.type === 'income') totalIncome += tx.amount;
      else if (tx.type === 'expense') totalExpense += tx.amount;
    }
    const balance = totalIncome - totalExpense;
    return c.json({ totalIncome, totalExpense, balance }, 200);
  },

  uploadReceipt: async (c: Context) => {
  const formData = await c.req.formData();
  const file = formData.get('receipt') as File;

  if (!file) {
    return c.json({ message: 'Archivo requerido' }, 400);
  }

  // Validar tipo MIME
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ message: 'Tipo de archivo no permitido. Use JPEG, PNG o WebP' }, 400);
  }

  // Validar tamaño (5 MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return c.json({ message: 'El archivo excede los 5 MB' }, 400);
  }

  // Subir a Cloudflare R2
  const receiptUrl = await uploadService.uploadReceipt(file);
  return c.json({ receiptUrl }, 200);
}
};