import { Context } from 'hono';
import { categoriesRepository } from '../repositories/categories.repository';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';

export const categoriesController = {
  getAll: async (c: Context) => {
    const categories = await categoriesRepository.findAll();
    return c.json(categories, 200);
  },

  getById: async (c: Context) => {
    const id = Number(c.req.param('id'));
    const category = await categoriesRepository.findById(id);
    if (!category) return c.json({ message: 'Categoría no encontrada' }, 404);
    return c.json(category, 200);
  },

  create: async (c: Context) => {
    const body = await c.req.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) return c.json({ errors: parsed.error.issues }, 400);
    const newCategory = await categoriesRepository.create(parsed.data);
    return c.json(newCategory, 201);
  },

  update: async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) return c.json({ errors: parsed.error.issues }, 400);

  try {
    const updated = await categoriesRepository.update(id, {
      name: parsed.data.name,
    });
    return c.json(updated, 200);
  } catch (error) {
    return c.json({ message: 'Categoría no encontrada' }, 404);
  }
},

  remove: async (c: Context) => {
    const id = Number(c.req.param('id'));
    try {
      await categoriesRepository.remove(id);
      return c.body(null, 204);
    } catch (error) {
      return c.json({ message: 'No se pudo eliminar, puede tener transacciones asociadas' }, 400);
    }
  }
};