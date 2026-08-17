import prisma from './prisma';
import { criteriSchema } from '../validations/schemas';

export interface CriteriCreateInput {
  text: string;
  practicaId: string;
  peso?: number;
}

export class CriteriService {
  async crear(dades: CriteriCreateInput) {
    const validacio = criteriSchema.parse(dades);
    return prisma.criteri.create({
      data: {
        ...validacio,
        practica: { connect: { id: dades.practicaId } },
      },
    });
  }

  async llistar(practicaId: string) {
    return prisma.criteri.findMany({
      where: { practicaId },
      orderBy: { id: 'asc' },
    });
  }

  async obtenir(id: string) {
    return prisma.criteri.findUnique({
      where: { id },
      include: { practica: true },
    });
  }

  async obtenirPerPractica(practicaId: string) {
    return prisma.criteri.findMany({
      where: { practicaId },
    });
  }

  async eliminar(id: string) {
    return prisma.criteri.delete({
      where: { id },
    });
  }
}

export const criteriumService = new CriteriService();
