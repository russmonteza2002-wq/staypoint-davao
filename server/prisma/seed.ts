import { PrismaClient, RoomStatus, AdminRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Initial Administrator Account
  const passwordHash = await bcrypt.hash('AdminPass123!', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@apartment.com' },
    update: {
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
    create: {
      name: 'Property Manager',
      email: 'admin@apartment.com',
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
    },
  });
  console.log(`👤 Admin created: ${admin.email}`);

  // 2. Seed Apartment Information Profile (Staypoint Davao)
  const siteInfo = await prisma.apartmentInformation.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      name: 'Staypoint Davao',
      tagline: 'Modern, Secure & Comfort Urban Living in Davao City',
      description:
        'Staypoint Davao offers fully-furnished studio and suite rooms featuring high-speed WiFi, free water supply, individual electric sub-meters, motorcycle parking inside premises, and 1-year lease contracts.',
      address: 'Rizal Extension, Poblacion District',
      city: 'Davao City',
      latitude: 7.073056,
      longitude: 125.612778,
      phoneNumber: '+63 917 555 0199',
      email: 'inquiries@staypointdavao.com',
      facebookUrl: 'https://facebook.com/staypointdavao',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Staypoint Davao',
      tagline: 'Modern, Secure & Comfort Urban Living in Davao City',
      description:
        'Staypoint Davao offers fully-furnished studio and suite rooms featuring high-speed WiFi, free water supply, individual electric sub-meters, motorcycle parking inside premises, and 1-year lease contracts.',
      address: 'Rizal Extension, Poblacion District',
      city: 'Davao City',
      latitude: 7.073056,
      longitude: 125.612778,
      phoneNumber: '+63 917 555 0199',
      email: 'inquiries@staypointdavao.com',
      facebookUrl: 'https://facebook.com/staypointdavao',
    },
  });
  console.log(`🏢 Apartment Profile created: ${siteInfo.name}`);

  // 3. Seed Default Amenities & Building Rules
  const amenityData = [
    { name: 'Free Water Included', icon: 'droplet' },
    { name: 'Own Electric Sub-Meter', icon: 'zap' },
    { name: '1-Year Lease Contract (Min)', icon: 'file-text' },
    { name: 'Motorcycle Parking (Inside)', icon: 'bike' },
    { name: 'No Pets Allowed Policy', icon: 'slash' },
    { name: 'Air Conditioning', icon: 'snowflake' },
    { name: 'High-Speed WiFi', icon: 'wifi' },
    { name: 'Private Balcony', icon: 'sun' },
    { name: 'Private Bathroom', icon: 'bath' },
    { name: 'Kitchenette', icon: 'utensils' },
    { name: '24/7 Security CCTV', icon: 'shield' },
    { name: 'Water Heater', icon: 'flame' },
  ];

  const amenities = [];
  for (const item of amenityData) {
    const amenity = await prisma.amenity.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
    amenities.push(amenity);
  }
  console.log(`✨ Seeded ${amenities.length} amenities`);

  // 4. Seed Sample Room Listings
  const sampleRooms = [
    {
      roomNumber: '101',
      title: 'Deluxe Studio Unit 101',
      slug: 'deluxe-studio-unit-101',
      description:
        'Bright and spacious deluxe studio featuring modern wooden interior accents, full kitchen counter, private bathroom, free water supply, individual electric sub-meter, and motorcycle parking.',
      pricePerMonth: 12500.0,
      depositAmount: 12500.0,
      sizeSqm: 28.5,
      floor: 1,
      bedroomCount: 1,
      bathroomCount: 1,
      status: RoomStatus.AVAILABLE,
      isFeatured: true,
    },
    {
      roomNumber: '202',
      title: 'Executive Suite 202 with Balcony',
      slug: 'executive-suite-202-with-balcony',
      description:
        'Premium executive suite with an extended private balcony, split-type aircon, hot shower, free water supply, sub-metered electricity, and 1-year lease agreement.',
      pricePerMonth: 18000.0,
      depositAmount: 18000.0,
      sizeSqm: 36.0,
      floor: 2,
      bedroomCount: 1,
      bathroomCount: 1,
      status: RoomStatus.AVAILABLE,
      isFeatured: true,
    },
    {
      roomNumber: '305',
      title: 'Standard Single Room 305',
      slug: 'standard-single-room-305',
      description:
        'Cozy single room perfect for working professionals or university students. Fully air-conditioned, free water included, own electric meter.',
      pricePerMonth: 8500.0,
      depositAmount: 8500.0,
      sizeSqm: 20.0,
      floor: 3,
      bedroomCount: 1,
      bathroomCount: 1,
      status: RoomStatus.RESERVED,
      isFeatured: false,
    },
  ];

  for (const r of sampleRooms) {
    const room = await prisma.room.upsert({
      where: { roomNumber: r.roomNumber },
      update: {},
      create: {
        ...r,
        amenities: {
          create: amenities.slice(0, 7).map((a) => ({
            amenity: { connect: { id: a.id } },
          })),
        },
      },
    });
    console.log(`🏠 Room created: ${room.title}`);
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
