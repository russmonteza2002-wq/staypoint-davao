import { prisma } from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { RoomStatus } from '@prisma/client';
import { ImageService } from './imageService';

export class RoomService {
  private static generateSlug(title: string, roomNumber: string): string {
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
    return `${cleanTitle}-unit-${roomNumber.toLowerCase()}`;
  }

  public static async getPublicRooms(query: any) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status as RoomStatus;
    }

    if (query.minPrice || query.maxPrice) {
      where.pricePerMonth = {};
      if (query.minPrice) where.pricePerMonth.gte = parseFloat(query.minPrice);
      if (query.maxPrice) where.pricePerMonth.lte = parseFloat(query.maxPrice);
    }

    if (query.floor) {
      where.floor = parseInt(query.floor, 10);
    }

    if (query.amenityId) {
      where.amenities = {
        some: {
          amenityId: query.amenityId,
        },
      };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { roomNumber: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          },
          amenities: {
            include: {
              amenity: true,
            },
          },
        },
      }),
      prisma.room.count({ where }),
    ]);

    return {
      rooms,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async getFeaturedRooms() {
    return prisma.room.findMany({
      where: { isFeatured: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });
  }

  public static async getRoomBySlug(slug: string) {
    const room = await prisma.room.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundError(`Room with slug '${slug}' not found`);
    }

    return room;
  }

  public static async createRoom(data: any) {
    const existingRoom = await prisma.room.findUnique({
      where: { roomNumber: data.roomNumber },
    });

    if (existingRoom) {
      throw new ConflictError(`Room number '${data.roomNumber}' already exists`);
    }

    const slug = this.generateSlug(data.title, data.roomNumber);

    const { amenityIds, ...roomData } = data;

    return prisma.room.create({
      data: {
        ...roomData,
        slug,
        ...(amenityIds && amenityIds.length > 0 && {
          amenities: {
            create: amenityIds.map((id: string) => ({
              amenity: { connect: { id } },
            })),
          },
        }),
      },
      include: {
        images: true,
        amenities: { include: { amenity: true } },
      },
    });
  }

  public static async updateRoom(id: string, data: any) {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    let slug = room.slug;
    if (data.title || data.roomNumber) {
      const newTitle = data.title || room.title;
      const newRoomNumber = data.roomNumber || room.roomNumber;
      slug = this.generateSlug(newTitle, newRoomNumber);
    }

    const { amenityIds, ...roomData } = data;

    if (amenityIds !== undefined) {
      await prisma.roomAmenity.deleteMany({ where: { roomId: id } });
    }

    return prisma.room.update({
      where: { id },
      data: {
        ...roomData,
        slug,
        ...(amenityIds !== undefined && {
          amenities: {
            create: amenityIds.map((amenityId: string) => ({
              amenity: { connect: { id: amenityId } },
            })),
          },
        }),
      },
      include: {
        images: true,
        amenities: { include: { amenity: true } },
      },
    });
  }

  public static async updateRoomStatus(id: string, status: RoomStatus) {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    return prisma.room.update({
      where: { id },
      data: { status },
    });
  }

  public static async deleteRoom(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!room) {
      throw new NotFoundError('Room not found');
    }

    for (const img of room.images) {
      await ImageService.deleteImageFile(img.imageUrl);
      await ImageService.deleteImageFile(img.thumbnailUrl);
    }

    await prisma.room.delete({ where: { id } });
    return { message: 'Room deleted successfully' };
  }

  public static async addRoomImages(roomId: string, files: Express.Multer.File[]) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundError('Room not found');
    }

    const imageRecords = [];
    const existingImagesCount = await prisma.roomImage.count({ where: { roomId } });

    for (let i = 0; i < files.length; i++) {
      const processed = await ImageService.processAndSaveRoomImage(files[i].buffer);
      const isPrimary = existingImagesCount === 0 && i === 0;

      const record = await prisma.roomImage.create({
        data: {
          roomId,
          imageUrl: processed.imageUrl,
          thumbnailUrl: processed.thumbnailUrl,
          isPrimary,
          sortOrder: existingImagesCount + i,
        },
      });
      imageRecords.push(record);
    }

    return imageRecords;
  }

  public static async deleteRoomImage(imageId: string) {
    const image = await prisma.roomImage.findUnique({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundError('Image not found');
    }

    await ImageService.deleteImageFile(image.imageUrl);
    await ImageService.deleteImageFile(image.thumbnailUrl);

    await prisma.roomImage.delete({ where: { id: imageId } });
    return { message: 'Image deleted successfully' };
  }
}
