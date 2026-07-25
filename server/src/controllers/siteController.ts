import { Request, Response, NextFunction } from 'express';
import { SiteService } from '../services/siteService';

export class SiteController {
  public static getSiteInformation = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const info = await SiteService.getSiteInformation();
      res.status(200).json({
        success: true,
        data: info,
      });
    } catch (error) {
      next(error);
    }
  };

  public static updateSiteInformation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updated = await SiteService.updateSiteInformation(req.body);
      res.status(200).json({
        success: true,
        message: 'Apartment information updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getDashboardStats = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stats = await SiteService.getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}
