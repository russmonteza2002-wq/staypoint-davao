import { z } from 'zod';

// Strict regex pattern requiring valid domain extension (.com, .ph, .net, .org, .edu, etc.)
const VALID_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const createInquirySchema = z.object({
  body: z.object({
    roomId: z.string().uuid('Invalid room ID').optional().nullable(),
    userName: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long'),
    userEmail: z
      .string()
      .trim()
      .lowercase()
      .email('Please enter a valid email address format')
      .refine((email) => VALID_EMAIL_REGEX.test(email), {
        message: 'Please enter a valid email address with a domain extension (e.g., name@gmail.com)',
      })
      .refine(
        (email) =>
          !['test@test.com', 'admin@admin.com', 'abc@abc.com', 'user@example.com'].includes(email),
        {
          message: 'Please enter a real, active personal or work email address',
        }
      ),
    userPhone: z.string().max(30).optional().nullable(),
    message: z
      .string()
      .trim()
      .min(10, 'Message must be at least 10 characters long')
      .max(2000, 'Message cannot exceed 2000 characters'),
    preferredViewingDate: z.string().optional().nullable(),
  }),
});

export const userReplySchema = z.object({
  body: z.object({
    accessToken: z.string().min(1, 'Access token is required'),
    message: z.string().trim().min(2, 'Reply message cannot be empty'),
  }),
});

export const adminReplySchema = z.object({
  body: z.object({
    message: z.string().trim().min(2, 'Reply message cannot be empty'),
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
