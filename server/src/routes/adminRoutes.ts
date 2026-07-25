import { Router } from 'express';
import { RoomController } from '../controllers/roomController';
import { InquiryController } from '../controllers/inquiryController';
import { SiteController } from '../controllers/siteController';
import { authenticateAdmin } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { uploadRoomImages } from '../middlewares/uploadMiddleware';
import {
  createRoomSchema,
  updateRoomSchema,
  updateRoomStatusSchema,
} from '../validators/room.validator';
import {
  adminReplySchema,
  updateInquiryStatusSchema,
} from '../validators/inquiry.validator';

const router = Router();

// Protect all admin endpoints with JWT authentication middleware
router.use(authenticateAdmin);

// Admin Dashboard & Metrics
router.get('/dashboard/stats', SiteController.getDashboardStats);

// Admin Room Management
router.post('/rooms', validateRequest(createRoomSchema), RoomController.createRoom);
router.put('/rooms/:id', validateRequest(updateRoomSchema), RoomController.updateRoom);
router.patch('/rooms/:id/status', validateRequest(updateRoomStatusSchema), RoomController.updateRoomStatus);
router.delete('/rooms/:id', RoomController.deleteRoom);

// Room Images Management
router.post('/rooms/:id/images', uploadRoomImages.array('images', 10), RoomController.uploadRoomImages);
router.delete('/images/:imageId', RoomController.deleteRoomImage);

// Admin Inquiry Management
router.get('/inquiries', InquiryController.getAdminInquiries);
router.get('/inquiries/:id', InquiryController.getInquiryDetailsAdmin);
router.post('/inquiries/:id/reply', validateRequest(adminReplySchema), InquiryController.adminReply);
router.patch('/inquiries/:id/status', validateRequest(updateInquiryStatusSchema), InquiryController.updateStatus);

// Site Settings
router.put('/site/info', SiteController.updateSiteInformation);

export default router;
