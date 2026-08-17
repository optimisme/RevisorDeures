import prisma from './prisma';
import { practicaSchema, criteriSchema } from '../validations/schemas';

export interface PracticaCreateInput {
  nom: string;
  descripcio?: string;
}

export interface CriteriCreateInput {
  text: string;
  posicio: number;
}

export class PracticaService {
  async crear(dades: PracticaCreateInput) {
    const validacio = practicaSchema.parse(dades);
    return prisma.practica.create({
      data: {
        ...validacio,
        criteri: {
          create: [],
        },
      },
      include: { criteri: true },
    });
  }

  async llistar() {
    return prisma.practica.findMany({
      include: { criteri: true },
    });
  }

  async obtenir(id: string) {
    return prisma.practica.findUnique({
      where: { id },
      include: { criteri: true },
    });
  }

  async editar(id: string, dades: Partial<PracticaCreateInput>) {
    const validacio = practicaSchema.partial().parse(dades);
    return prisma.practica.update({
      where: { id },
      data: validacio,
    });
  }

  async eliminar(id: string) {
    return prisma.practica.delete({
      where: { id },
    });
  }

  async afegirCriteri(practicaId: string, criteri: CriteriCreateInput) {
    const validacio = criteriSchema.parse(criteri);
    return prisma.criteri.create({
      data: {
        ...validacio,
        practica: { connect: { id: practicaId } },
      },
    });
  }

  async llistarCriteris(practicaId: string) {
    return prisma.criteri.findMany({
      where: { practicaId },
      orderBy: { posicio: 'asc' },
    });
  }

  async eliminarCriteri(criteriId: string) {
    return prisma.criteri.delete({
      where: { id: criteriId },
    });
  }
}

export const practicaService = new PracticaService();
