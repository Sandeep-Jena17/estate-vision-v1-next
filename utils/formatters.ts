/**
 * Utility functions for formatting data
 */

export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  }
  return `₹${(price / 100000).toFixed(1)} L`;
};

export const formatCurrency = formatPrice;

export const abbreviateNumber = (num: number): string => {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + ' Cr';
  if (num >= 100000)   return (num / 100000).toFixed(1) + ' L';
  if (num >= 1000)     return (num / 1000).toFixed(1) + ' K';
  return num.toString();
};

export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'time' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions =
    format === 'short'
      ? { day: 'numeric', month: 'short', year: 'numeric' }
      : format === 'long'
        ? { day: 'numeric', month: 'long', year: 'numeric' }
        : { hour: '2-digit', minute: '2-digit' };
  return new Intl.DateTimeFormat('en-IN', options).format(dateObj);
};

export const formatArea = (sqft: number): string =>
  new Intl.NumberFormat('en-IN').format(sqft) + ' Sqft';

export const calculatePricePerSqft = (price: number, sqft: number): number =>
  Math.round(price / sqft);

export const getTimeAgo = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs    = now.getTime() - dateObj.getTime();
  const diffMins  = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays  = Math.floor(diffMs / 86400000);

  if (diffMins < 1)  return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7)   return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(dateObj, 'short');
};

export const truncateText = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : text.substring(0, maxLength) + '...';

export const slugify = (text: string): string =>
  text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return phone;
  return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
};
