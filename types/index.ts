/**
 * Type definitions for EstateVision platform
 * Centralized types for the entire application
 */

/* ==================== ENUMS ==================== */
export enum PropertyType {
  APARTMENT = 'Apartment',
  VILLA = 'Villa',
  PLOT = 'Plot',
  COMMERCIAL = 'Commercial',
  PENTHOUSE = 'Penthouse',
}

export enum PropertyStatus {
  READY_TO_MOVE = 'Ready to Move',
  UNDER_CONSTRUCTION = 'Under Construction',
  RESALE = 'Resale',
}

export enum FurnishedType {
  FULLY = 'Fully',
  SEMI = 'Semi',
  UNFURNISHED = 'Unfurnished',
}

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  AGENT = 'agent',
  ADMIN = 'admin',
}

export enum UserPlan {
  FREE = 'free',
  PREMIUM = 'premium',
}

export enum BookingType {
  SITE_VISIT = 'site_visit',
  VIDEO_CALL = 'video_call',
  PHONE_CALL = 'phone_call',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum LandmarkType {
  AIRPORT = 'airport',
  RAILWAY = 'railway',
  HOSPITAL = 'hospital',
  SCHOOL = 'school',
  MALL = 'mall',
  OFFICE = 'office',
  METRO = 'metro',
}

/* ==================== INTERFACES ==================== */

export interface Landmark {
  name: string;
  type: LandmarkType;
  icon: string;
  lat: number;
  lng: number;
  distanceKm: number;
  driveTimeMin: number;
  walkTimeMin?: number;
}

export interface Location {
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
}

export interface PropertySpecs {
  beds: number;
  baths: number;
  sqft: number;
  floor: string;
  totalFloors: number;
  parking: number;
  furnished: FurnishedType;
  facing?: string;
  age?: number;
}

export interface PropertyMedia {
  images: string[];
  videoUrl?: string;
  matterportId?: string;
  floorPlanUrl?: string;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  rating?: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  pricePerSqft: number;
  maintenanceCharges?: number;
  location: Location;
  specs: PropertySpecs;
  media: PropertyMedia;
  rera: string;
  possession: string;
  amenities: string[];
  landmarks: Landmark[];
  agentId: string;
  agent?: Agent;
  premium: boolean;
  featured: boolean;
  badge?: 'new' | 'hot' | 'verified' | 'sold';
  views: number;
  saves: number;
  postedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  city?: string;
  type?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  status?: PropertyStatus;
  premium?: boolean;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'relevance';
}

export interface BookingRequest {
  propertyId: string;
  userId: string;
  type: BookingType;
  date: string;
  time: string;
  agentId: string;
  userDetails: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
  };
}

export interface Booking extends BookingRequest {
  id: string;
  status: BookingStatus;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  plan: UserPlan;
  savedProperties: string[];
  recentlyViewed: string[];
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ServerError {
  message: string;
  code?: string;
  statusCode?: number;
}
