import { Request, Response } from 'express';
import { entregaService } from '../services/entrega.service';
import { practicaService } from '../services/practica.service';
import { resultatCriteriService } from '../services/resultat.service';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

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

export const validarEntrega = async (req: Request, res: Response) => {
  let repoPath: string | null = null;
  try {
    const { id } = req.params;
    const { repositoryUrl } = req.body;

    if (!repositoryUrl) {
      return res.status(400).json({ error: 'Cal indicar repositoryUrl' });
    }

    const tmpDir = join(tmpdir(), `revisor-${Date.now()}`);
    repoPath = tmpDir;

    await execAsync(`git clone ${repositoryUrl} ${tmpDir}`);

    const entregaValidada = await entregaService.validarEntrega(id, tmpDir);

    await rm(repoPath, { recursive: true, force: true });

    return res.json(entregaValidada);
  } catch (error: any) {
    if (repoPath) {
      await rm(repoPath, { recursive: true, force: true });
    }
    return res.status(500).json({ error: error.message || 'Error en validacio' });
  }
};
