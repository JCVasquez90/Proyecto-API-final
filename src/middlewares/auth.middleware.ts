import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ message: 'Token no proporcionado' }, 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return c.json({ message: 'Token no proporcionado' }, 401);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return c.json({ message: 'Error de configuración del servidor' }, 500);
    }

    const decoded = jwt.verify(token, secret) as unknown as { userId: number };
    c.set('userId', decoded.userId);
    await next();
  } catch {
    return c.json({ message: 'Token inválido o expirado' }, 401);
  }
};