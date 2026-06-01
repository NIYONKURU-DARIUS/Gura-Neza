/**
 * Single source of truth for stock thresholds.
 * Change LOW_STOCK_THRESHOLD here and it updates everywhere.
 */
export const LOW_STOCK_THRESHOLD = 10;

export type StockStatus = 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK';

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'OUT_OF_STOCK';
  if (stock < LOW_STOCK_THRESHOLD) return 'LOW_STOCK';
  return 'IN_STOCK';
}

export interface StockInfo {
  status: StockStatus;
  label: string;
  /** Short label used in tight spaces (e.g. admin cards) */
  shortLabel: string;
  bg: string;
  text: string;
  dot: string;
  border: string;
}

export function getStockInfo(stock: number): StockInfo {
  const status = getStockStatus(stock);
  switch (status) {
    case 'OUT_OF_STOCK':
      return {
        status,
        label: 'Out of Stock',
        shortLabel: 'Out',
        bg: 'bg-red/10',
        text: 'text-red',
        dot: 'bg-red',
        border: 'border-red/20',
      };
    case 'LOW_STOCK':
      return {
        status,
        label: `Low Stock (${stock})`,
        shortLabel: `Low (${stock})`,
        bg: 'bg-amber/10',
        text: 'text-amber',
        dot: 'bg-amber',
        border: 'border-amber/20',
      };
    case 'IN_STOCK':
    default:
      return {
        status,
        label: 'In Stock',
        shortLabel: `${stock} in stock`,
        bg: 'bg-primary/10',
        text: 'text-primary',
        dot: 'bg-primary',
        border: 'border-primary/20',
      };
  }
}
