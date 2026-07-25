import { prisma } from '../config/database';

export class SiteService {
  public static async getSiteInformation() {
    let siteInfo = await prisma.apartmentInformation.findFirst();

    // Default fallback property metadata if database is newly initialized
    if (!siteInfo) {
      siteInfo = await prisma.apartmentInformation.create({
        data: {
          name: 'Grand Horizon Apartments',
          tagline: 'Modern Living Spaces in the Heart of the City',
          description: 'Grand Horizon Apartments offers premium, fully-furnished room units equipped with high-speed internet, 24/7 security, and modern amenities.',
          address: '123 Innovation Boulevard',
          city: 'Metropolis',
          latitude: 14.599512,
          longitude: 120.984222,
          phoneNumber: '+1 (555) 234-5678',
          email: 'inquiries@grandhorizon.com',
          facebookUrl: 'https://facebook.com/grandhorizonapartments',
        },
      });
    }

    return siteInfo;
  }

  public static async updateSiteInformation(data: any) {
    const existing = await prisma.apartmentInformation.findFirst();

    if (existing) {
      return prisma.apartmentInformation.update({
        where: { id: existing.id },
        data,
      });
    }

    return prisma.apartmentInformation.create({
      data,
    });
  }

  public static async getDashboardStats() {
    const [totalRooms, availableRooms, reservedRooms, occupiedRooms, newInquiries] =
      await Promise.all([
        prisma.room.count(),
        prisma.room.count({ where: { status: 'AVAILABLE' } }),
        prisma.room.count({ where: { status: 'RESERVED' } }),
        prisma.room.count({ where: { status: 'OCCUPIED' } }),
        prisma.inquiry.count({ where: { status: 'NEW' } }),
      ]);

    return {
      totalRooms,
      availableRooms,
      reservedRooms,
      occupiedRooms,
      newInquiries,
    };
  }
}
