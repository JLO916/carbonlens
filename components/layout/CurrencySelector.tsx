'use client';

import { useCurrency } from '@/lib/currency/context';
import { useI18n } from '@/lib/i18n/context';
import { CURRENCY_OPTIONS } from '@/lib/data/exchange-rates';

export default function CurrencySelector() {
  const { displayCurrency, setDisplayCurrency, ratesSource, ratesDate } = useCurrency();
  const { tObj } = useI18n();

  return (
    <div className="relative group">
      <select
        value={displayCurrency}
        onChange={(e) => setDisplayCurrency(e.target.value)}
        className="text-xs pl-2 pr-6 py-1 border rounded-md text-gray-600 bg-white hover:border-gray-400 cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-[#89B56C]"
        title={ratesDate ? `Rates: ${ratesDate}` : 'Default rates'}
      >
        {CURRENCY_OPTIONS.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.symbol} {tObj(opt.name)}
          </option>
        ))}
      </select>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
        ▼
      </span>
      {ratesSource === 'live' && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" title="Live rates" />
      )}
    </div>
  );
}
