import prisma from '../lib/prisma';

export const authRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),
  create: (data: { email: string; passwordHash: string }) =>
    prisma.user.create({ data })
};