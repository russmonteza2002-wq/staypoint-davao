import { prisma } from '../config/database';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import {
  generateReferenceCode,
  generateAccessToken,
  hashToken,
} from '../utils/hash';
import { InquiryStatus, SenderType } from '@prisma/client';

export class InquiryService {
  public static async createInquiry(data: any) {
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
