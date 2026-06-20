// Taiwan's "three-track" carbon-market plan: carbon fee (live) + ETS (cap-and-trade, trial trading
// from 2028) + international carbon credits (Paris Art. 6). This module holds ONLY the sourced policy
// TIMELINE — the milestone dates are MOENV planning figures, not finalised regulation.
// RED LINE: no ETS cap, free-allocation ratio, or allowance price is modelled here — none is
// published yet (trial trading is 2028). The tool surfaces the transition, it does not fabricate an
// ETS bill.

import type { BilingualText, Citation } from '@/lib/diagnose/types';

export const CITATION_TW_ETS: Citation = {
  source: { zhTW: '環境部「三軌並進」碳市場規劃(碳費 + ETS 總量管制 + 國際碳權)', en: 'MOENV three-track carbon-market plan (carbon fee + ETS cap-and-trade + international credits)' },
  officialDocVersion: {
    zhTW: 'ETS(總量管制與排放交易):2026 下半年提試行計畫、2026 年底交易平台上線(臺灣碳權交易所×歐洲能源交易所 EEX)、2028 試行總量管制交易。日期為規劃值,以環境部正式公告為準;目前尚無官方總量、免費配額比例或額度價格。',
    en: 'ETS (cap-and-trade): trial plan H2 2026, trading platform live end-2026 (Taiwan Carbon Solution Exchange × EEX), trial cap-and-trade trading 2028. Dates are indicative — defer to MOENV; no official cap, free-allocation ratio or allowance price exists yet.',
  },
  asOfDate: '2026-06',
  url: 'https://www.moenv.gov.tw/',
};

export interface EtsMilestone {
  key: string;
  date: string; // YYYY-MM-DD — indicative (planning value), used only for ordering / a heads-up countdown
  label: BilingualText;
  source: BilingualText;
}

/** Forward-looking policy milestones (not per-company filing deadlines). */
export const TW_ETS_MILESTONES: EtsMilestone[] = [
  {
    key: 'ets-plan',
    date: '2026-07-01',
    label: { zhTW: '提出 ETS 試行計畫(2026 下半年)', en: 'ETS trial plan proposed (H2 2026)' },
    source: { zhTW: '環境部 ETS 規劃 · 日期暫定,以官方公告為準', en: 'MOENV ETS plan · date indicative, defer to official notice' },
  },
  {
    key: 'ets-platform',
    date: '2026-12-31',
    label: { zhTW: 'ETS 試行交易平台上線(碳交所 × EEX,2026 年底)', en: 'ETS trial trading platform live (TCX × EEX, end-2026)' },
    source: { zhTW: '臺灣碳權交易所與歐洲能源交易所合作建置 · 日期暫定', en: 'Taiwan Carbon Solution Exchange × EEX · date indicative' },
  },
  {
    key: 'ets-trial',
    date: '2028-01-01',
    label: { zhTW: '正式啟動 ETS 試行總量管制交易(2028)', en: 'ETS cap-and-trade trial trading begins (2028)' },
    source: { zhTW: '環境部:自碳費逐步轉向總量管制 · 無官方總量/價格', en: 'MOENV: phasing from fee toward cap-and-trade · no official cap/price yet' },
  },
];
