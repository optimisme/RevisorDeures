import { Request, Response } from 'express';
import { entregaService } from '../services/entrega.service';
import { practicaService } from '../services/practica.service';
import { resultatCriteriService } from '../services/resultat.service';
import { z } from 'zod';

const submitSchema = z.object({
  practicaId: z.string(),
  urlRepo: z.string().url(),
});

export const submitEntrega = async (req: Request, res: Response) => {
  try {
    const parsed = submitSchema.parse(req.body);

    const practica = await practicaService.obtenir(parsed.practicaId);
    if (!practica) {
      return res.status(404).json({ error: 'Practica no trobada' });
    }

    const entrega = await entregaService.crear({
      urlRepo: parsed.urlRepo,
      practicaId: parsed.practicaId,
      estat: 'PENDING',
    });

    return res.status(201).json(entrega);
  } catch {
    return res.status(400).json({ error: 'Dades invalides' });
  }
};

export const getEntrega = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entrega = await entregaService.obtenir(id);

    if (!entrega) {
      return res.status(404).json({ error: 'Entrega no trobada' });
    }

    return res.json(entrega);
  } catch {
    return res.status(500).json({ error: 'Error intern' });
  }
};

export const getLlistatEntregues = async (req: Request, res: Response) => {
  try {
    const { practicaId } = req.params;
    const entregues = await entregaService.llistar(practicaId);

    return res.json(entregues);
  } catch {
    return res.status(500).json({ error: 'Error intern' });
  }
};
