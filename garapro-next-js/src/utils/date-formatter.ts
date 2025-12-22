/**
 * Utility functions for safe date formatting
 */

/**
 * Safely format a date to locale string
 * @param date - Date string, Date object, or null/undefined
 * @param options - Intl.DateTimeFormatOptions
 * @param fallback - Fallback text when date is invalid
 * @returns Formatted date string or fallback
 */
export function safeToLocaleDateString(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = 'N/A'
): string {
  if (!date) return fallback;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return fallback;
    
    return dateObj.toLocaleDateString(undefined, options);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
}

/**
 * Safely format a date to locale string with time
 * @param date - Date string, Date object, or null/undefined
 * @param options - Intl.DateTimeFormatOptions
 * @param fallback - Fallback text when date is invalid
 * @returns Formatted date string or fallback
 */
export function safeToLocaleString(
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
  fallback: string = 'N/A'
): string {
  if (!date) return fallback;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return fallback;
    
    return dateObj.toLocaleString(undefined, options);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
}

/**
 * Safely format a number to locale string
 * @param value - Number or null/undefined
 * @param options - Intl.NumberFormatOptions
 * @param fallback - Fallback text when value is invalid
 * @returns Formatted number string or fallback
 */
export function safeToLocaleNumber(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
  fallback: string = 'N/A'
): string {
  if (value == null || isNaN(value)) return fallback;
  
  try {
    return value.toLocaleString(undefined, options);
  } catch (error) {
    console.warn('Number formatting error:', error);
    return fallback;
  }
}