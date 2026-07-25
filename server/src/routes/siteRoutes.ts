import { Router } from 'express';
import { SiteController } from '../controllers/siteController';

const router = Router();

router.get('/info', SiteController.getSiteInformation);

export default router;
