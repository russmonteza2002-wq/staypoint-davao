import { prisma } from '../config/database';
import { comparePassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
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

    const payload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store rotated refresh token in DB
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        refreshToken,
        refreshTokenExpiresAt,
      },
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
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rotates refresh tokens securely: invalidates old refresh token and issues a new pair
   */
  public static async refreshSession(tokenInput: string) {
    if (!tokenInput) {
      throw new UnauthorizedError('Refresh token is required');
    }

    const payload = verifyRefreshToken(tokenInput);

    const admin = await prisma.admin.findUnique({
      where: { id: payload.adminId },
    });

    if (!admin || !admin.refreshToken || !admin.refreshTokenExpiresAt) {
      throw new UnauthorizedError('Session expired or invalidated. Please log in again.');
    }

    // Token reuse detection: if incoming token doesn't match stored token, invalidate session completely
    if (admin.refreshToken !== tokenInput) {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { refreshToken: null, refreshTokenExpiresAt: null },
      });
      throw new UnauthorizedError('Security Warning: Refresh token reuse detected. Session terminated.');
    }

    // Check expiry
    if (new Date() > admin.refreshTokenExpiresAt) {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { refreshToken: null, refreshTokenExpiresAt: null },
      });
      throw new UnauthorizedError('Session expired. Please log in again.');
    }

    // Generate new token pair (rotation)
    const newPayload = {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenExpiresAt: newExpiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Clears stored refresh token on logout
   */
  public static async logout(adminId: string) {
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    });
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
