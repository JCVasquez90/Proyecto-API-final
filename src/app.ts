import { Hono } from 'hono';
import { authRoutes } from './routes/auth.routes';
import { categoriesRoutes } from './routes/categories.routes';
import { transactionsRoutes } from './routes/transactions.routes';

const app = new Hono();

app.route('/auth', authRoutes);
app.route('/categories', categoriesRoutes);
app.route('/transactions', transactionsRoutes);


export default app;