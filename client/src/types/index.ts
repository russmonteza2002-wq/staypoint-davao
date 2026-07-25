export type RoomStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE' | 'UNAVAILABLE';
export type InquiryStatus = 'NEW' | 'REPLIED' | 'VIEWING_SCHEDULED' | 'CLOSED';
export type SenderType = 'ADMIN' | 'USER';

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
}

export interface RoomAmenity {
  roomId: string;
  amenityId: string;
  amenity: Amenity;
}

export interface RoomImage {
  id: string;
  roomId: string;
  imageUrl: string;
  thumbnailUrl: string;
  caption?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  title: string;
  slug: string;
  description: string;
  pricePerMonth: number;
  depositAmount: number;
  sizeSqm: number;
  floor: number;
  bedroomCount: number;
  bathroomCount: number;
  status: RoomStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  images: RoomImage[];
  amenities: RoomAmenity[];
}

export interface Reply {
  id: string;
  inquiryId: string;
  adminId?: string;
  senderType: SenderType;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  referenceCode: string;
  roomId?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  message: string;
  preferredViewingDate?: string;
  status: InquiryStatus;
  viewedAt?: string;
  repliedAt?: string;
  scheduledAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  room?: {
    id?: string;
    title: string;
    roomNumber: string;
    slug?: string;
  };
  replies?: Reply[];
}

export interface ApartmentInfo {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  googleMapsPlaceId?: string;
  googleMapsEmbedUrl?: string;
  phoneNumber: string;
  email: string;
  facebookUrl?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  reservedRooms: number;
  occupiedRooms: number;
  newInquiries: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
