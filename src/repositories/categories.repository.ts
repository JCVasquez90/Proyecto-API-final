import prisma from '../lib/prisma';

export const categoriesRepository = {
  findAll: () => prisma.category.findMany(),
  findById: (id: number) => prisma.category.findUnique({ where: { id } }),
  create: (data: { name: string }) => prisma.category.create({ data }),
  update: (id: number, data: { name?: string }) =>
    prisma.category.update({ where: { id }, data }),
  remove: (id: number) => prisma.category.delete({ where: { id } })
};