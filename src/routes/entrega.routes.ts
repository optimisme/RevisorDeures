import { Router } from 'express';
import {
  submitEntrega,
  getEntrega,
  getLlistatEntregues,
  validarEntrega,
} from '../controllers/entrega.controller';

const router = Router();

router.post('/submit', submitEntrega);
router.get('/:practicaId', getLlistatEntregues);
router.get('/:id', getEntrega);
router.post('/:id/validar', validarEntrega);

export default router;
