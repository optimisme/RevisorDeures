import { Router } from 'express';
import {
  submitEntrega,
  getEntrega,
  getLlistatEntregues,
  validarEntrega,
} from '../controllers/entrega.controller';

const router = Router();

router.post('/submit', submitEntrega);
router.get('/:id', getEntrega);
router.get('/:practicaId', getLlistatEntregues);
router.post('/:id/validar', validarEntrega);

export default router;
