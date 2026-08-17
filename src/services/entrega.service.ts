import prisma from './prisma';
import { entregaSchema } from '../validations/schemas';

export interface EntregaCreateInput {
  urlRepo: string;
  practicaId: string;
  estat?: 'PENDING' | 'VALIDATING' | 'COMPLETED' | 'FAILED';
}

export class EntregaService {
  async crear(dades: EntregaCreateInput) {
    const validacio = entregaSchema.parse(dades);
    return prisma.entrega.create({
      data: {
        ...validacio,
        practica: { connect: { id: dades.practicaId } },
      },
    });
  }

  async llistar(practicaId: string) {
    return prisma.entrega.findMany({
      where: { practicaId },
      include: { resultats: { include: { criteri: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async obtenir(id: string) {
    return prisma.entrega.findUnique({
      where: { id },
      include: { resultats: { include: { criteri: true } } },
    });
  }

  async actualitzarEstat(id: string, estat: string) {
    return prisma.entrega.update({
      where: { id },
      data: { estat },
    });
  }

  async obtenirPerURL(perPracticaId: string, urlRepo: string) {
    return prisma.entrega.findFirst({
      where: { practicaId: perPracticaId, urlRepo },
      include: { resultats: { include: { criteri: true } } },
    });
  }
}

export const entregaService = new EntregaService();
