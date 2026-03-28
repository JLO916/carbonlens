'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { DEFAULT_EXCHANGE_RATES, CURRENCY_OPTIONS } from '@/lib/data/exchange-rates';

interface CurrencyContextType {
  displayCurrency: string;
  setDisplayCurrency: (code: string) => void;
  rates: Record<string, number>;          // all rates relative to USD
  ratesSource: 'live' | 'default';
  ratesDate: string | null;
  convert: (amount: number, from: string, to?: string) => number;
  symbol: (code?: string) => string;
  formatConverted: (amount: number, from: string, to?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  displayCurrency: 'USD',
  setDisplayCurrency: () => {},
  rates: DEFAULT_EXCHANGE_RATES,
  ratesSource: 'default',
  ratesDate: null,
  convert: (a) => a,
  symbol: () => '$',
  formatConverted: (a) => a.toLocaleString(),
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_EXCHANGE_RATES);
  const [ratesSource, setRatesSource] = useState<'live' | 'default'>('default');
  const [ratesDate, setRatesDate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchRates() {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.result === 'success' && data.rates && !cancelled) {
          setRates(data.rates);
          setRatesSource('live');
          setRatesDate(data.time_last_update_utc?.split(' ').slice(0, 4).join(' ') ?? null);
        }
      } catch {
        // Keep default rates
      }
    }
    fetchRates();
    return () => { cancelled = true; };
  }, []);

  const convert = useCallback((amount: number, from: string, to?: string): number => {
    const target = to ?? displayCurrency;
    if (from === target) return amount;
    const fromRate = rates[from] ?? 1;
    const toRate = rates[target] ?? 1;
    return (amount / fromRate) * toRate;
  }, [rates, displayCurrency]);

  const symbolFn = useCallback((code?: string): string => {
    const c = code ?? displayCurrency;
    return CURRENCY_OPTIONS.find(o => o.code === c)?.symbol ?? c;
  }, [displayCurrency]);

  const formatConverted = useCallback((amount: number, from: string, to?: string): string => {
    const target = to ?? displayCurrency;
    const converted = convert(amount, from, target);
    const sym = symbolFn(target);
    // For large-number currencies (KRW, VND, JPY), use 0 decimals
    const noDecimal = ['KRW', 'VND', 'JPY', 'TWD', 'THB'].includes(target);
    const formatted = converted.toLocaleString('en-US', {
      minimumFractionDigits: noDecimal ? 0 : 2,
      maximumFractionDigits: noDecimal ? 0 : 2,
    });
    return `${sym}${formatted}`;
  }, [convert, symbolFn, displayCurrency]);

  return (
    <CurrencyContext.Provider value={{
      displayCurrency, setDisplayCurrency,
      rates, ratesSource, ratesDate,
      convert, symbol: symbolFn, formatConverted,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
