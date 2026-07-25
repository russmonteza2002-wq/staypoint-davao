import dns from 'dns';
import { sendInquiryOtpEmail, sendAdminReplyEmail } from './emailService';
import { prisma } from '../config/database';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../utils/errors';
import {
  generateReferenceCode,
  generateAccessToken,
  hashToken,
} from '../utils/hash';
import { InquiryStatus, SenderType } from '@prisma/client';

export class InquiryService {
  private static async verifyEmailDomainExists(email: string): Promise<boolean> {
    try {
      const domain = email.split('@')[1];
      if (!domain) return false;
      const mxRecords = await dns.promises.resolveMx(domain);
      return Array.isArray(mxRecords) && mxRecords.length > 0;
    } catch (error) {
      return false;
    }
  }

  public static async createInquiry(data: any) {
    // 1. Verify that the email domain actually exists and has live MX mail servers
    const isDomainActive = await this.verifyEmailDomainExists(data.userEmail);
    if (!isDomainActive) {
      throw new BadRequestError(
        `The email address domain '${data.userEmail.split('@')[1] || ''}' does not exist or has no active mail servers. Please enter a valid, active personal or work email address (e.g. name@gmail.com).`
      );
    }

    // 2. Verify that the preferred viewing date is not in the past
    if (data.preferredViewingDate) {
      const viewingDate = new Date(data.preferredViewingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(viewingDate.getTime()) || viewingDate < today) {
        throw new BadRequestError(
          'Preferred viewing date cannot be in the past. Please select today or a future date.'
        );
      }
    }

    // 3. Generate 6-digit email OTP verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const referenceCode = generateReferenceCode();
    const { token: rawAccessToken, hash: accessTokenHash } = generateAccessToken();

    const inquiry = await prisma.inquiry.create({
      data: {
        referenceCode,
        accessTokenHash,
        verificationCode,
        isVerified: false,
        roomId: data.roomId || null,
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone || null,
        message: data.message,
        preferredViewingDate: data.preferredViewingDate
          ? new Date(data.preferredViewingDate)
          : null,
        status: InquiryStatus.NEW,
        replies: {
          create: {
            senderType: SenderType.USER,
            senderName: data.userName,
            message: data.message,
          },
        },
      },
      include: {
        room: {
          select: { title: true, roomNumber: true },
        },
      },
    });

    // Send OTP code to the user's REAL email inbox — never expose it in the API response
    await sendInquiryOtpEmail({
      to: data.userEmail,
      userName: data.userName,
      referenceCode: inquiry.referenceCode,
      otpCode: verificationCode,
    });

    // Return only non-sensitive data — verificationCode is NOT included
    return {
      inquiryId: inquiry.id,
      referenceCode: inquiry.referenceCode,
      userEmail: inquiry.userEmail,
      isVerified: false,
      accessToken: rawAccessToken,
    };
  }

  /**
   * Verifies the 6-digit email confirmation code entered by the user
   */
  public static async verifyInquiryCode(referenceCode: string, code: string) {
    const inquiry = await prisma.inquiry.findUnique({
      where: { referenceCode },
    });

    if (!inquiry) {
      throw new NotFoundError(`Inquiry '${referenceCode}' not found`);
    }

    if (inquiry.verificationCode !== code.trim()) {
      throw new BadRequestError('Invalid verification code. Please check the 6-digit code and try again.');
    }

    // Update inquiry as 100% verified and active
    const updatedInquiry = await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: {
        isVerified: true,
        status: InquiryStatus.NEW,
      },
    });

    return {
      success: true,
      referenceCode: updatedInquiry.referenceCode,
      userEmail: updatedInquiry.userEmail,
      isVerified: true,
    };
  }

  /**
   * Resends a fresh 6-digit OTP code to the user's email inbox
   */
  public static async resendVerificationCode(referenceCode: string) {
    const inquiry = await prisma.inquiry.findUnique({
      where: { referenceCode },
    });

    if (!inquiry) {
      throw new NotFoundError(`Inquiry '${referenceCode}' not found`);
    }

    if (inquiry.isVerified) {
      throw new BadRequestError('This inquiry email is already verified.');
    }

    // Generate a fresh 6-digit code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: { verificationCode: newCode },
    });

    // Send fresh code to user's real email inbox
    await sendInquiryOtpEmail({
      to: inquiry.userEmail,
      userName: inquiry.userName,
      referenceCode: inquiry.referenceCode,
      otpCode: newCode,
    });

    return { success: true, userEmail: inquiry.userEmail };
  }

  public static async trackInquiry(referenceCode: string, rawToken?: string) {
    const inquiry = await prisma.inquiry.findUnique({
      where: { referenceCode },
      include: {
        room: {
          select: { id: true, title: true, roomNumber: true, slug: true },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundError(`Inquiry code '${referenceCode}' not found`);
    }

    if (rawToken) {
      const hashedInput = hashToken(rawToken);
      if (hashedInput !== inquiry.accessTokenHash) {
        throw new UnauthorizedError('Invalid access token for this inquiry');
      }
    }

    return inquiry;
  }

  public static async addUserReply(
    referenceCode: string,
    rawAccessToken: string,
    message: string
  ) {
    const inquiry = await this.trackInquiry(referenceCode, rawAccessToken);

    const reply = await prisma.reply.create({
      data: {
        inquiryId: inquiry.id,
        senderType: SenderType.USER,
        senderName: inquiry.userName,
        message,
      },
    });

    await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: { status: InquiryStatus.NEW },
    });

    return reply;
  }

  public static async getAdminInquiries(query: any) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    // ONLY fetch inquiries where isVerified = true so unverified fake emails never clutter admin portal
    const where: any = {
      isVerified: true,
    };

    if (query.status) {
      where.status = query.status as InquiryStatus;
    }

    if (query.roomId) {
      where.roomId = query.roomId;
    }

    if (query.search) {
      where.OR = [
        { referenceCode: { contains: query.search, mode: 'insensitive' } },
        { userName: { contains: query.search, mode: 'insensitive' } },
        { userEmail: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          room: { select: { title: true, roomNumber: true } },
          replies: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    return {
      inquiries,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  public static async getInquiryDetailsAdmin(id: string) {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        room: true,
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    return inquiry;
  }

  public static async adminReply(
    id: string,
    adminId: string,
    message: string,
    updateStatusTo?: InquiryStatus
  ) {
    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    const senderName = admin ? admin.name : 'Property Manager';

    const newStatus = updateStatusTo || InquiryStatus.REPLIED;

    const [reply] = await Promise.all([
      prisma.reply.create({
        data: {
          inquiryId: id,
          adminId,
          senderType: SenderType.ADMIN,
          senderName,
          message,
        },
      }),
      prisma.inquiry.update({
        where: { id },
        data: { status: newStatus },
      }),
    ]);

    // Send email notification to the tenant's real inbox with the manager's reply
    try {
      await sendAdminReplyEmail({
        to: inquiry.userEmail,
        userName: inquiry.userName,
        referenceCode: inquiry.referenceCode,
        replyMessage: message,
      });
    } catch (emailError) {
      // Log but do not throw — reply is already saved, email failure should not break the flow
      console.error('[adminReply] Failed to send reply notification email:', emailError);
    }

    return reply;
  }

  public static async updateStatus(id: string, status: InquiryStatus) {
    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) {
      throw new NotFoundError('Inquiry not found');
    }

    return prisma.inquiry.update({
      where: { id },
      data: { status },
    });
  }
}
