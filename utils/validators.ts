/**
 * Validators for form data and property information
 */

export const validators = {
  email: (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  phone: (phone: string): boolean =>
    /^[6-9]\d{9}$/.test(phone.replace(/\D/g, '')),

  name: (name: string): boolean =>
    name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name),

  date: (date: string): boolean => {
    const selected = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= today;
  },

  price: (price: number): boolean =>
    price > 0 && isFinite(price),

  specs: (beds: number, baths: number, sqft: number): boolean =>
    beds > 0 && baths > 0 && sqft > 0,
};

export const errorMessages = {
  INVALID_EMAIL:   'Please enter a valid email address',
  INVALID_PHONE:   'Please enter a valid 10-digit phone number',
  INVALID_NAME:    'Name must be at least 2 characters (letters only)',
  INVALID_DATE:    'Please select a future date',
  INVALID_PRICE:   'Please enter a valid price',
  REQUIRED_FIELD:  'This field is required',
  BOOKING_ERROR:   'Failed to create booking. Please try again.',
  NETWORK_ERROR:   'Network error. Please check your connection.',
};
