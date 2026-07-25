import { Request, Response, NextFunction } from 'express';
import { RoomService } from '../services/roomService';
import { BadRequestError } from '../utils/errors';

export class RoomController {
  public static getPublicRooms = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await RoomService.getPublicRooms(req.query);
      res.status(200).json({
        success: true,
        data: result.rooms,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getFeaturedRooms = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const rooms = await RoomService.getFeaturedRooms();
      res.status(200).json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getRoomBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { slug } = req.params;
      const room = await RoomService.getRoomBySlug(slug);
      res.status(200).json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  };

  public static createRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const room = await RoomService.createRoom(req.body);
      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  };

  public static updateRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const room = await RoomService.updateRoom(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Room updated successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  };

  public static updateRoomStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const room = await RoomService.updateRoomStatus(id, status);
      res.status(200).json({
        success: true,
        message: 'Room status updated successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  };

  public static deleteRoom = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await RoomService.deleteRoom(id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  public static uploadRoomImages = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new BadRequestError('No image files provided');
      }

      const images = await RoomService.addRoomImages(id, files);
      res.status(201).json({
        success: true,
        message: 'Images uploaded and processed successfully',
        data: images,
      });
    } catch (error) {
      next(error);
    }
  };

  public static deleteRoomImage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { imageId } = req.params;
      const result = await RoomService.deleteRoomImage(imageId);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}
