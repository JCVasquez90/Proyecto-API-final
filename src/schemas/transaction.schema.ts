import { z } from 'zod';

export const createTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  description: z.string().optional(),
  date: z.string().datetime(),
  categoryId: z.number().int().positive(),
  receiptUrl: z.string().url().optional().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export const updateTransactionSchema = createTransactionSchema.partial();