import { PrismaClient, Status } from '@prisma/client';

const prisma = new PrismaClient();

interface UpdateClientSiteData {
  clientName?: string;
  clientUrl?: string;
  status?: Status;
  keywords?: string[];
  emailEnvied?: boolean;
  responseTime?: number;
}


class ClientSiteRepository {
  async createClientSite(data: {
    clientName: string;
    clientUrl: string;
    status: Status;
    keywords: string[];
  }) {
    return await prisma.clientSite.create({
      data,
    });
  }

  async getClientSiteById(id: number) {
    return await prisma.clientSite.findUnique({
      where: { id },
    });
  }

async getAllClientSites() {
  return await prisma.clientSite.findMany({
    select: {
      id: true,
      clientName: true,
      clientUrl: true,
      status: true,
      emailEnvied: true,
      responseTime: true,  // Garantindo que o campo responseTime seja retornado
      keywords: true,
      createdAt: true,
    },
  });
}


  async updateClientSite(
    id: number,
    data: UpdateClientSiteData
  ) {
    return await prisma.clientSite.update({
      where: { id },
      data,
    });
  }

  async deleteClientSite(id: number) {
    return await prisma.clientSite.delete({
      where: { id },
    });
  }
}

export const clientSiteRepository = new ClientSiteRepository();

