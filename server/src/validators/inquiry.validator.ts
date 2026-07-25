import { z } from 'zod';

export const createInquirySchema = z.object({
  body: z.object({
    roomId: z.string().uuid('Invalid room ID').optional().nullable(),
    userName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    userEmail: z.string().email('Invalid email address format'),
    userPhone: z.string().max(30).optional().nullable(),
    message: z.string().min(10, 'Message must be at least 10 characters long'),
    preferredViewingDate: z.string().optional().nullable(),
  }),
});

export const userReplySchema = z.object({
  body: z.object({
    accessToken: z.string().min(1, 'Access token is required'),
    message: z.string().min(2, 'Reply message cannot be empty'),
  }),
});

export const adminReplySchema = z.object({
  body: z.object({
    message: z.string().min(2, 'Reply message cannot be empty'),
    updateStatusTo: z
      .enum(['NEW', 'REPLIED', 'VIEWING_SCHEDULED', 'CLOSED'])
      .optional(),
  }),
});

export const updateInquiryStatusSchema = z.object({
  body: z.object({
    status: z.enum(['NEW', 'REPLIED', 'VIEWING_SCHEDULED', 'CLOSED']),
  }),
});
