import prisma from './prisma';
import { resultatCriteriSchema } from '../validations/schemas';

export interface ResultatCreateInput {
  status?: 'PASS' | 'FAIL' | 'NEEDS_REVIEW';
  feedback?: string;
  evidencia?: string;
  estatTecnic?: string;
}

export class ResultatCriteriService {
  async crear(entregaId: string, criteriId: string, dades: ResultatCreateInput) {
    const validacio = resultatCriteriSchema.parse(dades);
    return prisma.resultatCriteri.create({
      data: {
        ...validacio,
        entrega: { connect: { id: entregaId } },
        criteri: { connect: { id: criteriId } },
      },
    });
  }

  async obtenir(entregaId: string, criteriId: string) {
    return prisma.resultatCriteri.findFirst({
      where: { entregaId, criteriId },
    });
  }

  async llistarPerEntrega(entregaId: string) {
    return prisma.resultatCriteri.findMany({
      where: { entregaId },
      include: { criteri: true },
    });
  }

  async actualitzar(id: string, dades: Partial<ResultatCreateInput>) {
    const validacio = resultatCriteriSchema.partial().parse(dades);
    return prisma.resultatCriteri.update({
      where: { id },
      data: validacio,
    });
  }

  async obtenirPerEntrega(entregaId: string) {
    return prisma.resultatCriteri.findMany({
      where: { entregaId },
      include: { criteri: true },
      orderBy: { criteri: { posicio: 'asc' } },
    });
  }
}
