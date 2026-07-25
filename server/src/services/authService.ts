import { prisma } from '../config/database';
import { comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import { LoginInput } from '../validators/auth.validator';

export class AuthService {
  public static async login(input: LoginInput) {
    const cleanEmail = input.email ? input.email.trim().toLowerCase() : '';
    const cleanPassword = input.password ? input.password.trim() : '';

    const admin = await prisma.admin.findUnique({
      where: { email: cleanEmail },
    });

    if (!admin) {
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    const isPasswordValid = await comparePassword(cleanPassword, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password credentials');
    }

    const token = generateToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        adminId: admin.id,
        action: 'ADMIN_LOGIN',
        details: `Admin ${admin.email} logged in successfully`,
      },
    });

    return {
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      token,
    };
  }

  public static async getProfile(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedError('Admin profile not found');
    }

    return admin;
  }
}
