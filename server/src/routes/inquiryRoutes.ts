import { Router } from 'express';
import { InquiryController } from '../controllers/inquiryController';
import { validateRequest } from '../middlewares/validateRequest';
import { createInquirySchema, userReplySchema } from '../validators/inquiry.validator';
import { inquiryLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post(
  '/',
  inquiryLimiter,
  validateRequest(createInquirySchema),
  InquiryController.createInquiry
);

router.post('/verify-code', InquiryController.verifyInquiryCode);
router.post('/resend-code', InquiryController.resendVerificationCode);

router.get('/track/:refCode', InquiryController.trackInquiry);

router.post(
  '/track/:refCode/reply',
  validateRequest(userReplySchema),
  InquiryController.addUserReply
);

export default router;
