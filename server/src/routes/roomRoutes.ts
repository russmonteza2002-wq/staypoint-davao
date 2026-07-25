import { Router } from 'express';
import { RoomController } from '../controllers/roomController';
import { validateRequest } from '../middlewares/validateRequest';
import { getRoomsQuerySchema } from '../validators/room.validator';
import { prisma } from '../config/database';

const router = Router();

router.get('/', validateRequest(getRoomsQuerySchema), RoomController.getPublicRooms);
router.get('/featured', RoomController.getFeaturedRooms);
router.get('/amenities', async (_req, res, next) => {
  try {
    const amenities = await prisma.amenity.findMany({ orderBy: { name: 'asc' } });
    res.status(200).json({ success: true, data: amenities });
  } catch (error) {
    next(error);
  }
});
router.get('/:slug', RoomController.getRoomBySlug);

export default router;
