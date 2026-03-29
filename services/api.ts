/**
 * API Service Layer
 * Handles all API calls and data fetching
 * API POINT: Switch mock→real by replacing MOCK_PROPERTIES with fetch() calls
 */

import { Property, PropertyFilters, Booking } from '@/types';
import { MOCK_PROPERTIES } from '@/services/mockData';

class ApiService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  async getProperties(filters?: PropertyFilters): Promise<Property[]> {
    try {
      // API POINT: GET /properties — replace with: const r = await fetch(`${this.baseUrl}/properties`); return r.json();
      return this.filterProperties(MOCK_PROPERTIES, filters);
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  }

  async getPropertyById(id: string): Promise<Property | null> {
    try {
      // API POINT: GET /properties/:id
      return MOCK_PROPERTIES.find((p) => p.id === id) || null;
    } catch (error) {
      console.error('Error fetching property:', error);
      throw error;
    }
  }

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    try {
      // API POINT: POST /bookings
      const newBooking: Booking = {
        ...booking,
        id: `booking_${Date.now()}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      } as Booking;
      return newBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  private filterProperties(properties: Property[], filters?: PropertyFilters): Property[] {
    if (!filters) return properties;
    return properties.filter((p) => {
      if (filters.city && p.location.city !== filters.city) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.minPrice && p.price < filters.minPrice) return false;
      if (filters.maxPrice && p.price > filters.maxPrice) return false;
      if (filters.beds && p.specs.beds !== filters.beds) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.premium && !p.premium) return false;
      return true;
    });
  }
}

export const apiService = new ApiService();
