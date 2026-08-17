import { Request, Response } from 'express';
import { repoValidationService } from '../services/repoValidation';
import { z } from 'zod';

export const checkRepoHandler = async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      url: z.string(),
    });

    const parsed = schema.parse(req.query);

    const result = await repoValidationService.validateUrl(parsed.url);

    res.json({ valid: result });
  } catch (error) {
    res.status(400).json({ error: 'Invalid repository URL' });
  }
};
