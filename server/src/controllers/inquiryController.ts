import { Request, Response, NextFunction } from 'express';
import { InquiryService } from '../services/inquiryService';

export class InquiryController {
  public static createInquiry = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await InquiryService.createInquiry(req.body);
      res.status(201).json({
        success: true,
        message: 'Inquiry submitted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public static verifyInquiryCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { referenceCode, code } = req.body;
      const result = await InquiryService.verifyInquiryCode(referenceCode, code);
      res.status(200).json({
        success: true,
        message: 'Email verified successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public static trackInquiry = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refCode } = req.params;
      const accessToken = req.query.token as string | undefined;
      const inquiry = await InquiryService.trackInquiry(refCode, accessToken);
      res.status(200).json({
        success: true,
        data: inquiry,
      });
    } catch (error) {
      next(error);
    }
  };

  public static addUserReply = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refCode } = req.params;
      const { accessToken, message } = req.body;
      const reply = await InquiryService.addUserReply(
        refCode,
        accessToken,
        message
      );
      res.status(201).json({
        success: true,
        message: 'Reply sent successfully',
        data: reply,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getAdminInquiries = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await InquiryService.getAdminInquiries(req.query);
      res.status(200).json({
        success: true,
        data: result.inquiries,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  public static getInquiryDetailsAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const inquiry = await InquiryService.getInquiryDetailsAdmin(id);
      res.status(200).json({
        success: true,
        data: inquiry,
      });
    } catch (error) {
      next(error);
    }
  };

  public static adminReply = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.admin!.adminId;
      const { message, updateStatusTo } = req.body;

      const reply = await InquiryService.adminReply(
        id,
        adminId,
        message,
        updateStatusTo
      );

      res.status(201).json({
        success: true,
        message: 'Reply sent successfully',
        data: reply,
      });
    } catch (error) {
      next(error);
    }
  };

  public static updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const inquiry = await InquiryService.updateStatus(id, status);
      res.status(200).json({
        success: true,
        message: 'Inquiry status updated successfully',
        data: inquiry,
      });
    } catch (error) {
      next(error);
    }
  };
}
