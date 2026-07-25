import { apiClient } from './apiClient';
import { Inquiry, Reply, ApiResponse, InquiryStatus } from '../types';

export class InquiryService {
  public static async createInquiry(data: any): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>('/inquiries', data);
    return res.data;
  }

  public static async verifyInquiryCode(referenceCode: string, code: string): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>('/inquiries/verify-code', {
      referenceCode,
      code,
    });
    return res.data;
  }

  public static async resendVerificationCode(referenceCode: string): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>('/inquiries/resend-code', { referenceCode });
    return res.data;
  }

  public static async trackInquiry(refCode: string, token?: string): Promise<ApiResponse<Inquiry>> {
    const res = await apiClient.get<ApiResponse<Inquiry>>(`/inquiries/track/${refCode}`, {
      params: { token },
    });
    return res.data;
  }

  public static async addUserReply(refCode: string, accessToken: string, message: string): Promise<ApiResponse<Reply>> {
    const res = await apiClient.post<ApiResponse<Reply>>(`/inquiries/track/${refCode}/reply`, {
      accessToken,
      message,
    });
    return res.data;
  }

  // Admin APIs
  public static async getAdminInquiries(params?: Record<string, any>): Promise<ApiResponse<Inquiry[]>> {
    const res = await apiClient.get<ApiResponse<Inquiry[]>>('/admin/inquiries', { params });
    return res.data;
  }

  public static async getInquiryDetailsAdmin(id: string): Promise<ApiResponse<Inquiry>> {
    const res = await apiClient.get<ApiResponse<Inquiry>>(`/admin/inquiries/${id}`);
    return res.data;
  }

  public static async adminReply(id: string, message: string, updateStatusTo?: InquiryStatus): Promise<ApiResponse<Reply>> {
    const res = await apiClient.post<ApiResponse<Reply>>(`/admin/inquiries/${id}/reply`, {
      message,
      updateStatusTo,
    });
    return res.data;
  }

  public static async updateStatus(id: string, status: InquiryStatus): Promise<ApiResponse<Inquiry>> {
    const res = await apiClient.patch<ApiResponse<Inquiry>>(`/admin/inquiries/${id}/status`, { status });
    return res.data;
  }
}
