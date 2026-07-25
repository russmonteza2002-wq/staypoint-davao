import { apiClient } from './apiClient';
import { Room, Amenity, ApiResponse, RoomStatus } from '../types';

export class RoomService {
  public static async getRooms(params?: Record<string, any>): Promise<ApiResponse<Room[]>> {
    const res = await apiClient.get<ApiResponse<Room[]>>('/rooms', { params });
    return res.data;
  }

  public static async getFeaturedRooms(): Promise<ApiResponse<Room[]>> {
    const res = await apiClient.get<ApiResponse<Room[]>>('/rooms/featured');
    return res.data;
  }

  public static async getRoomBySlug(slug: string): Promise<ApiResponse<Room>> {
    const res = await apiClient.get<ApiResponse<Room>>(`/rooms/${slug}`);
    return res.data;
  }

  public static async getAmenities(): Promise<ApiResponse<Amenity[]>> {
    const res = await apiClient.get<ApiResponse<Amenity[]>>('/rooms/amenities');
    return res.data;
  }

  // Admin APIs
  public static async createRoom(data: any): Promise<ApiResponse<Room>> {
    const res = await apiClient.post<ApiResponse<Room>>('/admin/rooms', data);
    return res.data;
  }

  public static async updateRoom(id: string, data: any): Promise<ApiResponse<Room>> {
    const res = await apiClient.put<ApiResponse<Room>>(`/admin/rooms/${id}`, data);
    return res.data;
  }

  public static async updateRoomStatus(id: string, status: RoomStatus): Promise<ApiResponse<Room>> {
    const res = await apiClient.patch<ApiResponse<Room>>(`/admin/rooms/${id}/status`, { status });
    return res.data;
  }

  public static async deleteRoom(id: string): Promise<ApiResponse<void>> {
    const res = await apiClient.delete<ApiResponse<void>>(`/admin/rooms/${id}`);
    return res.data;
  }

  public static async uploadImages(id: string, formData: FormData): Promise<ApiResponse<any>> {
    const res = await apiClient.post<ApiResponse<any>>(`/admin/rooms/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  public static async deleteImage(imageId: string): Promise<ApiResponse<void>> {
    const res = await apiClient.delete<ApiResponse<void>>(`/admin/images/${imageId}`);
    return res.data;
  }
}
