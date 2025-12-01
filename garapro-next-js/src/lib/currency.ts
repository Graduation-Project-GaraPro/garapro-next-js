// src/lib/currency.ts

/**
 * Format VND
 */
export function formatVND(amount: number, showSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return showSymbol ? `${formatted}₫` : formatted;
}


export function formatVNDWithCode(amount: number): string {
  return `${formatVND(amount, false)} VND`;
}


export function parseVND(vndString: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = vndString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}
