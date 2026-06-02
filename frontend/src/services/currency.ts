/**
 * Currency formatting for Gura Neza — Rwandan Franc (RWF)
 */

export const CURRENCY = 'RWF';

/** Format a number as "RWF 1,500.00" */
export const fmt = (amount: number | string | undefined | null, decimals = 0): string => {
  const n = Number(amount ?? 0);
  return `${CURRENCY} ${n.toLocaleString('en-RW', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
};
