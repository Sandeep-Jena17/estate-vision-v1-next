/**
 * Application-wide constants
 * Note: REACT_APP_ → NEXT_PUBLIC_ for Next.js env vars
 */

export const APP_CONFIG = {
  API_URL:          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  COGNITO_POOL_ID:  process.env.NEXT_PUBLIC_COGNITO_POOL_ID || '',
  COGNITO_CLIENT_ID:process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  GOOGLE_MAPS_KEY:  process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
  CDN_URL:          process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.estatevision.com',
  ENVIRONMENT:      process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
};

export const PROPERTY_TYPES = [
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Villa', label: 'Villa' },
  { value: 'Plot', label: 'Plot' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Penthouse', label: 'Penthouse' },
];

export const PROPERTY_STATUS = [
  { value: 'Ready to Move', label: 'Ready to Move' },
  { value: 'Under Construction', label: 'Under Construction' },
  { value: 'Resale', label: 'Resale' },
];

export const FURNISHED_TYPES = [
  { value: 'Fully', label: 'Fully Furnished' },
  { value: 'Semi', label: 'Semi Furnished' },
  { value: 'Unfurnished', label: 'Unfurnished' },
];

export const BOOKING_TYPES = [
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'video_call', label: 'Video Call' },
  { value: 'phone_call', label: 'Phone Call' },
];

export const PRICE_RANGES = [
  { min: 0, max: 5000000, label: 'Below 50L' },
  { min: 5000000, max: 10000000, label: '50L - 1Cr' },
  { min: 10000000, max: 25000000, label: '1Cr - 2.5Cr' },
  { min: 25000000, max: 50000000, label: '2.5Cr - 5Cr' },
  { min: 50000000, max: Infinity, label: 'Above 5Cr' },
];

export const BED_OPTIONS = [1, 2, 3, 4, 5];

export const AMENITIES = [
  'Lift', 'Parking', 'Swimming Pool', 'Gym', 'Garden', 'Security',
  'Balcony', 'Terrace', 'Power Backup', 'Water Tank', 'WiFi', 'Intercom',
];

export const LANDMARK_ICONS: Record<string, string> = {
  airport: '✈️', railway: '🚂', hospital: '🏥',
  school: '🎓', mall: '🛍️', office: '🏢', metro: '🚇',
};

export const DEBOUNCE_DELAY    = 300;
export const PAGINATION_LIMIT  = 12;
export const IMAGE_PLACEHOLDER = 'https://via.placeholder.com/400x300?text=Property+Image';
export const TOAST_DURATION    = 3000;

export const BREAKPOINTS = {
  mobile:  '480px',
  tablet:  '768px',
  desktop: '1024px',
  wide:    '1440px',
};
