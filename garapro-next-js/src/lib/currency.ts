// src/lib/currency.ts

/**
 * Format VND
 */
export function formatVND(amount: number | null | undefined, showSymbol: boolean = true): string {
  // Handle null, undefined, or invalid numbers
  if (amount == null || isNaN(amount)) {
    return showSymbol ? '0₫' : '0';
  }

  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return showSymbol ? `${formatted}₫` : formatted;
}


export function formatVNDWithCode(amount: number | null | undefined): string {
  return `${formatVND(amount, false)} VND`;
}


export function parseVND(vndString: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = vndString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}
