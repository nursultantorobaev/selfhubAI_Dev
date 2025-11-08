/**
 * Validation utilities for forms and inputs
 */

// Configuration constants
export const BUFFER_MINUTES = 15; // 15 minutes buffer between appointments

/**
 * Phone number validation regex
 * Supports various formats:
 * - (555) 123-4567
 * - 555-123-4567
 * - 555.123.4567
 * - 5551234567
 * - +1 555 123 4567
 */
export const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

/**
 * Format phone number to standard format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  return phone;
}

/**
 * Validate phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || phone.trim() === "") return true; // Optional field
  return phoneRegex.test(phone.trim());
}

/**
 * Validate business is active
 */
export function isBusinessActive(business: { is_active?: boolean | null }): boolean {
  return business.is_active !== false;
}

/**
 * Validate service is active
 */
export function isServiceActive(service: { is_active?: boolean | null }): boolean {
  return service.is_active !== false;
}

/**
 * Calculate minimum booking time (e.g., 2 hours from now)
 */
export function getMinimumBookingTime(hoursInAdvance: number = 2): Date {
  const now = new Date();
  const minimum = new Date(now.getTime() + hoursInAdvance * 60 * 60 * 1000);
  return minimum;
}

/**
 * Calculate maximum booking window (e.g., 90 days from now)
 */
export function getMaximumBookingTime(daysAhead: number = 90): Date {
  const now = new Date();
  const maximum = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return maximum;
}

/**
 * Check if date is within booking window
 */
export function isWithinBookingWindow(
  date: Date,
  minHours: number = 2,
  maxDays: number = 90
): { valid: boolean; reason?: string } {
  const minTime = getMinimumBookingTime(minHours);
  const maxTime = getMaximumBookingTime(maxDays);
  
  // Check minimum (must be at least minHours from now)
  if (date < minTime) {
    const hoursUntil = Math.ceil((minTime.getTime() - date.getTime()) / (60 * 60 * 1000));
    return {
      valid: false,
      reason: `Bookings must be made at least ${minHours} hours in advance. Please select a time ${hoursUntil} hours from now.`
    };
  }
  
  // Check maximum
  if (date > maxTime) {
    return {
      valid: false,
      reason: `Bookings can only be made up to ${maxDays} days in advance.`
    };
  }
  
  return { valid: true };
}

/**
 * Check if date and time combination is within booking window
 * This is more accurate for same-day bookings
 */
export function isBookingDateTimeValid(
  date: Date,
  time: string,
  minHours: number = 2,
  maxDays: number = 90
): { valid: boolean; reason?: string } {
  // Combine date and time
  const [hours, minutes] = time.split(":").map(Number);
  const bookingDateTime = new Date(date);
  bookingDateTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  const minTime = new Date(now.getTime() + minHours * 60 * 60 * 1000);
  const maxTime = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);
  
  // Check minimum (must be at least minHours from now)
  if (bookingDateTime < minTime) {
    const hoursUntil = Math.ceil((minTime.getTime() - bookingDateTime.getTime()) / (60 * 60 * 1000));
    return {
      valid: false,
      reason: `Bookings must be made at least ${minHours} hours in advance. Please select a time at least ${hoursUntil} hours from now.`
    };
  }
  
  // Check maximum
  if (bookingDateTime > maxTime) {
    return {
      valid: false,
      reason: `Bookings can only be made up to ${maxDays} days in advance.`
    };
  }
  
  return { valid: true };
}

/**
 * Add buffer time to appointment end time
 */
export function addBufferTime(
  startTime: Date,
  durationMinutes: number,
  bufferMinutes: number = 15
): Date {
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
  return new Date(endTime.getTime() + bufferMinutes * 60 * 1000);
}

/**
 * Validate text input max length
 */
export function validateMaxLength(text: string, maxLength: number): boolean {
  return text.length <= maxLength;
}

