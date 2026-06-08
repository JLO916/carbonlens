'use client';

import { useI18n } from '@/lib/i18n/context';
import CitationTag from '@/components/diagnose/CitationTag';
import type { Citation } from '@/lib/diagnose/types';
import { CITATION_TW_CARBON_FEE, CITATION_CBAM_SCOPE, CITATION_ASSURANCE } from '@/lib/workbench/data';
import { CITATION_CBAM_LEGAL, CITATION_CBAM_DEFAULTS, CITATION_CBAM_FACTOR } from '@/lib/diagnose/data/cbam';
import { CITATION_GRI, CITATION_IFRS } from '@/lib/diagnose/data/listed-disclosure';
import { CITATION_SCOPE3_CATEGORIES } from '@/lib/diagnose/data/scope3-categories';
import { CITATION_EMISSION_FACTORS } from '@/lib/workbench/emission-factors';
import { CITATION_CBAM_DEDUCTION } from '@/lib/workbench/cbam-deduction';
import { CITATION_SBTI } from '@/lib/workbench/target';

function Section({ title, desc, cites }: { title: string; desc: string; cites: Citation[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{desc}</p>
      <div className="mt-3 space-y-2">
        {cites.map((c, i) => <CitationTag key={i} citation={c} />)}
      </div>
    </div>
  );
}

export default function MethodologyContent() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-[#5d7d44]">{t('方法論與來源', 'Methodology & sources')}</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">{t('每個數字,從哪來', 'Where every number comes from')}</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {t(
            '本工具的資料紅線:每個法規數字都標一手來源(法規條文/官方文件),不編造、不估算未經驗證的值。以下是各領域的依據。',
            'Our data red line: every regulatory figure cites a primary source (statute/official document); we don’t fabricate or show unverified estimates. Here is the basis for each domain.',
          )}
        </p>
      </header>

      <div className="rounded-xl border-l-4 border-l-[#89B56C] bg-[#89B56C]/5 p-4 text-sm leading-relaxed text-gray-700">
        <p className="font-medium text-[#5d7d44]">{t('三條紅線', 'Three red lines')}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-600">
          <li>{t('每個法規數字標一手法源(法規條文 / EUR-Lex / 官方文件)。', 'Every regulatory figure cites primary law (statute / EUR-Lex / official document).')}</li>
          <li>{t('CBAM 官方預設值經人工基線確認前不對外顯示數字、不估算。', 'CBAM official defaults show no number until a human baseline is confirmed — never estimated.')}</li>
          <li>{t('不提供任何減碳成本(NT$/噸)——無可信來源者寧可不給。', 'No abatement cost figures (NT$/tonne) — when there’s no credible source, we show none.')}</li>
        </ul>
      </div>

      <Section
        title={t('台灣碳費', 'Taiwan carbon fee')}
        desc={t('費率、起徵額、優惠費率與碳洩漏係數的核定門檻,均依氣候變遷因應法第 29 條與碳費收費辦法(全國法規資料庫一手條文)。', 'Rates, threshold, and the gating of preferential rates & the leakage coefficient follow Climate Change Response Act Art. 29 and the Carbon Fee Collection Regulations (primary statute).')}
        cites={[CITATION_TW_CARBON_FEE]}
      />
      <Section
        title={t('排放係數(盤查)', 'Emission factors (inventory)')}
        desc={t('電力採經濟部能源署電力排碳係數、各國電網採各國主管機關公布值;燃料採環境部「溫室氣體排放係數管理表 6.0.4」;冷媒、SF₆ 與製程含氟氣體(NF₃/CF₄/C₂F₆…)採 IPCC AR5 GWP(環境部 113/2/5 公告採用);製程煅燒(水泥熟料 0.52、石灰 0.75、石灰石 0.440 tCO₂/t)採 IPCC 2006 指南 Tier 1／化學計量。每筆皆可逐行覆寫為你的查證值。', 'Electricity uses the Energy Administration grid factor and national grids for overseas plants; fuels use the MOENV factor table 6.0.4; refrigerants, SF₆ and fluorinated process gases (NF₃/CF₄/C₂F₆…) use IPCC AR5 GWP (MOENV-adopted); process calcination (clinker 0.52, lime 0.75, limestone 0.440 tCO₂/t) uses IPCC 2006 GL Tier 1 / stoichiometric. Every value is overridable per line.')}
        cites={[CITATION_EMISSION_FACTORS]}
      />
      <Section
        title={t('歐盟 CBAM 與碳價交叉抵扣', 'EU CBAM & carbon-price cross-deduction')}
        desc={t('法規時程、官方預設值、CBAM 因子(免費配額遞減)與範圍(鋼鋁僅直接排放),均引 Regulation (EU) 2023/956 與其附則;原產國已付碳價可自 CBAM 抵扣依該規則第 9 條,各國認定信心依雙邊協商而定。', 'Timeline, official defaults, the CBAM factor and scope (steel/aluminium direct-only) cite Regulation (EU) 2023/956 and its annexes; the deduction of the carbon price already paid in origin follows Art. 9, with per-country recognition depending on bilateral settlement.')}
        cites={[CITATION_CBAM_LEGAL, CITATION_CBAM_DEFAULTS, CITATION_CBAM_FACTOR, CITATION_CBAM_SCOPE, CITATION_CBAM_DEDUCTION]}
      />
      <Section
        title={t('永續報告書 / IFRS S1/S2', 'Sustainability report / IFRS S1/S2')}
        desc={t('GRI 編製義務與 IFRS 接軌三階段時程,依金管會證期局藍圖與櫃買中心規範。', 'GRI obligation and the three-phase IFRS alignment timeline follow the FSC roadmap and TPEx rules.')}
        cites={[CITATION_GRI, CITATION_IFRS]}
      />
      <Section
        title={t('Scope 3 / 供應鏈', 'Scope 3 / supply chain')}
        desc={t('Scope 3 類別定義與商業模式邊界依 GHG Protocol 企業價值鏈標準;產業重點為起點,非完整重大性評估。', 'Scope 3 category definitions and business-model boundaries follow the GHG Protocol Corporate Value Chain Standard; industry focuses are a starting point, not a full materiality assessment.')}
        cites={[CITATION_SCOPE3_CATEGORIES]}
      />
      <Section
        title={t('減量目標 / SBTi', 'Reduction targets / SBTi')}
        desc={t('近期目標對齊 SBTi 1.5°C 線性絕對路徑(最低約 4.2%／年);近期 Scope 1+2、近期 Scope 3 與長期淨零各為一條目標,門檻為一般指引,正式目標須經 SBTi 方法與驗證。', 'Near-term targets align to the SBTi 1.5°C linear absolute pathway (min ≈4.2%/yr); near-term Scope 1+2, near-term Scope 3 and long-term net-zero are each a separate target. The threshold is general guidance — official targets require SBTi methods and validation.')}
        cites={[CITATION_SBTI]}
      />
      <Section
        title={t('查證 / 確信', 'Verification / assurance')}
        desc={t('IFRS S2 確信時程、CBAM 經認證查證、ISO 14064-1 + TAF 認證查驗的銜接路徑;盤查不確定性以 quadrature(平方和開根號、假設來源獨立)彙總,屬指示性、非完整蒙地卡羅分析。', 'The pathway for IFRS S2 assurance, CBAM accredited verification, and ISO 14064-1 + TAF-accredited verification; inventory uncertainty is rolled up by quadrature (root-sum-of-squares, assuming independent sources) — indicative, not a full Monte-Carlo analysis.')}
        cites={[CITATION_ASSURANCE]}
      />

      <p className="text-center text-xs text-gray-400">
        {t('本工具為初步診斷與情報參考,非法律意見、非永續簽證。正式申報請依主管機關規範與專業意見辦理。', 'This is a preliminary diagnostic and intelligence reference — not legal advice, not a sustainability assurance. For formal filing, follow the competent authority’s rules and professional advice.')}
      </p>
    </div>
  );
}
