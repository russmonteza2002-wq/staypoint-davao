import { z } from 'zod';

export const createRoomSchema = z.object({
  body: z.object({
    roomNumber: z.string().min(1, 'Room number is required').max(20),
    title: z.string().min(3, 'Title must be at least 3 characters').max(150),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    pricePerMonth: z.number().positive('Price per month must be greater than 0'),
    depositAmount: z.number().min(0, 'Deposit amount cannot be negative'),
    sizeSqm: z.number().positive('Room size must be greater than 0'),
    floor: z.number().int('Floor must be an integer'),
    bedroomCount: z.number().int().min(1).default(1),
    bathroomCount: z.number().int().min(1).default(1),
    status: z.enum(['AVAILABLE', 'RESERVED', 'OCCUPIED']).default('AVAILABLE'),
    isFeatured: z.boolean().default(false),
    amenityIds: z.array(z.string().uuid()).optional().default([]),
  }),
});

export const updateRoomSchema = z.object({
  body: createRoomSchema.shape.body.partial(),
});

export const updateRoomStatusSchema = z.object({
  body: z.object({
    status: z.enum(['AVAILABLE', 'RESERVED', 'OCCUPIED']),
  }),
});

export const getRoomsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['AVAILABLE', 'RESERVED', 'OCCUPIED']).optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    floor: z.string().optional(),
    amenityId: z.string().optional(),
    search: z.string().optional(),
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
  }),
});
