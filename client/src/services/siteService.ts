import { apiClient } from './apiClient';
import { ApartmentInfo, DashboardStats, ApiResponse } from '../types';

export class SiteService {
  public static async getSiteInfo(): Promise<ApiResponse<ApartmentInfo>> {
    const res = await apiClient.get<ApiResponse<ApartmentInfo>>('/site/info');
    return res.data;
  }

  public static async updateSiteInfo(data: Partial<ApartmentInfo>): Promise<ApiResponse<ApartmentInfo>> {
    const res = await apiClient.put<ApiResponse<ApartmentInfo>>('/admin/site/info', data);
    return res.data;
  }

  public static async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
    return res.data;
  }
}
