import { Router, Request, Response } from 'express';
import { practicaService } from '../services/practica.service';
import { criteriumService } from '../services/criterium.service';
import { z } from 'zod';
import { practicaSchema, criteriSchema } from '../validations/schemas';

const router = Router();

export const createPractica = async (req: Request, res: Response) => {
  try {
    const dades = practicaSchema.parse(req.body);
    const practica = await practicaService.crear(dades);
    return res.json(practica);
  } catch {
    return res.status(400).json({ error: 'Dades invalides' });
  }
};

export const getLlistatPractiques = async (_req: Request, res: Response) => {
  try {
    const practiques = await practicaService.llistar();
    return res.json(practiques);
  } catch {
    return res.status(500).json({ error: 'Error intern' });
  }
};

export const getPractica = async (req: Request, res: Response) => {
  try {
    const practica = await practicaService.obtenir(req.params.id);

    if (!practica) {
      return res.status(404).json({ error: 'Practica no trobada' });
    }

    return res.json(practica);
  } catch {
    return res.status(500).json({ error: 'Error intern' });
  }
};

export const deletePractica = async (req: Request, res: Response) => {
  try {
    await practicaService.eliminar(req.params.id);
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Error intern' });
  }
};

export const addCriteri = async (req: Request, res: Response) => {
  try {
    const { practicaId } = req.params;
    const dades = criteriSchema.parse(req.body);

    const criteri = await criteriumService.crear({
      ...dades,
      practicaId,
    });

    return res.json(criteri);
  } catch {
    return res.status(400).json({ error: 'Dades invalides' });
  }
};

export const getCriteri = async (req: Request, res: Response) => {
  try {
    const criteri = await criteriumService.obtenir(req.params.id);

    if (!criteri) {
      return res.status(404).json({ error: 'Criteri no trobat' });
    }

    return res.json(criteri);
  } catch {
    return res.status(500).json({ error: 'Error intern' });
  }
};

export const deleteCriteri = async (req: Request, res: Response) => {
  try {
    await criteriumService.eliminar(req.params.id);
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Error intern' });
  }
};

router.post('/practiques', createPractica);
router.get('/practiques', getLlistatPractiques);
router.get('/practiques/:id', getPractica);
router.delete('/practiques/:id', deletePractica);

router.post('/practiques/:practicaId/criteris', addCriteri);
router.get('/criteris/:id', getCriteri);
router.delete('/criteris/:id', deleteCriteri);

export default router;
