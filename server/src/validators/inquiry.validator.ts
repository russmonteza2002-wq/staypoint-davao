import { z } from 'zod';

// Strict regex pattern requiring valid domain extension (.com, .ph, .net, .org, .edu, etc.)
const VALID_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// List of disposable, temporary, and test email domains to block
const DISPOSABLE_DOMAINS = [
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'yopmail.com',
  'trashmail.com',
  'dispostable.com',
  'getairmail.com',
  'throwawaymail.com',
  'maildrop.cc',
  'example.com',
  'test.com',
];

// Suspicious / keyboard mash patterns in email usernames
const SUSPICIOUS_PATTERNS = [
  /^asdf/i,
  /^qwerty/i,
  /^zxcv/i,
  /^12345/i,
  /^test/i,
  /^fake/i,
  /^none/i,
];

// Valid Philippine phone number regex (+63 9XXXXXXXXX or 09XXXXXXXXX)
const PH_PHONE_REGEX = /^(?:\+63|0)9\d{9}$/;

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
        (email) => {
          const domain = email.split('@')[1];
          return domain ? !DISPOSABLE_DOMAINS.includes(domain) : true;
        },
        {
          message: 'Disposable or temporary email addresses are not allowed. Please use your main active email.',
        }
      )
      .refine(
        (email) => {
          const username = email.split('@')[0] || '';
          return !SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(username));
        },
        {
          message: 'Please provide a legitimate personal or work email address.',
        }
      ),
    userPhone: z
      .string()
      .trim()
      .min(1, 'Active phone number is required so the property manager can contact you')
      .refine((phone) => PH_PHONE_REGEX.test(phone.replace(/\s+/g, '')), {
        message: 'Please enter a valid Philippine mobile number (e.g. 09171234567 or +639171234567)',
      }),
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
