import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/auth.middleware';
import { categoriesController } from '../controllers/categories.controller';

export const categoriesRoutes = new Hono();

categoriesRoutes.use('*', authMiddleware);

categoriesRoutes.get('/', categoriesController.getAll);
categoriesRoutes.get('/:id', categoriesController.getById);
categoriesRoutes.post('/', categoriesController.create);
categoriesRoutes.patch('/:id', categoriesController.update);
categoriesRoutes.delete('/:id', categoriesController.remove);