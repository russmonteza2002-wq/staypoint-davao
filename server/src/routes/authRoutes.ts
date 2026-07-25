import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middlewares/validateRequest';
import { loginSchema } from '../validators/auth.validator';
import { authenticateAdmin } from '../middlewares/authMiddleware';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticateAdmin, AuthController.getProfile);
router.post('/logout', authenticateAdmin, AuthController.logout);

export default router;
