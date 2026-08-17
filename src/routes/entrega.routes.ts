import { Router } from 'express';
import {
  submitEntrega,
  getEntrega,
  getLlistatEntregues,
} from '../controllers/entrega.controller';

const router = Router();

router.post('/submit', submitEntrega);
router.get('/:id', getEntrega);
router.get('/:practicaId', getLlistatEntregues);

export default router;
