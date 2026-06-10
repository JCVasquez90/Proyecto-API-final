import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ message: 'Token no proporcionado' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'default-secret-change-me';
    const payload = jwt.verify(token, secret) as { userId: number };
    c.set('userId', payload.userId);
    await next();
  } catch (error) {
    return c.json({ message: 'Token inválido o expirado' }, 401);
  }
};