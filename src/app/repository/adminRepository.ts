import { PrismaClient, Administrador } from '@prisma/client'

const prisma = new PrismaClient()

export class AdminRepository {
  async getAll(): Promise<Administrador[]> {
    return prisma.administrador.findMany()
  }

  async getById(id: number): Promise<Administrador | null> {
    return prisma.administrador.findUnique({
      where: { id }
    })
  }

  async create(data: Omit<Administrador, 'id'>): Promise<Administrador> {
    return prisma.administrador.create({
      data
    })
  }

  async update(id: number, data: Partial<Omit<Administrador, 'id'>>): Promise<Administrador> {
    return prisma.administrador.update({
      where: { id },
      data
    })
  }

  async delete(id: number): Promise<Administrador> {
    return prisma.administrador.delete({
      where: { id }
    })
  }
}

