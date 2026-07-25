import { apiClient } from './apiClient';
import { AdminUser, ApiResponse } from '../types';

export class AuthService {
  public static async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ admin: AdminUser; token: string }>> {
    const res = await apiClient.post<ApiResponse<{ admin: AdminUser; token: string }>>('/auth/login', credentials);
    return res.data;
  }

  public static async getProfile(): Promise<ApiResponse<AdminUser>> {
    const res = await apiClient.get<ApiResponse<AdminUser>>('/auth/me');
    return res.data;
  }

  public static async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('admin_token');
    }
  }
}
