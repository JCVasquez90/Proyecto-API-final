import prisma from '../lib/prisma';

export const transactionsRepository = {
  findAllByUserId: (userId: number) =>
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true }
    }),
  findById: (id: number) =>
    prisma.transaction.findUnique({
      where: { id },
      include: { category: true }
    }),
  create: (data: any) =>
    prisma.transaction.create({
      data,
      include: { category: true }
    }),
  update: (id: number, data: any) =>
    prisma.transaction.update({
      where: { id },
      data,
      include: { category: true }
    }),
  remove: (id: number) =>
    prisma.transaction.delete({ where: { id } }),
  findAllForBalance: (userId: number) =>
    prisma.transaction.findMany({
      where: { userId },
      select: { amount: true, type: true }
    })
};