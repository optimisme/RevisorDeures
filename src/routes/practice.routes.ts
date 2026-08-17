import { Router } from 'express';
import { submitPracticeHandler } from '../controllers/practiceController';
import { checkRepoHandler } from '../controllers/repoController';

const router = Router();

router.post('/practices/submit', submitPracticeHandler);
router.get('/repos/check', checkRepoHandler);

export default router;
