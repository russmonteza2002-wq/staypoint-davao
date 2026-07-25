import dns from 'dns';
import { prisma } from '../config/database';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../utils/errors';
import {
  generateReferenceCode,
  generateAccessToken,
  hashToken,
} from '../utils/hash';
import { InquiryStatus, SenderType } from '@prisma/client';

export class InquiryService {
  /**
   * Performs DNS MX (Mail Exchange) record lookup to verify if the email domain actually exists
   * and is configured to receive emails.
   */
  private static async verifyEmailDomainExists(email: string): Promise<boolean> {
    try {
      const domain = email.split('@')[1];
      if (!domain) return false;
      
      // Look up Mail Exchange (MX) DNS records for the domain
      const mxRecords = await dns.promises.resolveMx(domain);
      return Array.isArray(mxRecords) && mxRecords.length > 0;
    } catch (error) {
      // Domain has no MX records or DNS lookup failed
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

    const referenceCode = generateReferenceCode();
    const { token: rawAccessToken, hash: accessTokenHash } = generateAccessToken();

    const inquiry = await prisma.inquiry.create({
      data: {
        referenceCode,
        accessTokenHash,
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

    return {
      inquiry: {
        id: inquiry.id,
        referenceCode: inquiry.referenceCode,
        status: inquiry.status,
        userName: inquiry.userName,
        createdAt: inquiry.createdAt,
      },
      accessToken: rawAccessToken,
    };
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

    const where: any = {};

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
