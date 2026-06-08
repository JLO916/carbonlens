'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { COUNTRIES } from '@/lib/data/countries';

const COUNTRY_LINKS: Record<string, string> = { tw: '/tw', sg: '/sg', kr: '/kr', jp: '/jp', th: '/th', vn: '/vn' };

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-gray-600">{children}</div>
    </section>
  );
}

export default function AboutContent() {
  const { t, tObj } = useI18n();

  const features = [
    { icon: '📏', title: t('溫室氣體盤查(Scope 1／2／3)', 'GHG inventory (Scope 1/2/3)'), desc: t('以活動數據 × 排放係數逐筆建立可查證盤查,內建電力、燃料、逸散冷媒、製程煅燒(水泥熟料/石灰)與半導體製程含氟氣體(NF₃/CF₄/SF₆),海外廠自動套各國電網係數;選行業可一鍵帶入典型排放源。', 'Auditable line-by-line inventory from activity × factors — electricity, fuels, refrigerants, process calcination (clinker/lime) and semiconductor F-gases (NF₃/CF₄/SF₆), with country grid factors for overseas plants; load typical sources by industry in one click.') },
    { icon: '📋', title: t('查證就緒度:不確定性與數據品質彙總', 'Assurance readiness: uncertainty & data quality'), desc: t('把各活動數據的 ± 不確定性以平方和開根號彙總成整體 ±%,並算出實測/發票/估算的數據品質分布——查證最先看的兩件事;含氟氣體可填減排設備去除率(DRE)。', 'Rolls each line’s ±% into an overall uncertainty (quadrature) and a measured/invoice/estimate data-quality mix — the first things assurance checks; F-gas lines support an abatement DRE.') },
    { icon: '🧮', title: t('國內碳費／碳稅試算', 'Domestic carbon fee/tax'), desc: t('台灣碳費(一般／優惠費率、K 值、CL 係數、自主減量計畫把關)與亞太六國碳定價一鍵試算,並提供可給查核員的算式拆解。', 'Compute Taiwan’s carbon fee and six APAC mechanisms, with an auditor-ready breakdown.') },
    { icon: '🇪🇺', title: t('EU CBAM 暴露 + 碳價交叉抵扣', 'EU CBAM exposure + cross-deduction'), desc: t('依 CN 碼官方預設值、實際內含排放、或由你的盤查分攤,估算 2026→2034 逐年 CBAM 暴露與 ETS 價格區間;並把原產國已付碳費抵扣 CBAM(Reg 2023/956 §9,附各國認定信心)。', 'Estimate the 2026→2034 CBAM ramp from CN-code defaults, actual embedded emissions, or allocated from your inventory; and net the origin carbon price already paid against CBAM (Reg 2023/956 §9, with per-country confidence).') },
    { icon: '🎯', title: t('多重減量目標與 SBTi 對齊', 'Multiple targets & SBTi alignment'), desc: t('一個 SBTi 承諾通常是一組:近期 Scope 1+2、近期 Scope 3、長期淨零——各自於所屬範疇畫線性軌跡、判斷是否在軌、對齊 1.5°C 最低 4.2%／年;並反推達成 Scope 1+2 目標所需的綠電%(RE100 連動)。', 'An SBTi commitment is usually a set — near-term Scope 1+2, near-term Scope 3, long-term net-zero — each tracked on its own boundary against the 1.5°C minimum 4.2%/yr; plus the renewable % implied by the Scope 1+2 target (RE100 linkage).') },
    { icon: '🌱', title: t('市場基礎 Scope 2 與 RE100', 'Market-based Scope 2 & RE100'), desc: t('依綠電/PPA/REC 佔比同時呈現地點基礎與市場基礎 Scope 2,直接回應品牌客戶的 RE100 要求。', 'Show location- and market-based Scope 2 from your renewable %, answering RE100 asks.') },
    { icon: '🏛️', title: t('IFRS S1／S2 永續揭露', 'IFRS S1/S2 disclosure'), desc: t('依資本額推算永續報告書與氣候相關財務揭露的接軌階段與時程,並產出可貼用的報告段落草稿。', 'Derive your IFRS sustainability/climate-disclosure phase and timeline, with a ready-to-edit report draft.') },
    { icon: '🏷️', title: t('產品碳足跡(每料號)', 'Product carbon footprint (per SKU)'), desc: t('把組織盤查足跡依數量／質量／營收分攤到各料號,算出每單位 kgCO₂e,並匯出一頁聲明給品牌客戶——篩選級估算(ISO 14067 精神),非查證 LCA。', 'Allocate the org inventory footprint to each SKU by units/mass/revenue → per-unit kgCO₂e, with a one-page declaration for brand customers — a screening estimate (ISO 14067-aligned), not a verified LCA.') },
    { icon: '🔗', title: t('客戶問卷回覆(CDP／品牌／SBTi)', 'Customer questionnaire answers'), desc: t('把你算好的盤查與目標,自動對映成 CDP 供應鏈、品牌客戶 ESG 問卷、SBTi 供應商常問的欄位,逐欄標「可回覆／部分／待補」並列出缺口,一鍵匯出貼給客戶。', 'Maps your inventory and targets to the fields CDP Supply Chain, brand ESG forms and SBTi supplier asks actually request — each marked ready/partial/missing with a gap list, exportable to paste to the customer.') },
    { icon: '📤', title: t('報告與工作底稿匯出', 'Reports & working-paper exports'), desc: t('一鍵匯出盤查清冊 CSV、IFRS 報告段落、CBAM 設施溝通範本、客戶問卷回覆包、每料號 PCF 聲明與側寫 JSON,皆於前端產生、不經伺服器。', 'Export the inventory CSV, IFRS report draft, CBAM template, customer answer pack, per-SKU PCF declaration and profile JSON — all generated client-side.') },
  ];

  const faqs = [
    { q: t('Carbon Lens 碳排鏡菱是免費的嗎?需要註冊嗎?', 'Is Carbon Lens free? Do I need to sign up?'), a: t('完全免費、免註冊。你的公司側寫、盤查、快照與凍結版本都只存在你的瀏覽器(localStorage),不會上傳到任何伺服器。', 'Completely free, no signup. Your profile, inventory, snapshots and locked versions live only in your browser — nothing is uploaded.') },
    { q: t('支援哪些國家的碳定價?', 'Which countries’ carbon pricing are supported?'), a: t('台灣碳費、新加坡碳稅、韓國 K-ETS、日本碳稅+GX-ETS、泰國碳稅、越南 ETS 試行,共亞太六國,並涵蓋歐盟 CBAM 碳關稅。', 'Taiwan, Singapore, Korea (K-ETS), Japan (carbon tax + GX-ETS), Thailand, Vietnam — six APAC mechanisms, plus the EU CBAM.') },
    { q: t('盤查的排放係數從哪裡來?可靠嗎?', 'Where do the emission factors come from?'), a: t('電力採能源署電力排碳係數、燃料採環境部排放係數管理表、GWP 採 IPCC AR5、各國電網係數採各國主管機關公布值;每筆數字標一手法源,並可逐行覆寫為你的查證值。', 'Electricity from the Energy Administration grid factor, fuels from the MOENV factor table, GWP from IPCC AR5, country grids from national authorities — every figure is sourced and overridable.') },
    { q: t('CBAM 碳關稅是亞洲出口商要繳嗎?', 'Do Asian exporters pay CBAM?'), a: t('CBAM 憑證購買義務由歐盟進口商承擔,不是亞洲出口商;但其成本可能透過商業談判影響採購價。成品電子、紡織不在 CBAM 清單上,清單僅鋼鐵、鋁、水泥、肥料、氫、電力。', 'CBAM certificates are bought by the EU importer, not Asian exporters; the cost may flow through pricing. Finished electronics/textiles aren’t on the CBAM list (only steel, aluminium, cement, fertilizer, hydrogen, electricity).') },
    { q: t('適合哪些公司使用?', 'Who is it for?'), a: t('出口歐盟、面對品牌客戶碳要求、或須依 IFRS 編製永續資訊的台灣與亞太製造業,尤其在越南、泰國等地設有海外廠的集團;以及被大廠/品牌要求填碳問卷、提供產品碳足跡的中小供應商。', 'Taiwan & APAC manufacturers that export to the EU, face brand-customer carbon demands, or file IFRS sustainability information — especially groups with overseas plants; and SME suppliers asked by brands for carbon questionnaires and product footprints.') },
    { q: t('半導體、面板的製程含氟氣體(NF₃/CF₄)能算嗎?', 'Can it handle semiconductor F-gases (NF₃/CF₄)?'), a: t('可以。盤查內建 NF₃、CF₄、C₂F₆、C₃F₈、CHF₃、c-C₄F₈、SF₆,係數採 IPCC AR5 GWP;若裝有洗滌/燃燒設備,可填減排設備去除率(DRE),申報排放=用量×係數×(1−DRE),符合 IPCC Tier 2b。', 'Yes. The inventory includes NF₃, CF₄, C₂F₆, C₃F₈, CHF₃, c-C₄F₈ and SF₆ with IPCC AR5 GWP; if you run abatement, enter a destruction/removal efficiency (DRE) so reported = use × factor × (1 − DRE), per IPCC Tier 2b.') },
    { q: t('客戶要我填 CDP 或他們的 ESG 問卷,工具能幫嗎?', 'Customers want CDP or their ESG form — can it help?'), a: t('能。「客戶問卷回覆」會把你算好的盤查、目標、查證狀態,對映成 CDP 供應鏈、品牌客戶 ESG 問卷、SBTi 供應商常問的欄位,逐欄標可回覆/部分/待補並列缺口,可匯出貼給客戶。', 'Yes. The “customer questionnaire” maps your computed inventory, targets and verification status to CDP Supply Chain, brand ESG forms and SBTi supplier asks — each marked ready/partial/missing with a gap list, exportable to the customer.') },
    { q: t('品牌客戶要每個產品的碳足跡,能出嗎?', 'Brands want a per-product footprint — can it produce one?'), a: t('能。建立產品/料號清單後,工具把組織足跡依數量、質量或營收分攤到各料號,算出每單位 kgCO₂e,並匯出一頁聲明。這是篩選級分攤估算(ISO 14067 精神),非第三方查證 LCA,聲明上會明確標示。', 'Yes. List your products/SKUs and the tool allocates the org footprint by units, mass or revenue → per-unit kgCO₂e, with a one-page declaration. It’s a screening allocation (ISO 14067-aligned), not a verified LCA, and says so.') },
    { q: t('我在台灣繳的碳費,能從 CBAM 扣掉嗎?', 'Can the carbon fee I pay in Taiwan be deducted from CBAM?'), a: t('可以部分抵扣。依 Reg (EU) 2023/956 §9,原產國已付碳價可從 CBAM 義務抵扣;受益者是歐盟進口商,你需提供已付證明。歐盟對各國認定程度不同(新加坡/韓國高、台灣/日本中、泰國低、越南無),工具會標示信心等級。', 'Partly. Under Reg (EU) 2023/956 §9 the carbon price paid in origin is deductible from the CBAM obligation; the EU importer benefits and needs your proof of payment. Recognition varies by country (SG/KR high, TW/JP medium, TH low, VN none), and the tool flags the confidence.') },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-12">
      {/* H1 intro */}
      <header className="space-y-4">
        <p className="text-sm font-medium text-[#5d7d44]">{t('關於本服務', 'About')}</p>
        <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">{t('Carbon Lens 碳排鏡菱:企業碳管理工作台', 'Carbon Lens — a corporate carbon-management workbench')}</h1>
        <p className="text-lg leading-relaxed text-gray-600">
          {t('Carbon Lens 碳排鏡菱是一套免費、免註冊的企業碳管理工作台,把碳盤查、國內碳費與碳稅、歐盟 CBAM、IFRS 永續揭露、減量目標與供應鏈碳要求,收斂成一條從盤查到揭露、年年滾動的可查證流程。', 'Carbon Lens is a free corporate carbon-management workbench that unifies GHG inventory, domestic carbon fees and taxes, EU CBAM, IFRS disclosure, reduction targets and supply-chain demands into one auditable, year-over-year flow from inventory to disclosure.')}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/workbench"><Button className="bg-[#89B56C] text-white hover:bg-[#6E9156]">{t('進入工作台 →', 'Open the workbench →')}</Button></Link>
          <Link href="/guide"><Button variant="outline">{t('看使用指南', 'Read the guide')}</Button></Link>
        </div>
      </header>

      <Section id="what" title={t('我們解決什麼問題', 'The problem we solve')}>
        <p>{t('亞太地區正進入碳定價的加速期。台灣碳費、新加坡碳稅、韓國 K-ETS、日本碳稅與 GX-ETS、泰國碳稅、越南 ETS 試行——六個經濟體的碳定價制度在 2025–2026 年間密集上路或大幅調整,同時歐盟碳邊境調整機制(CBAM)自 2026 年進入正式期。', 'Asia-Pacific is entering an acceleration phase of carbon pricing. Six economies are launching or adjusting carbon pricing across 2025–2026, while the EU CBAM enters its definitive period in 2026.')}</p>
        <p>{t('對製造業的 ESG、永續與財會團隊而言,難的不是「算一個數字」,而是要把碳費、CBAM、Scope 1／2／3 盤查、IFRS 揭露、客戶的 SBTi 與 RE100 要求,放進一個一致、可查證、能年復一年交付的流程裡。Carbon Lens 碳排鏡菱就是為此而生。', 'For ESG, sustainability and finance teams, the hard part isn’t one number — it’s threading carbon fees, CBAM, Scope 1/2/3 inventory, IFRS disclosure and customer SBTi/RE100 asks into one consistent, auditable, repeatable process. That’s what Carbon Lens is for.')}</p>
      </Section>

      <Section id="features" title={t('核心功能', 'Core capabilities')}>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="flex items-center gap-2 font-semibold text-gray-900"><span className="text-xl">{f.icon}</span>{f.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="countries" title={t('支援的亞太碳定價機制', 'Supported APAC carbon pricing')}>
        <p>{t('一份側寫即可在以下六國的國內碳定價引擎間切換,海外廠自動套用該國電網排碳係數:', 'One profile switches across all six domestic engines, with country-specific grid factors for overseas plants:')}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-gray-400"><th className="py-2 pr-3 font-medium">{t('國家／地區', 'Country')}</th><th className="py-2 pr-3 font-medium">{t('機制', 'Mechanism')}</th><th className="py-2 pr-3 font-medium">{t('現行費率', 'Current rate')}</th><th className="py-2 font-medium">{t('工具', 'Tool')}</th></tr></thead>
            <tbody>
              {(['tw', 'sg', 'kr', 'jp', 'th', 'vn'] as const).map((cc) => {
                const c = COUNTRIES[cc];
                return (
                  <tr key={cc} className="border-b border-gray-50 text-gray-700">
                    <td className="py-2 pr-3 font-medium">{c.flag} {tObj(c.name)}</td>
                    <td className="py-2 pr-3">{tObj(c.mechanism)}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{c.currentRate.value > 0 ? `${c.currentRate.value} ${c.currentRate.unit}` : t('試行中', 'pilot')}</td>
                    <td className="py-2"><Link href={COUNTRY_LINKS[cc]} className="text-[#5d7d44] underline-offset-2 hover:underline">{t('試算', 'Calc')} →</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm">{t('歐盟 CBAM 碳關稅另以', 'EU CBAM is covered by the')}{' '}<Link href="/cbam" className="text-[#5d7d44] underline-offset-2 hover:underline">{t('CBAM 計算器', 'CBAM calculator')}</Link>{' '}{t('與', 'and')}{' '}<Link href="/diagnose/cbam" className="text-[#5d7d44] underline-offset-2 hover:underline">{t('CBAM 暴露診斷', 'CBAM exposure diagnosis')}</Link>{' '}{t('涵蓋;也可用', 'tools; or')}{' '}<Link href="/compare" className="text-[#5d7d44] underline-offset-2 hover:underline">{t('跨國比較', 'cross-country compare')}</Link>{' '}{t('評估在不同國家設廠的碳成本差異。', 'to compare carbon costs across production locations.')}</p>
      </Section>

      <Section id="who" title={t('適合誰用', 'Who it’s for')}>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>{t('製造業的 ESG／永續／財會主管與承辦——電子半導體、鋼鐵金屬、化工塑膠、紡織、機械設備、食品民生等。', 'ESG/sustainability/finance leads in manufacturing — electronics, steel, chemicals, textiles, machinery, food, and more.')}</li>
          <li>{t('出口歐盟、需評估 CBAM 暴露與內含排放的出口商。', 'Exporters to the EU assessing CBAM exposure and embedded emissions.')}</li>
          <li>{t('面對品牌客戶 CDP、SBTi、RE100、產品碳足跡要求的供應鏈廠商。', 'Suppliers facing brand-customer CDP, SBTi, RE100 and PCF requirements.')}</li>
          <li>{t('依金管會規範須編製永續報告書、接軌 IFRS S1／S2 氣候揭露的上市櫃公司。', 'Listed companies filing sustainability reports and IFRS S1/S2 climate disclosure.')}</li>
          <li>{t('在越南、泰國等地設有海外廠、需多廠多國碳盤查與碳費試算的集團。', 'Groups with overseas plants (Vietnam, Thailand…) needing multi-site, multi-country inventory and fee estimates.')}</li>
        </ul>
      </Section>

      <Section id="cycle" title={t('一條完整的碳管理週期', 'One complete management cycle')}>
        <p>{t('工具依「量測盤查 → 設定目標 → 減量規劃 → 查證定版 → 申報合規 → 對外揭露 → 年對年閉環」七步年度週期設計,並以多個產業實例完整示範:AI 伺服器代工廠(Scope 3 占比)、金屬零件廠(碳費×CBAM 抵扣)、化工廠(多重目標、製程煅燒)、半導體廠(製程含氟氣體、RE100 反推)、中小供應商(行業範本、客戶問卷、每料號 PCF)。', 'The tool follows a seven-step annual cycle — inventory → targets → reductions → assurance → filing → disclosure → year-over-year — demonstrated with several industry examples: an AI-server ODM (Scope 3 share), a metal-parts maker (carbon fee × CBAM deduction), a chemicals plant (multiple targets, process calcination), a semiconductor fab (F-gases, RE100 reverse-solve) and an SME supplier (industry templates, customer questionnaire, per-SKU PCF).')}</p>
        <p>{t('完整圖文教學與多產業實例操作導覽見', 'Full illustrated walkthrough with multi-industry worked examples:')}{' '}<Link href="/guide" className="text-[#5d7d44] underline-offset-2 hover:underline">{t('使用指南', 'the user guide')}</Link>。</p>
      </Section>

      <Section id="trust" title={t('資料來源與可信度', 'Sources & trustworthiness')}>
        <p>{t('每一筆數字都標註一手法源:台灣碳費依《氣候變遷因應法》與碳費收費辦法、CBAM 依 Regulation (EU) 2023/956、電力排碳係數依經濟部能源署、燃料係數依環境部排放係數管理表、GWP 依 IPCC AR5、減量目標依 SBTi 準則。', 'Every figure cites primary law: Taiwan’s Climate Act and carbon-fee rules, EU Reg 2023/956, the Energy Administration grid factor, the MOENV factor table, IPCC AR5 GWP and SBTi criteria.')}</p>
        <p>{t('我們守三條資料紅線:數字必有來源、不偽造減碳成本、官方預設值未經人工基線前維持鎖定。完整方法論與引用見', 'We hold three data red-lines: sourced figures, no fabricated abatement costs, locked official defaults. Full methodology:')}{' '}<Link href="/methodology" className="text-[#5d7d44] underline-offset-2 hover:underline">{t('方法論與來源', 'Methodology & sources')}</Link>。</p>
        <p>{t('隱私:工具完全在你的瀏覽器執行,資料只存本機、免註冊、不經伺服器。', 'Privacy: the tool runs entirely in your browser — local-only, no signup, no server.')}</p>
      </Section>

      <Section id="faq" title={t('常見問題', 'FAQ')}>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <details key={i} className="rounded-lg border border-gray-200 bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold text-gray-800">{f.q}</summary>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section id="maker" title={t('關於開發者', 'About the maker')}>
        <p>
          {t('Carbon Lens 碳排鏡菱 由', 'Carbon Lens is independently built and maintained by')}{' '}
          <a href="https://www.linkedin.com/in/jimmylo1979/" target="_blank" rel="noopener noreferrer" className="font-medium text-[#89B56C] hover:underline">Jimmy Lo</a>
          {t(' 獨立開發與維護,目標是讓碳成本與碳合規的估算變得透明、直覺、人人可用,並隨法規演進持續更新。', ', aiming to make carbon-cost and compliance estimation transparent, intuitive and accessible — updated as regulations evolve.')}
        </p>
      </Section>

      <p className="border-t border-gray-200 pt-6 text-xs leading-relaxed text-gray-400">
        {t('本工具提供概略估算與情報參考,不構成法律、稅務或永續簽證意見。各國碳定價與歐盟 CBAM 規則持續更新,正式申報與揭露請以主管機關公告與專業意見為準。', 'This tool provides approximate estimates and reference only — not legal, tax or assurance advice. Carbon pricing and CBAM rules change; for formal filing and disclosure, follow the authorities and professional advice.')}
      </p>
    </div>
  );
}
