import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as any,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  public static login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await AuthService.login(req.body);

      // Set HttpOnly Secure Refresh Cookie
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          admin: result.admin,
          accessToken: result.accessToken,
          token: result.accessToken, // Backward compatibility
        },
      });
    } catch (error: any) {
      console.error('🔑 LOGIN_ATTEMPT_FAILED:', {
        email: req.body?.email,
        errorMessage: error.message,
      });
      next(error);
    }
  };

  public static refreshSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const result = await AuthService.refreshSession(refreshToken);

      // Set rotated HttpOnly Cookie
      res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

      res.status(200).json({
        success: true,
        message: 'Session refreshed successfully',
        data: {
          admin: result.admin,
          accessToken: result.accessToken,
          token: result.accessToken,
        },
      });
    } catch (error) {
      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
      next(error);
    }
  };

  public static getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const adminId = req.admin!.adminId;
      const profile = await AuthService.getProfile(adminId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };

  public static logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (req.admin?.adminId) {
        await AuthService.logout(req.admin.adminId);
      }
      res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
