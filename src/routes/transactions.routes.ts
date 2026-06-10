import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/auth.middleware';
import { transactionsController } from '../controllers/transactions.controller';

export const transactionsRoutes = new Hono();

transactionsRoutes.use('*', authMiddleware);

transactionsRoutes.get('/', transactionsController.getAll);
transactionsRoutes.get('/balance', transactionsController.getBalance);
transactionsRoutes.get('/:id', transactionsController.getById);
transactionsRoutes.post('/', transactionsController.create);
transactionsRoutes.patch('/:id', transactionsController.update);
transactionsRoutes.delete('/:id', transactionsController.remove);
transactionsRoutes.post('/upload', transactionsController.uploadReceipt);