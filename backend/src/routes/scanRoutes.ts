import { Router } from 'express';
import { scanExtension } from '../controllers/scanController';

const router = Router();

router.post('/', scanExtension);

export default router;