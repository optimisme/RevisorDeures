import { z } from 'zod';

export const practicaSchema = z.object({
  nom: z.string().min(1),
  descripcio: z.string().optional(),
});

export const criteriSchema = z.object({
  text: z.string().min(1),
  posicio: z.number().int().min(0),
});

export const entregaSchema = z.object({
  urlRepo: z.string().url(),
  estat: z.enum(['PENDING', 'VALIDATING', 'COMPLETED', 'FAILED']).default('PENDING'),
});

export const resultatCriteriSchema = z.object({
  status: z.enum(['PASS', 'FAIL', 'NEEDS_REVIEW']).default('NEEDS_REVIEW'),
  feedback: z.string().optional(),
  evidencia: z.string().optional(),
  estatTecnic: z.string().optional(),
});
