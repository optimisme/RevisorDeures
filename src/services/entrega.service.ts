import prisma from './prisma';
import { entregaSchema } from '../validations/schemas';
import { openCodeRuntimeService } from './openCodeRuntime';
import { resultatCriteriService } from './resultat.service';
import { Logger } from '../utils/logger';

export interface EntregaCreateInput {
  urlRepo: string;
  practicaId: string;
  estat?: 'PENDING' | 'VALIDATING' | 'COMPLETED' | 'FAILED';
}

export class EntregaService {
  async crear(dades: EntregaCreateInput) {
    const validacio = entregaSchema.parse(dades);
    Logger.info('Creant nova entrega', { urlRepo: dades.urlRepo });
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

  async validarEntrega(entregaId: string, repoPath: string) {
    const entrega = await prisma.entrega.findUnique({
      where: { id: entregaId },
      include: { practica: { include: { criteri: true } } },
    });

    if (!entrega) {
      throw new Error('Entrega no trobada');
    }

    Logger.info('Iniciant validacio entrega', { entregaId });
    await this.actualitzarEstat(entregaId, 'VALIDATING');

    const resultats = [];

    for (const criteri of entrega.practica.criteri) {
      Logger.debug('Validant criteri', { criteriId: criteri.id, entregaId });
      const resultat = await openCodeRuntimeService.runReview(
        repoPath,
        criteri.text,
        entrega.practicaId,
        criteri.id
      );

      await resultatCriteriService.crear(
        entregaId,
        criteri.id,
        {
          status: resultat.status,
          feedback: resultat.feedback,
          evidencia: resultat.evidence?.join('\n'),
        }
      );

      resultats.push(resultat);
      Logger.info(`Criteri ${criteri.id} validat`, { status: resultat.status });
    }

    const teFail = resultats.some((r) => r.status === 'FAIL');
    const teNeedsReview = resultats.some((r) => r.status === 'NEEDS_REVIEW');

    let estatFinal = 'COMPLETED';
    if (teFail) estatFinal = 'FAILED';
    else if (teNeedsReview) estatFinal = 'NEEDS_REVIEW';

    await this.actualitzarEstat(entregaId, estatFinal);

    Logger.info('Validacio entrega completada', { entregaId, estatFinal });
    return this.obtenir(entregaId);
  }
}

export const entregaService = new EntregaService();
