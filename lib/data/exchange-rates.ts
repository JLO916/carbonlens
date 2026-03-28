// Default exchange rates (to USD). Used as fallback when API unavailable.
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  TWD: 32.5,
  SGD: 1.34,
  KRW: 1380,
  JPY: 150,
  THB: 34.5,
  VND: 25400,
  EUR: 0.92,
};

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: { zhTW: string; en: string };
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', symbol: '$', name: { zhTW: '美元', en: 'USD' } },
  { code: 'TWD', symbol: 'NT$', name: { zhTW: '台幣', en: 'TWD' } },
  { code: 'EUR', symbol: '€', name: { zhTW: '歐元', en: 'EUR' } },
  { code: 'SGD', symbol: 'S$', name: { zhTW: '新加坡幣', en: 'SGD' } },
  { code: 'JPY', symbol: '¥', name: { zhTW: '日圓', en: 'JPY' } },
  { code: 'KRW', symbol: '₩', name: { zhTW: '韓元', en: 'KRW' } },
  { code: 'THB', symbol: '฿', name: { zhTW: '泰銖', en: 'THB' } },
  { code: 'VND', symbol: '₫', name: { zhTW: '越南盾', en: 'VND' } },
];

export function convertToUSD(amount: number, currency: string): number {
  const rate = DEFAULT_EXCHANGE_RATES[currency];
  if (!rate) return amount;
  return amount / rate;
}

export function convertToEUR(amount: number, currency: string): number {
  const usd = convertToUSD(amount, currency);
  return usd * DEFAULT_EXCHANGE_RATES.EUR;
}

export function formatCurrency(amount: number, decimals = 0): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
