import { Context } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authRepository } from '../repositories/auth.repository';
import { registerSchema } from '../schemas/auth.schema';

const JWT_SECRET = process.env.JWT_SECRET!;

export const authController = {
  register: async (c: Context) => {
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return c.json({ errors: parsed.error.issues }, 400);

    const { email, password } = parsed.data;

    // Verificar si el email ya existe
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      return c.json({ message: 'El email ya está registrado' }, 409);
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await authRepository.create({ email, passwordHash });

    // Generar token JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return c.json({ token, user: { id: user.id, email: user.email } }, 201);
  },

  login: async (c: Context) => {
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return c.json({ errors: parsed.error.issues }, 400);

    const { email, password } = parsed.data;
    const user = await authRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return c.json({ message: 'Credenciales inválidas' }, 401);
    }

    // Generar token JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return c.json({ token, user: { id: user.id, email: user.email } });
  }
};