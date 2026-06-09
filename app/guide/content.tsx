'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JOURNEY } from '@/lib/content/journey';

/* ---------- small presentational helpers ---------- */

function Num({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}

function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="mt-3 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="block w-full" />
      <figcaption className="border-t border-gray-100 bg-gray-50 px-3 py-1.5 text-[11px] text-gray-400">{alt}</figcaption>
    </figure>
  );
}

function Feature({ id, icon, title, lead, shot, children }: { id: string; icon: string; title: string; lead: string; shot?: { src: string; alt: string }; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20 rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><span className="text-xl">{icon}</span>{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{lead}</p>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600">{children}</div>
      {shot && <Shot src={shot.src} alt={shot.alt} />}
    </div>
  );
}

function Walk({ n, title, shot, children }: { n: number; title: string; shot?: { src: string; alt: string }; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#89B56C] text-sm font-bold text-white">{n}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-gray-600">{children}</div>
        {shot && <Shot src={shot.src} alt={shot.alt} />}
      </div>
    </div>
  );
}

/* ---------- guide ---------- */

export default function GuideContent() {
  const { t, tObj } = useI18n();

  const toc = [
    { href: '#what', label: t('這是什麼、給誰用', 'What it is, who it’s for') },
    { href: '#cycle', label: t('核心:七步年度週期', 'Core: the 7-step cycle') },
    { href: '#how', label: t('逐項使用說明', 'Feature-by-feature') },
    { href: '#walk', label: t('實例導覽:AI 伺服器代工廠', 'Worked example: AI-server ODM') },
    { href: '#cases', label: t('新功能實例:四產業案例', 'New features: 4 industry cases') },
    { href: '#deliver', label: t('匯出與交付', 'Exports & deliverables') },
    { href: '#faq', label: t('常見問題', 'FAQ') },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      {/* title */}
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('使用指南', 'User guide')}</h1>
        <p className="mx-auto max-w-2xl leading-relaxed text-gray-500">
          {t('帶你從零開始用 Carbon Lens 碳排鏡菱,走完盤查、目標、減量、查證、申報、揭露到年對年閉環的完整碳管理週期——並用一家「AI 伺服器組裝代工廠」實際走一遍。', 'A from-zero walkthrough of Carbon Lens — inventory, targets, reductions, assurance, filing, disclosure and the year-over-year loop — illustrated with a real “AI-server assembly ODM” example.')}
        </p>
      </div>

      {/* TOC */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            {toc.map((x) => (
              <a key={x.href} href={x.href} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-[#89B56C]/15 hover:text-[#5d7d44]">{x.label}</a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 1. What / who */}
      <section id="what" className="scroll-mt-20 space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">{t('① 這是什麼、給誰用', '① What it is, who it’s for')}</h2>
        <p className="leading-relaxed text-gray-600">
          {t('Carbon Lens 碳排鏡菱是一套「企業碳管理工作台」。你只要填一份公司側寫,它就能一次算出你的國內碳費、CBAM 暴露、IFRS 揭露階段、供應鏈壓力,並把這些串成一條從盤查到揭露、年年滾動的完整流程。更進一步,它把碳數據變成「交得出去、接得了單」的東西:客戶問卷回覆、每料號產品碳足跡、以及逐客戶的客戶記分卡(看你達不達客戶的碳/ESG 門檻、會不會被抽單)。每筆數字都標一手法源、可追溯;資料只存在你的瀏覽器,免註冊。', 'Carbon Lens is a corporate carbon-management workbench. Fill one company profile and it computes your domestic carbon fee, CBAM exposure, IFRS phase and supply-chain pressure at once — then threads them into one auditable, year-over-year flow from inventory to disclosure. It also turns your carbon data into things you can hand over and win orders with: customer-questionnaire answers, per-SKU product footprints, and a per-customer scorecard (are you meeting each customer’s carbon/ESG bar — is an order at risk?). Every figure cites primary law; data stays in your browser, no signup.')}
        </p>
        <p className="leading-relaxed text-gray-600">
          {t('最適合:出口歐盟、面對品牌客戶碳要求、或須依 IFRS 編製永續資訊的台灣與 APAC 製造業——尤其在海外(越南、泰國等)設有廠區的公司。', 'Best for: Taiwan & APAC manufacturers that export to the EU, face brand-customer carbon demands, or file IFRS sustainability information — especially groups with overseas plants (Vietnam, Thailand, …).')}
        </p>
        <div className="rounded-lg bg-[#89B56C]/10 p-4 text-sm leading-relaxed text-[#5d7d44]">
          {t('看不懂專有名詞?工作台裡每個術語旁都有一個 ⓘ:點一下會先給你一句白話說明,再附上精確定義與標準出處。每個欄位也都有微說明,不確定就照提示填;頂端還有「🧭 怎麼用?哪些區段我要填?」摺疊指引。新手照著做、專家也站得住。', 'New to the jargon? Every term in the workbench carries an ⓘ: tap it for a one-line explanation, then the precise definition and source. Every field also has a hint, and the top has a “🧭 How to use — which sections do I fill?” guide. Easy for newcomers, solid for experts.')}
        </div>
      </section>

      {/* 2. The cycle */}
      <section id="cycle" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('② 核心觀念:七步年度週期', '② The core: a 7-step annual cycle')}</h2>
        <p className="leading-relaxed text-gray-600">{t('碳管理不是「算一個數字」,而是一個每年重複的流程。工作台就是照這七步設計的:', 'Carbon management isn’t “one number” — it’s an annual loop. The workbench is built around these seven steps:')}</p>
        <ol className="space-y-2">
          {JOURNEY.map((s) => (
            <li key={s.id} className="flex gap-3 rounded-lg border border-gray-100 bg-white p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#89B56C] text-sm font-bold text-white">{s.num}</span>
              <div>
                <p className="font-semibold text-gray-900">{s.icon} {tObj(s.title)}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{tObj(s.plain)}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">{tObj(s.pro)}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-sm text-gray-500">{t('走完第 7 步,按「結轉下一年」就把邊界與係數帶到明年,再走一輪。', 'After step 7, “carry forward” brings your boundary and factors into next year — and the loop repeats.')}</p>
      </section>

      {/* 3. Feature-by-feature */}
      <section id="how" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('③ 逐項使用說明', '③ Feature-by-feature')}</h2>

        <Feature id="f-profile" shot={{ src: '/guide/g-profile.jpg', alt: t('① 公司基本:產業、年度、基準年與目標欄位', '① Company basics: industry, year, base year and target fields') }} icon="📝" title={t('填側寫(①–⑩,只填用得到的)', 'Fill the profile (①–⑩ — only what applies)')} lead={t('工作台最上面是公司側寫,共 ①–⑩ 區段。填一次,下面所有計算都用它;不是每段都要填——用得到的才填。第一次來可點頂端「🧭 怎麼用?哪些區段我要填?」看流程。', 'The top of the workbench is your profile, sections ①–⑩. Fill it once; everything below uses it. Not every section applies — fill what you need. First visit? Tap “🧭 How to use — which sections do I fill?” at the top.')}>
          <p>{t('① 公司基本:產業別、分析年度;若要管目標,順手填基準年、基準年排放、目標年、目標減量%(每欄旁都有說明,專有名詞點 ⓘ 看白話+定義)。', '① Basics: industry, analysis year; for target tracking, also set base year, base-year emissions, target year and target % (every field has a hint; tap the ⓘ on any term for a plain explanation + definition).')}</p>
          <p>{t('② 揭露:上市/上櫃與資本額——工具據此推你哪一年要編 IFRS S1/S2 永續揭露。', '② Disclosure: listed/OTC + capital tier — sets which year you must file IFRS S1/S2.')}</p>
          <p>{t('③ 供應鏈位置:商業模式(品牌/代工/零組件)、員工規模、客戶承諾的框架(RE100/SBTi/CDP)——決定你被要求碳數據的壓力。', '③ Supply-chain position: business model, headcount, customer frameworks — sets how hard you’ll be pushed for carbon data.')}</p>
          <p>{t('④ 出口與假設:是否出口歐盟、歐盟碳價(ETS)的低/中/高假設——驅動 CBAM 估算與敏感度區間。', '④ Export & assumptions: EU export? low/mid/high EU ETS price — drives the CBAM estimate and its sensitivity band.')}</p>
          <p>{t('⑤ 廠區盤查 · ⑥ CBAM 品項 · ⑦ Scope 3 · ⑧ 額外目標 · ⑨ 產品碳足跡 · ⑩ 客戶記分卡——下面逐項說明。⑥ 只有出口 CBAM 清單貨品才填;⑨⑩ 用得到再填。', '⑤ Facility inventory · ⑥ CBAM lines · ⑦ Scope 3 · ⑧ extra targets · ⑨ per-SKU PCF · ⑩ customer scorecard — each explained below. ⑥ only if you export CBAM-listed goods; ⑨⑩ if relevant.')}</p>
        </Feature>

        <Feature id="f-inventory" shot={{ src: '/guide/g-inventory.jpg', alt: t('盤查:活動量 × 係數 = tCO₂e,並顯示計算式、來源、市場基礎 Scope 2(以越南廠為例)', 'Inventory: activity × factor = tCO₂e with formula, source, market-based Scope 2 (Vietnam plant)') }} icon="📏" title={t('盤查:把排放一筆筆算出來(⑤⑦)', 'Inventory: compute emissions line by line (⑤⑦)')} lead={t('這是整套工具的地基。你可以「直接填總數」,或切到「從活動數據建模」逐項算出可查證的數字。', 'The foundation. Type a total, or switch to “build from activity data” for an auditable, line-by-line number.')}>
          <p>{t('每一行 = 活動量 × 排放係數 = tCO₂e,並顯示完整計算式與來源(供查證)。電力是 Scope 2、燃料/製程/冷媒是 Scope 1。', 'Each line = activity × factor = tCO₂e, with the full formula and source shown. Electricity is Scope 2; fuels/process/refrigerants are Scope 1.')}</p>
          <p>{t('海外廠會自動套該國電網係數:越南 0.6592、泰國 0.475、新加坡 0.402、台灣 0.474……(都可逐行覆寫為你的查證值)。', 'Overseas sites auto-use that country’s grid factor: Vietnam 0.6592, Thailand 0.475, Singapore 0.402, Taiwan 0.474… (each overridable).')}</p>
          <p>{t('填「綠電/PPA/REC 佔比」就會多算一個「市場基礎 Scope 2」與 RE100% (品牌客戶最看這個)。每行還能標數據品質(實測/發票/估算)與佐證來源,供查證留痕。', 'Enter your renewable % to also get market-based Scope 2 and RE100% (what brand customers check). Each line can carry a data-quality tier and evidence note for the audit trail.')}</p>
          <p>{t('Scope 3(⑦):代工/組裝業 90% 以上的碳在這裡。用「使用階段」算售出產品的用電(類別11)、用「支出基礎」估採購零件(類別1)。', 'Scope 3 (⑦): 90%+ of an assembler’s carbon is here. Use “use-phase” for sold-product electricity (Cat 11) and “spend-based” for purchased parts (Cat 1).')}</p>
          <p>{t('不知從何填起?點「✨ 帶入行業典型源」,工具依你的產業(電子、金屬、化工、水泥、食品…)一鍵補上典型排放源,你只要填數字。', 'Not sure where to start? Click “✨ load industry sources” and the tool seeds the typical emission sources for your industry (electronics, metals, chemicals, cement, food…) — you just fill the numbers.')}</p>
          <p>{t('半導體/面板/光電:製程含氟氣體(NF₃、CF₄、C₂F₆、SF₆)在「製程含氟氣體」類,係數採 IPCC AR5 GWP;若裝洗滌/燃燒設備,填「減排設備去除率 DRE %」,工具就以「毛排放 ×(1−DRE)」申報。水泥/化工的煅燒製程也有 IPCC 預設係數(熟料 0.52 等)。', 'Semiconductor/panel/PV: F-gases (NF₃, CF₄, C₂F₆, SF₆) live under “process F-gases” with IPCC AR5 GWP; if you run abatement, enter the “abatement DRE %” and the tool reports gross × (1 − DRE). Cement/chemicals calcination also has IPCC defaults (clinker 0.52, etc.).')}</p>
          <p>{t('每行可填「± 不確定性」與「數據品質(實測/發票/估算)」;盤查下方的「查證就緒度」會把它們彙總成整體 ±% 與品質分布——這是查證最先看的兩件事。', 'Each line takes a “± uncertainty” and a “data quality (measured/invoice/estimate)”; the “assurance readiness” box below rolls them into an overall ±% and a quality mix — the first two things assurance checks.')}</p>
          <Shot src="/guide/g-fgas.jpg" alt={t('半導體製程含氟氣體 NF₃ × IPCC AR5 GWP,經 95% 減排設備去除率後申報;下方查證就緒度彙總整體不確定性與數據品質', 'Semiconductor F-gas NF₃ × IPCC AR5 GWP reported after 95% abatement DRE; assurance-readiness rolls up uncertainty and data quality below')} />
          <p className="rounded bg-amber-50 px-2 py-1 text-[13px] text-amber-800">{t('提醒:切到「盤查」卻還沒填活動量時,碳費不會被歸零——會暫用你原填的總數,並提示你完成盤查。', 'Note: switching to inventory before entering data won’t zero your fee — it falls back to your typed total and flags it.')}</p>
        </Feature>

        <Feature id="f-target" shot={{ src: '/guide/g-target.jpg', alt: t('目標管理:基準年到目標年的軌跡、今年是否在軌、SBTi 對齊', 'Target management: pathway, this-year on-track status, SBTi alignment') }} icon="🎯" title={t('目標管理:多條目標、各自範疇、看是否在軌', 'Targets: multiple, each on its own scope, on-track check')} lead={t('填了基準年、基準年排放、目標年、目標% 之後,結果區會出現「減量目標管理」。', 'Once base year + base emissions + target year + target % are set, a “target management” panel appears.')}>
          <p>{t('它畫出基準年到目標年的線性軌跡,標出今年「該降到多少」、實際排多少、差多少(在軌/落後),並把你的隱含年減% 跟 SBTi 1.5°C 最低 4.2%/年比對。', 'It draws the linear pathway, shows this year’s allowance vs actual (on track / behind), and compares your implied annual % to the SBTi 1.5°C minimum of 4.2%/yr.')}</p>
          <p>{t('範疇一致很重要:在 ① 選「目標範疇」(Scope 1+2 / 1+2+3 / Scope 3),基準、目標與「今年實際」都會用同一範疇比較——避免拿 Scope 1+2 的基準去比全足跡而誤判嚴重落後。', 'Scope consistency matters: pick the “target scope” in ① (Scope 1+2 / 1+2+3 / Scope 3) and the base, target and “this-year actual” are all compared on that same scope — so a Scope 1+2 base isn’t mismeasured against the whole footprint.')}</p>
          <p>{t('一個 SBTi 承諾通常是一組目標。在 ⑧「額外減量目標」可加「近期 Scope 3」「2050 淨零」,工作台會把每條目標各自於所屬範疇追軌、並列顯示。', 'An SBTi commitment is usually a set. Under ⑧ “extra targets” add a near-term Scope 3 and a 2050 net-zero — each is tracked on its own boundary and shown side by side.')}</p>
          <p>{t('Scope 2 為主的公司(如晶圓廠):面板下方的「RE100 ↔ Scope 1+2 目標連動」會反推——要達成你的營運目標,綠電需到百分之幾(對照目前%);若連 100% 綠電都不夠,會提示須同步削減 Scope 1。', 'For Scope-2-heavy companies (e.g. fabs): the “RE100 ↔ Scope 1+2 target” line reverse-solves the renewable % needed to hit your operational target (vs your current %); if even 100% renewable falls short, it flags that you must also cut Scope 1.')}</p>
        </Feature>

        <Feature id="f-reduce" shot={{ src: '/guide/g-reduction.jpg', alt: t('減碳鏡:拉動目標減量%,同時看碳費與 CBAM 前後變化', 'Reduction lens: drag the target % to see fee + CBAM move together') }} icon="📉" title={t('減碳鏡:一個目標牽動三筆', 'Reduction lens: one target, three levers')} lead={t('拉動「目標減量%」滑桿(會自動帶入你設的目標),看同一個減量如何同時降低碳費與(有實際數據時的)CBAM。', 'Drag the “target reduction %” (seeded from your set target) to see one cut lower the carbon fee and — with actual data — CBAM together.')}>
          <p>{t('減量槓桿(綠電、能效、製程、燃料轉換)是質性列出的——本工具不會給你沒有依據的「每噸減碳成本」。', 'Reduction levers are listed qualitatively — the tool never invents an unsourced “cost per tonne abated”.')}</p>
        </Feature>

        <Feature id="f-assure" shot={{ src: '/guide/g-assurance.jpg', alt: t('查證定版:凍結已查證盤查、留簽核與版本軌跡', 'Assurance: freeze the verified inventory with signer and version trail') }} icon="🔒" title={t('查證定版:把已查證的數字凍結', 'Assurance: freeze the verified number')} lead={t('盤查經內審/查證後,按「凍結此版本」,填版本名與簽核人,就把當下整份側寫鎖成一個版本。', 'After review/assurance, “freeze this version” with a label and signer to lock the whole profile as a version.')}>
          <p>{t('版本清單就是你的變更軌跡;任何一版都能「還原」回來重現或比對。這是自我聲明的凍結紀錄,不是第三方查證。', 'The version list is your change trail; any version can be “restored” to reproduce/compare. It’s a self-attested freeze, not third-party assurance.')}</p>
        </Feature>

        <Feature id="f-cycle" shot={{ src: '/guide/g-cycle.jpg', alt: t('週期狀態看板與年度義務行事曆(含截止日、倒數與法源)', 'Cycle status board and obligation calendar with due dates, countdowns and sources') }} icon="🗓" title={t('週期狀態 + 義務行事曆', 'Cycle status + obligation calendar')} lead={t('結果區頂端有一條週期看板(盤查中→內審→查證中→已查證→已申報→已揭露),點一下標記你目前所在階段。', 'A status bar at the top of the results (measuring → review → assurance → assured → filed → disclosed) — tap your current stage.')}>
          <p>{t('下面是依你側寫導出的年度義務行事曆:碳費申報(5/31)、CBAM 申報、永續報告書、CDP——每筆都有截止日、倒數天數與法源。', 'Below it, an obligation calendar derived from your profile: carbon-fee filing (May 31), CBAM, sustainability report, CDP — each with a due date, countdown and source.')}</p>
        </Feature>

        <Feature id="f-results" icon="📊" title={t('看結果:總足跡、碳 P&L、先做哪件', 'Read results: footprint, carbon P&L, do-this-first')} lead={t('按「計算我的合規全貌」後,結果由上而下:', 'After “compute”, results read top-down:')}>
          <p>{t('總碳足跡(Scope 1+2+3)領銜,並拆出 Scope 3 占比與每單位 PCF——避免「碳費近零」誤導你以為碳風險小。', 'Total footprint (Scope 1+2+3) leads, with Scope 3 share and per-unit PCF — so a near-zero fee doesn’t mislead you.')}</p>
          <Shot src="/guide/g-footprint.jpg" alt={t('總碳足跡(Scope 1+2+3)領銜、Scope 3 占比、每台 PCF', 'Total footprint leads, with Scope 3 share and per-unit PCF')} />
          <p>{t('接著是碳 P&L 四卡(碳費/CBAM/IFRS/供應鏈)、碳費算式(可給查核員)、「先做哪件」優先序(依工作量與死線排,不只看金額)、CBAM 逐年暴露圖。', 'Then the carbon P&L (fee/CBAM/IFRS/supply-chain), an auditor-ready fee breakdown, a “do this first” priority list (by workload + deadline, not just money), and the CBAM ramp chart.')}</p>
          <Shot src="/guide/g-pnl.jpg" alt={t('「先做哪件」跨義務優先序(依工作量與死線排)', 'The “do this first” cross-obligation priority list (by workload + deadline)')} />
          <p>{t('結果頁底部還有「延伸閱讀」——依你這次分析的情境(CBAM/碳費/RE100/目標…)+ 你的產業與國別,自動配對 5–10 則 RECCESSARY 的碳與綠電新聞、政策與市場觀察(外部連結),想多了解時可延伸。', 'At the bottom of the results, “Further reading” surfaces 5–10 RECCESSARY articles (carbon & clean-energy news, policy and market analysis) matched to this analysis’ context (CBAM/carbon fee/RE100/targets…) plus your industry and country — external links to go deeper.')}</p>
        </Feature>

        <Feature id="f-deduction" shot={{ src: '/guide/g-deduction.jpg', alt: t('碳費 × CBAM 交叉抵扣:原產國已付碳價抵掉部分 CBAM,得出淨 CBAM', 'Carbon fee × CBAM cross-deduction: origin carbon price nets down the gross CBAM') }} icon="💶" title={t('碳費 × CBAM 交叉抵扣(雙軌別重複付)', 'Carbon fee × CBAM cross-deduction')} lead={t('如果你既繳國內碳費、又出口 CBAM 清單貨品,別把同一份碳付兩次。', 'If you pay a domestic carbon fee AND export CBAM-listed goods, don’t pay for the same carbon twice.')}>
          <p>{t('依 Reg (EU) 2023/956 §9,原產國已付的碳價可從 CBAM 義務抵扣。面板會列出:CBAM 毛額 −(原產國已付碳價 × 內含排放)= 淨 CBAM,並標各國認定信心(新加坡/韓國高、台灣/日本中、泰國低、越南無)。', 'Under Reg (EU) 2023/956 §9 the carbon price paid in origin is deductible from CBAM. The panel shows gross CBAM − (origin price × embedded) = net CBAM, with a per-country confidence (SG/KR high, TW/JP medium, TH low, VN none).')}</p>
          <p>{t('注意:抵扣的受益者是歐盟進口商,你需提供已付碳價證明;且盤查→CBAM 內含排放可由你的廠區盤查自動分攤(在 ⑥ 選「盤查分攤」)。', 'Note: the EU importer benefits and needs your proof of payment; and the CBAM embedded emissions can be auto-allocated from your facility inventory (pick “allocated” in ⑥).')}</p>
        </Feature>

        <Feature id="f-pcf" shot={{ src: '/guide/g-pcf.jpg', alt: t('產品碳足跡(每料號):組織足跡依數量/質量/營收分攤,得每單位 kgCO₂e', 'Per-SKU PCF: org footprint allocated by units/mass/revenue → kgCO₂e per unit') }} icon="🏷️" title={t('產品碳足跡(每料號):給品牌客戶的硬通貨', 'Product carbon footprint (per SKU)')} lead={t('品牌客戶越來越要「每個產品多少碳」,不只組織總量。在 ⑨ 建立產品清單就能算。', 'Brands increasingly want carbon per product, not just an org total. List your products in ⑨ to get it.')}>
          <p>{t('選「系統邊界」(營運 Scope 1+2 / 含價值鏈 Scope 1+2+3)與「分攤基礎」(數量/質量/營收),工具把總足跡分攤到各料號,算出每單位 kgCO₂e。質量或營收基礎能讓重/貴的產品分到較多碳。', 'Pick the boundary (operations / incl. value chain) and the allocation basis (units/mass/revenue); the tool splits the total across SKUs into per-unit kgCO₂e. Mass or revenue basis gives heavier/pricier products a larger share.')}</p>
          <p>{t('用底部「⬇ 產品碳足跡聲明」匯出一頁聲明給客戶。這是「組織足跡分攤」的篩選級估算(ISO 14067 精神),不是第三方查證 LCA,聲明上會明確標示。', 'Export a one-page declaration via “⬇ PCF declaration”. It’s a screening allocation of the org footprint (ISO 14067-aligned), not a verified LCA, and says so.')}</p>
        </Feature>

        <Feature id="f-questionnaire" shot={{ src: '/guide/g-questionnaire.jpg', alt: t('客戶問卷回覆:盤查/目標對映 CDP/品牌/SBTi 欄位,標可回覆/部分/待補', 'Customer questionnaire: inventory/targets mapped to CDP/brand/SBTi fields with ready/partial/missing') }} icon="🔗" title={t('客戶問卷回覆:把數據變成交得出去的答案', 'Customer questionnaire: turn data into answers')} lead={t('中小供應商做碳,多半是因為客戶要你填問卷。這個面板直接幫你「交差」。', 'SMEs usually do carbon because a customer asked. This panel helps you actually answer.')}>
          <p>{t('「客戶問卷回覆」把你算好的盤查、目標、查證狀態,對映成 CDP 供應鏈、品牌客戶 ESG 問卷、SBTi 供應商常問的欄位,逐欄標 ✅ 可直接回覆 / 🟡 部分 / ⬜ 待補,並把缺的列成清單(例如「Scope 3 只到類別1,多數客戶還要類別11」)。', 'It maps your inventory, targets and verification status to CDP Supply Chain, brand ESG forms and SBTi supplier asks — each marked ✅ ready / 🟡 partial / ⬜ to-do, with the gaps listed (e.g. “Scope 3 only to Cat 1; most customers also want Cat 11”).')}</p>
          <p>{t('缺資料一律標「—」、不會幫你編數字。用底部「⬇ 客戶問卷回覆包」匯出純文字,直接貼進客戶的問卷或郵件。', 'Missing data shows “—”; nothing is fabricated. Export via “⬇ customer answer pack” and paste straight into the customer’s form or email.')}</p>
        </Feature>

        <Feature id="f-scorecard" shot={{ src: '/guide/g-scorecard.jpg', alt: t('客戶記分卡:逐客戶碳/ESG 門檻 vs 達標、接單風險、跨客戶槓桿', 'Customer scorecard: each customer’s carbon/ESG bar vs your status, order risk, cross-customer leverage') }} icon="🎯" title={t('客戶記分卡:把碳變成接單競爭力', 'Customer scorecard: turn carbon into order-winning')} lead={t('ESG 已從「加分項」變成「門票」——客戶用碳/ESG 門檻決定下不下單。在 ⑩ 登記每個客戶的要求,工具逐客戶幫你看「達標沒、會不會被抽單」。', 'ESG has gone from a bonus to a ticket — customers decide orders on carbon/ESG bars. Log each customer’s requirements in ⑩ and the tool flags, per customer, whether you’re met and whether your order is at risk.')}>
          <p>{t('每個客戶的要求各不同。在 ⑩ 從範本(對映 CDP/EcoVadis/SBTi/RE100 等公開框架)一鍵建立客戶,再依實際合約調門檻;每條要求可設「門票」(必達,否則抽單)或「計分」(加權)。CDP/EcoVadis/S&P 等外部評級工具算不出,在 ⑩ 自評填入。', 'Each customer asks for different things. In ⑩, add a customer from a template (mapped to public frameworks: CDP/EcoVadis/SBTi/RE100), then tweak thresholds to your real contract; each requirement is a “gate” (must-pass or you’re dropped) or “scored” (weighted). External ratings (CDP/EcoVadis/S&P) the tool can’t compute — self-declare them in ⑩.')}</p>
          <p>{t('結果區的「客戶記分卡」用你算好的盤查、目標、綠電、查證,逐客戶標 ✅達標/🟡部分/⬜未達,並把客戶排成 🔴抽單風險／🟡需補強／🟢首選供應商。最有用的是「最高槓桿」:它告訴你「補上哪一項,可同時解鎖最多客戶的門票」。', 'The “customer scorecard” in the results reads your computed inventory, targets, renewables and verification to mark each customer ✅/🟡/⬜, and ranks them 🔴 at-risk / 🟡 needs-work / 🟢 preferred. The standout is “highest leverage”: it tells you which single fix unblocks the most customers’ gates.')}</p>
          <p>{t('用底部「⬇ 客戶記分卡」匯出純文字,當作內部「哪個客戶最危險、先補什麼」的行動清單。狀態僅供內部管理,非客戶正式評分。', 'Export “⬇ customer scorecard” as an internal “which customer is most at risk, fix what first” action list. Status is for internal management — not an official customer score.')}</p>
        </Feature>

        <Feature id="f-loop" shot={{ src: '/guide/g-snapshot.jpg', alt: t('快照歷史:總足跡與 vs 前次的 Δ%;旁邊可「結轉下一年」', 'Snapshot history: footprint and Δ% vs prior; “carry forward to next year” beside it') }} icon="🔁" title={t('年對年閉環:拍快照、結轉下一年', 'Close the loop: snapshot & carry forward')} lead={t('「拍下這次快照」把總額存進歷史;歷史表會顯示總足跡與 vs 前次的 Δ%。', '“Take a snapshot” saves totals to history; the table shows footprint and Δ% vs the prior one.')}>
          <p>{t('「結轉下一年」會複製側寫、把年度 +1、沿用邊界與係數,讓你明年從這裡接著盤——週期才真正閉環。', '“Carry forward” clones the profile, bumps the year, keeps boundaries and factors — so next year picks up here. That closes the loop.')}</p>
        </Feature>
      </section>

      {/* 4. Worked example */}
      <section id="walk" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('④ 實例導覽:AI 伺服器組裝代工廠', '④ Worked example: an AI-server assembly ODM')}</h2>
        <p className="leading-relaxed text-gray-600">
          {t('情境:一家台灣 AI 伺服器 ODM 代工廠「宏碩 AI Server」,在越南、泰國設有組裝廠,出口歐盟,品牌客戶要求 SBTi 與 CDP。以下照七步走一遍(數字都是工具實算結果,你可照填重現)。', 'Scenario: a Taiwan AI-server ODM with assembly plants in Vietnam and Thailand, exporting to the EU, with brand customers demanding SBTi and CDP. Here’s the seven-step run (all figures are real tool outputs you can reproduce).')}
        </p>

        <Card><CardContent className="space-y-5 py-5">
          <Walk n={1} title={t('填側寫', 'Fill the profile')} shot={{ src: '/guide/g-profile.jpg', alt: t('在 ① 填入產業、年度、基準年 2024、基準排放 40,000 t、目標 2030 −30%', 'In ①: industry, year, base year 2024, base 40,000 t, target 2030 −30%') }}>
            <p>{t('① 產業=電子/半導體、年度 2026、基準年 2024、基準年排放 40,000 t、目標年 2030、目標減量 30%。② 上市、資本逾 100 億。③ 商業模式=ODM 代工、員工逾千、客戶框架 SBTi+CDP。④ 出口歐盟=是。', '① Industry = electronics, year 2026, base year 2024, base emissions 40,000 t, target year 2030, target −30%. ② Listed, capital >NT$10bn. ③ ODM, >1,000 staff, frameworks SBTi+CDP. ④ Exports to EU = yes.')}</p>
          </Walk>

          <Walk n={2} title={t('建越南廠盤查(電力)', 'Build the Vietnam plant inventory (electricity)')} shot={{ src: '/guide/g-inventory.jpg', alt: t('越南廠:8,000,000 度 × 0.6592 = 5,273.6 t,綠電 40% → 市場基礎 3,164 t', 'Vietnam: 8,000,000 kWh × 0.6592 = 5,273.6 t; 40% renewable → market-based 3,164 t') }}>
            <p>{t('新增廠區「越南廠」、國別=越南,切到「從活動數據建模」,排放源選「外購電力」、活動量填 8,000,000 度。工具自動套越南電網係數 0.6592:', 'Add “Vietnam plant”, country = Vietnam, switch to activity-data, pick electricity, enter 8,000,000 kWh. The tool auto-applies Vietnam’s 0.6592 grid factor:')}</p>
            <p className="rounded bg-gray-50 px-2 py-1 font-mono text-[13px] text-gray-700">8,000,000 × 0.6592 ÷ 1000 = 5,273.6 tCO₂e（Scope 2 地點基礎）</p>
            <p>{t('再填「綠電佔比 40%」→ 多出市場基礎 Scope 2 = 5,273.6 × 60% = 3,164 t,RE100 40%。', 'Set renewable 40% → market-based Scope 2 = 5,273.6 × 60% = 3,164 t, RE100 40%.')}</p>
          </Walk>

          <Walk n={3} title={t('加泰國廠', 'Add the Thailand plant')}>
            <p>{t('同樣方式,泰國廠電力 5,000,000 度 × 0.475(泰國 TGO)= 2,375 t。兩廠 Scope 1+2 合計 ≈ 7,649 t。', 'Same way: Thailand 5,000,000 kWh × 0.475 (TGO) = 2,375 t. Both plants’ Scope 1+2 ≈ 7,649 t.')}</p>
          </Walk>

          <Walk n={4} title={t('量化 Scope 3(這才是大宗)', 'Quantify Scope 3 (this is the big one)')} shot={{ src: '/guide/g-scope3.jpg', alt: t('⑦ Scope 3 類別11 使用階段:台數×W×時數×年×電網係數 = 22,426 t', '⑦ Scope 3 Cat 11 use-phase: units×W×hours×years×grid = 22,426 t') }}>
            <p>{t('在 ⑦ 新增一筆,類別 11(售出產品使用)、方法=使用階段,填:2,000 台 × 800 W × 8,760 小時/年 × 4 年壽命 × 0.4 kgCO₂e/kWh:', 'In ⑦ add Cat 11 (use of sold products), method = use-phase: 2,000 units × 800 W × 8,760 h/yr × 4 yr × 0.4 kgCO₂e/kWh:')}</p>
            <p className="rounded bg-gray-50 px-2 py-1 font-mono text-[13px] text-gray-700">2000 × 800 × 8760 × 4 × 0.4 ÷ 1,000,000 = 22,426 tCO₂e</p>
            <p>{t('再填「年售出 2,000 台、單位=台」,工具就能算每台 PCF。', 'Enter “2,000 units/yr, unit = server” so the tool can compute per-unit PCF.')}</p>
          </Walk>

          <Walk n={5} title={t('按「計算」,看全貌', 'Compute and read the picture')} shot={{ src: '/guide/g-footprint.jpg', alt: t('計算後:總足跡 30,074 t、Scope 1+2 僅 7,649 t、Scope 3 75%、每台 PCF 15,037', 'After compute: total 30,074 t, Scope 1+2 only 7,649 t, Scope 3 75%, PCF 15,037') }}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Num label={t('總碳足跡', 'Total footprint')} value="30,074" sub="tCO₂e" />
              <Num label={t('Scope 3 占比', 'Scope 3 share')} value="75%" sub={t('價值鏈', 'value chain')} />
              <Num label={t('每台 PCF', 'Per-server PCF')} value="15,037" sub="kgCO₂e" />
              <Num label={t('市場基礎 Scope 2', 'Market Scope 2')} value="3,164" sub={t('越南廠', 'VN plant')} />
            </div>
            <p>{t('重點:你自己營運(Scope 1+2)只有 ~7,649 t,但加上售出伺服器的使用階段,總足跡衝到 30,074 t——Scope 3 佔 75%。這正是客戶要你揭露的數字。', 'Key insight: your own operations (Scope 1+2) are only ~7,649 t, but with the sold servers’ use-phase the total jumps to 30,074 t — Scope 3 is 75%. That’s exactly what customers want disclosed.')}</p>
          </Walk>

          <Walk n={6} title={t('目標、CBAM、行事曆', 'Targets, CBAM, calendar')} shot={{ src: '/guide/g-cycle.jpg', alt: t('義務行事曆:碳費 2027-05-31、報告書 2027-03-31、CDP 2027-07-31,含倒數', 'Calendar: carbon fee 2027-05-31, report 2027-03-31, CDP 2027-07-31, with countdowns') }}>
            <p>{t('目標管理顯示:2026 年該降到 ~36,000 t、實際 30,074 t → ✓ 在軌;隱含年減 5%/年 ✓ 達 SBTi 1.5°C(≥4.2%)。', 'Target panel: 2026 allowance ~36,000 t, actual 30,074 t → ✓ on track; implied 5%/yr ✓ meets SBTi 1.5°C (≥4.2%).')}</p>
            <p>{t('CBAM:成品伺服器不在 CBAM 清單上——若你出口鋁機殼等清單貨品,才在 ⑥ 申報;否則此區留空即可(工具會提示)。', 'CBAM: finished servers are not on the CBAM list — only list goods (e.g. aluminium chassis) go in ⑥; otherwise leave it empty (the tool says so).')}</p>
            <p>{t('行事曆自動列出:碳費申報 2027-05-31、永續報告書 2027-03-31、CDP 2027-07-31,各含倒數與法源。', 'The calendar lists carbon-fee filing 2027-05-31, sustainability report 2027-03-31, CDP 2027-07-31 — each with a countdown and source.')}</p>
          </Walk>

          <Walk n={7} title={t('定版、匯出、結轉', 'Lock, export, carry forward')} shot={{ src: '/guide/g-exports.jpg', alt: t('匯出鈕:盤查清冊(CSV)、揭露報告段落、CBAM 溝通範本、結轉下一年', 'Export buttons: inventory CSV, disclosure draft, CBAM template, carry forward') }}>
            <p>{t('查證後按「凍結此版本」存成「FY2025 已查證版」。下載「盤查清冊(CSV)」交查核、「揭露報告段落」貼進報告書、「CBAM 溝通範本」給買家。最後按「結轉下一年(2027)」,明年從這裡接著盤。', 'After assurance, “freeze” it as “FY2025 assured”. Download the inventory CSV for auditors, the disclosure draft for the report, the CBAM template for buyers. Finally “carry forward to 2027” and pick up there next year.')}</p>
          </Walk>
        </CardContent></Card>
      </section>

      {/* 4.5 New-feature worked cases */}
      <section id="cases" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{t('⑤ 新功能實例:四個產業案例', '⑤ New features: four industry cases')}</h2>
        <p className="leading-relaxed text-gray-600">{t('除了上面的 AI 伺服器代工廠,以下用四個不同產業的實例,示範各自最有感的新功能(數字皆為工具實算結果)。', 'Beyond the AI-server ODM above, here are four different industries showing the new features each cares about most (all figures are real tool outputs).')}</p>

        <Card><CardContent className="space-y-3 py-5">
          <p className="font-semibold text-gray-900">{t('🔩 金屬零件廠(鋼鋁出口歐盟,越南／泰國設廠)', '🔩 Metal-parts maker (steel/aluminium to the EU; VN/TH plants)')}</p>
          <p className="text-sm leading-relaxed text-gray-600">{t('重點功能:目標範疇一致、碳費×CBAM 交叉抵扣、盤查→CBAM 分攤。', 'Key features: target-scope consistency, carbon fee × CBAM cross-deduction, inventory→CBAM allocation.')}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Num label={t('今年實際(Scope 1+2)', 'Actual (Scope 1+2)')} value="11,380" sub={t('落後目標僅 580 t', 'behind by only 580 t')} />
            <Num label={t('淨 CBAM', 'Net CBAM')} value="€24,927" sub={t('抵掉已付碳價 −€369', 'less €369 carbon price')} />
            <Num label={t('CBAM 內含排放(分攤)', 'Embedded SEE (allocated)')} value="0.216" sub="tCO₂e/t" />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">{t('在 ① 把「目標範疇」設成 Scope 1+2 後,「今年實際」改以 Scope 1+2(11,380 t)和基準比較,落後幅度從誤判的 +84,880 修正為合理的 +580。碳費×CBAM 面板顯示台灣已付碳價可抵 €369、淨 CBAM €24,927(信心「中」)。CBAM 內含排放不必手填——在 ⑥ 選「盤查分攤」,由台灣廠盤查自動分攤出 0.216 tCO₂e/t。', 'Setting the “target scope” to Scope 1+2 in ① makes the “actual” compare on Scope 1+2 (11,380 t), correcting the gap from a mismeasured +84,880 to a realistic +580. The cross-deduction panel nets €369 of Taiwan carbon price already paid → net CBAM €24,927 (medium confidence). The CBAM embedded value needn’t be typed — “allocated” in ⑥ derives 0.216 tCO₂e/t from the Taiwan plant inventory.')}</p>
        </CardContent></Card>

        <Card><CardContent className="space-y-3 py-5">
          <p className="font-semibold text-gray-900">{t('🧪 化工廠(肥料出口歐盟,含製程排放)', '🧪 Chemicals plant (fertilizer to the EU; process emissions)')}</p>
          <p className="text-sm leading-relaxed text-gray-600">{t('重點功能:多重減量目標、不確定性與數據品質彙總、製程煅燒係數。', 'Key features: multiple targets, uncertainty + data-quality rollup, process calcination factors.')}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Num label={t('整體不確定性', 'Overall uncertainty')} value="±11.2%" sub={t('涵蓋 100% 排放', 'covers 100%')} />
            <Num label={t('近期 Scope 3 目標', 'Near-term Scope 3')} value="−25%" sub={t('4.17%/年 ✗ 未達 SBTi', '4.17%/yr ✗ below SBTi')} />
            <Num label={t('熟料煅燒製程排放', 'Clinker calcination')} value="15,600" sub={t('30,000 t × 0.52', '30,000 t × 0.52')} />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">{t('在 ⑧ 加上「近期 Scope 3 −25%」與「2050 淨零 −90%」兩條目標,工作台把三條目標各自於所屬範疇並列追軌——並自動標出 Scope 3 目標的隱含年減 4.17%/年未達 SBTi 4.2%(單一目標看不到的洞察)。盤查逐行填 ± 不確定性後,「查證就緒度」彙總出整體 ±11.2%、數據品質「發票 57%／估算 43%」。製程排放用內建「水泥熟料煅燒 0.52」即可,不必表外手算。', 'Adding “near-term Scope 3 −25%” and “2050 net-zero −90%” in ⑧ tracks all three targets side by side on their own boundaries — and flags that the Scope 3 target’s 4.17%/yr implied cut is below the SBTi 4.2% (an insight a single target hides). With per-line ±% entered, “assurance readiness” rolls up to ±11.2% and a quality mix of “invoice 57% / estimate 43%”. Process emissions use the built-in “clinker calcination 0.52”, no off-sheet hand-calc.')}</p>
        </CardContent></Card>

        <Card><CardContent className="space-y-3 py-5">
          <p className="font-semibold text-gray-900">{t('🔌 半導體晶圓廠(Scope 2 為主,越南封測)', '🔌 Semiconductor fab (Scope-2 heavy; VN packaging/test)')}</p>
          <p className="text-sm leading-relaxed text-gray-600">{t('重點功能:製程含氟氣體、減排設備 DRE、RE100 ↔ Scope 1+2 目標反推。', 'Key features: process F-gases, abatement DRE, RE100 ↔ Scope 1+2 reverse-solve.')}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Num label={t('NF₃ 毛排放', 'NF₃ gross')} value="80,500" sub={t('5,000 kg × 16,100', '5,000 kg × 16,100')} />
            <Num label={t('經 95% DRE 後', 'After 95% DRE')} value="4,025" sub={t('×(1−0.95)', '× (1 − 0.95)')} />
            <Num label={t('達標所需綠電', 'Renewable for target')} value="25.1%" sub={t('目前 25%', 'now 25%')} />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">{t('蝕刻/清潔的 NF₃ 在「製程含氟氣體」類選得到,GWP 16,100:5,000 kg → 毛 80,500 t;填「減排設備去除率 95%」後,申報排放 = 80,500 ×(1−0.95)= 4,025 t,計算式直接顯示。目標面板下方的「RE100 連動」反推:要讓 Scope 1+2 達 −42%,綠電需到 25.1%(目前 25%,只差一點)——把 RE100 直接接上減量目標。', 'Etch/clean NF₃ is selectable under “process F-gases”, GWP 16,100: 5,000 kg → gross 80,500 t; enter “abatement DRE 95%” and reported = 80,500 × (1 − 0.95) = 4,025 t, with the formula shown. The “RE100 linkage” below the target reverse-solves: hitting −42% on Scope 1+2 needs 25.1% renewable (now 25%, just shy) — tying RE100 straight to the target.')}</p>
        </CardContent></Card>

        <Card><CardContent className="space-y-3 py-5">
          <p className="font-semibold text-gray-900">{t('🏭 中小供應商(電子代工,被品牌客戶要碳數據)', '🏭 SME supplier (electronics; pushed by brand customers)')}</p>
          <p className="text-sm leading-relaxed text-gray-600">{t('重點功能:行業範本帶入、客戶問卷回覆、每料號產品碳足跡、客戶記分卡。', 'Key features: industry templates, customer questionnaire, per-SKU PCF, customer scorecard.')}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Num label={t('一鍵帶入排放源', 'Sources loaded')} value="+5" sub={t('電子典型源', 'electronics template')} />
            <Num label={t('客戶問卷可回覆', 'Questionnaire ready')} value="12/17" sub={t('其餘列為缺口', 'rest listed as gaps')} />
            <Num label={t('每料號 PCF', 'Per-SKU PCF')} value="35.72 / 892.9" sub={t('連接器／模組 kgCO₂e', 'connector/module kgCO₂e')} />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">{t('沒有專職 ESG?在盤查點「✨ 帶入行業典型源」,電子廠一鍵補上 5 個典型源(含 NF₃/CF₄/SF₆),只要填數字。算完後「客戶問卷回覆」顯示「可回覆 12/17」,Scope 2 自動給地點 1,422 與市場 1,280 兩個值,缺的(如查證等級)列成待補。在 ⑨ 建兩個產品、用「質量」分攤,得連接器 35.72、模組 892.9 kgCO₂e/單位——較重的模組分到較多碳。最後匯出「客戶問卷回覆包」與「產品碳足跡聲明」貼給客戶。', 'No dedicated ESG staff? Click “✨ load industry sources” and the electronics template seeds 5 typical sources (incl. NF₃/CF₄/SF₆) — just fill numbers. After computing, “customer questionnaire” shows “ready 12/17”, Scope 2 auto-gives location 1,422 and market 1,280, and the gaps (e.g. assurance level) are listed. Build two products in ⑨ on a mass basis → connector 35.72, module 892.9 kgCO₂e/unit (the heavier module carries more). Finally export the “customer answer pack” and “PCF declaration” to send the customer.')}</p>
          <p className="text-sm leading-relaxed text-gray-600">{t('再到 ⑩ 把幾個大客戶建起來(範本選好、調門檻):若兩個客戶都要 EcoVadis 金獎而你只有銀,記分卡會把這兩家列「抽單風險」,並在「最高槓桿」直接告訴你「補上 EcoVadis 獎章可同時解鎖 2 個客戶」——一眼看出先補哪一項最划算。', 'Then in ⑩ add your big customers (pick a template, set thresholds): if two customers both want EcoVadis Gold but you’re Silver, the scorecard flags both “at risk” and the “highest leverage” line tells you “closing the EcoVadis gap unblocks 2 customers” — so you see at a glance which single fix pays off most.')}</p>
        </CardContent></Card>
      </section>

      {/* 5. Deliverables */}
      <section id="deliver" className="scroll-mt-20 space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">{t('⑥ 匯出與交付', '⑥ Exports & deliverables')}</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-gray-600">
          <li>{t('• 側寫 JSON:換電腦或多廠彙整用——匯出存檔、之後匯入即還原。', '• Profile JSON: for switching machines / merging plants — export then import to restore.')}</li>
          <li>{t('• 盤查清冊 CSV:逐排放源含係數、來源、Scope、數據品質、佐證、tCO₂e——Excel 可開,交查證的工作底稿。', '• Inventory sheet CSV: every source with factor, source, scope, data quality, evidence, tCO₂e — opens in Excel, the assurance working paper.')}</li>
          <li>{t('• 揭露報告段落:IFRS S1/S2 四支柱草稿,已用你的實算數字預填,定性內容留空待你補。', '• Disclosure draft: an IFRS S1/S2 four-pillar draft pre-filled with your numbers; qualitative parts left to complete.')}</li>
          <li>{t('• CBAM 設施溝通範本:依 Reg (EU) 2023/956 欄位整理,給歐盟買家所需的設施資料。', '• CBAM communication template: per Reg (EU) 2023/956, the installation data your EU buyer needs.')}</li>
          <li>{t('• 客戶問卷回覆包:盤查/目標對映 CDP 供應鏈、品牌客戶、SBTi 供應商欄位,標可回覆/缺口的純文字,直接貼進客戶問卷。', '• Customer answer pack: your inventory/targets mapped to CDP, brand and SBTi fields with ready/gap flags — paste straight into the customer’s form.')}</li>
          <li>{t('• 每料號產品碳足跡聲明:各料號的邊界、分攤基礎、每單位 kgCO₂e 與篩選級聲明,給品牌客戶的一頁文件。', '• Per-SKU PCF declaration: each SKU’s boundary, allocation basis, kgCO₂e/unit and screening statement — a one-page document for brands.')}</li>
          <li>{t('• 客戶記分卡:逐客戶達標/缺口 + 接單風險 + 「補哪一項解鎖最多客戶」的純文字行動清單,內部決策用。', '• Customer scorecard: per-customer met/gaps + order risk + the “fix-this-first” leverage list — a plain-text internal action list.')}</li>
        </ul>
        <p className="text-sm text-gray-500">{t('所有匯出都在前端產生、直接下載,不經伺服器。', 'All exports are generated in your browser and downloaded directly — nothing leaves your device.')}</p>
        <Shot src="/guide/g-exports.jpg" alt={t('工作台底部的匯出列:側寫 JSON、盤查清冊、CBAM 範本、報告草稿', 'Export row at the bottom: profile JSON, inventory sheet, CBAM template, report draft')} />
      </section>

      {/* 6. FAQ */}
      <section id="faq" className="scroll-mt-20 space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">{t('⑦ 常見問題', '⑦ FAQ')}</h2>
        {[
          { q: t('我的資料會被上傳嗎?', 'Is my data uploaded?'), a: t('不會。側寫、快照、凍結版本都只存在你的瀏覽器(localStorage),不經伺服器、免註冊。換電腦請用「匯出側寫 JSON」搬移。', 'No. Your profile, snapshots and locked versions live only in your browser (localStorage) — no server, no signup. Use “export profile JSON” to move machines.')},
          { q: t('海外廠的用電碳排怎麼算才對?', 'How are overseas plants’ electricity emissions calculated?'), a: t('工具依廠區國別自動套該國電網係數(如越南 0.6592、泰國 0.475),不會誤用台灣值。係數逐年公布、可逐行覆寫為你查證的最新值。', 'The tool auto-applies each country’s grid factor (e.g. Vietnam 0.6592, Thailand 0.475), not Taiwan’s. Factors are updated yearly and overridable per line.')},
          { q: t('為什麼我的碳費很低、工具卻說風險很大?', 'Why is my fee low but the tool flags big risk?'), a: t('因為代工/組裝業的碳幾乎都在 Scope 3(採購零件、售出產品使用),不在你自己繳碳費的 Scope 1+2。工具用「總足跡 + Scope 3 占比 + 每台 PCF」把這塊攤開給你看。', 'Because most of an assembler’s carbon is Scope 3 (purchased parts, use of sold products), not the Scope 1+2 you pay a fee on. The tool surfaces this via total footprint, Scope 3 share and per-unit PCF.')},
          { q: t('地點基礎與市場基礎 Scope 2 有什麼差?', 'Location- vs market-based Scope 2?'), a: t('地點基礎用當地電網平均;市場基礎把你買的綠電/PPA/REC 算進去(RE100 看的是這個)。填「綠電佔比」即可同時得到兩個數。', 'Location-based uses the grid average; market-based counts your green-power contracts (RE100 looks at this). Enter your renewable % to get both.')},
          { q: t('CBAM 是我要繳嗎?成品伺服器要報嗎?', 'Do I pay CBAM? Do finished servers count?'), a: t('CBAM 憑證由歐盟進口商購買,不是你。且成品電子/伺服器不在 CBAM 清單上(清單僅鋼/鋁/水泥/肥料/氫/電力)——只有你出口這些清單貨品時才在 ⑥ 申報。', 'CBAM certificates are bought by the EU importer, not you. And finished electronics/servers aren’t on the CBAM list (only steel/al/cement/fertilizer/H₂/power) — file in ⑥ only for those list goods.')},
          { q: t('SBTi 的 4.2% 是怎麼來的?', 'Where does the SBTi 4.2% come from?'), a: t('SBTi 1.5°C 近期目標準則要求約每年線性絕對減 4.2%。工具把你「目標% ÷ 年數」的隱含年減和它比對,標示是否對齊。', 'SBTi’s 1.5°C near-term criteria require ≈4.2%/yr linear absolute reduction. The tool compares your implied annual cut (target % ÷ years) and flags alignment.')},
          { q: t('半導體製程含氟氣體(NF₃/CF₄)與洗滌設備怎麼填?', 'How do I enter semiconductor F-gases (NF₃/CF₄) and abatement?'), a: t('在盤查的「製程含氟氣體」類選 NF₃、CF₄、C₂F₆、SF₆ 等(GWP 採 IPCC AR5),活動量填鋼瓶用量(kg)。若該氣體經洗滌/燃燒處理,填「減排設備去除率 DRE %」,工具就以「毛排放 ×(1−DRE)」申報(IPCC Tier 2b);DRE 須有查證之破壞效率,未填則保守用毛排放。', 'Under “process F-gases” pick NF₃, CF₄, C₂F₆, SF₆… (GWP per IPCC AR5) and enter cylinder use (kg). If the gas is scrubbed/burned, enter “abatement DRE %” and the tool reports gross × (1 − DRE) (IPCC Tier 2b); DRE needs a verified destruction efficiency — blank means the conservative gross.')},
          { q: t('客戶要我填他們的 ESG 問卷 / CDP,工具能幫我準備嗎?', 'Can the tool prep my customer’s ESG form / CDP?'), a: t('能。算完後看「客戶問卷回覆」,它把你的盤查、目標、查證狀態對映成 CDP 供應鏈、品牌客戶、SBTi 供應商常問的欄位,逐欄標可回覆/部分/待補,缺的列成清單;底部「⬇ 客戶問卷回覆包」匯出純文字直接貼給客戶。缺資料一律標「—」不編造。', 'Yes. After computing, see “customer questionnaire” — it maps your inventory, targets and verification to CDP, brand and SBTi fields, marks each ready/partial/missing and lists the gaps; “⬇ customer answer pack” exports text to paste to the customer. Missing data shows “—”, never fabricated.')},
          { q: t('品牌客戶要每個產品的碳足跡,工具能出嗎?', 'Brands want a per-product footprint — can the tool produce it?'), a: t('能。在 ⑨ 建立產品/料號清單,選邊界與分攤基礎(數量/質量/營收),工具把組織足跡分攤到各料號、算每單位 kgCO₂e,並用「⬇ 產品碳足跡聲明」匯出一頁文件。這是篩選級分攤估算(ISO 14067 精神),非第三方查證 LCA,聲明會明確標示。', 'Yes. List products/SKUs in ⑨, pick the boundary and allocation basis (units/mass/revenue); the tool splits the org footprint per SKU into kgCO₂e/unit and exports a one-page “⬇ PCF declaration”. It’s a screening allocation (ISO 14067-aligned), not a verified LCA, and says so.')},
          { q: t('我在台灣繳的碳費能抵 CBAM 嗎?', 'Can my Taiwan carbon fee offset CBAM?'), a: t('可部分抵扣。「碳費 × CBAM 交叉抵扣」面板依 Reg (EU) 2023/956 §9,把你原產國已付碳價從 CBAM 義務扣掉,得出淨 CBAM,並標各國認定信心。受益者是歐盟進口商,你需提供已付碳價證明。', 'Partly. The “carbon fee × CBAM” panel applies Reg (EU) 2023/956 §9, netting the origin carbon price you already paid against the CBAM obligation → net CBAM, with per-country confidence. The EU importer benefits and needs your proof of payment.')},
          { q: t('客戶記分卡怎麼用?「門票」和「計分」差在哪?', 'How does the customer scorecard work — gate vs scored?'), a: t('在 ⑩ 登記每個客戶的碳/ESG 要求(可從範本一鍵建立再依實際合約調整)。每條要求設「門票」=必達,任一未達該客戶就列「抽單風險」;「計分」=加權加分,只缺計分項則列「需補強」;全達為「首選供應商」。CDP/EcoVadis/S&P 等外部評級工具算不出,請在 ⑩ 自評填入。記分卡會排出「哪個客戶最危險」與「補哪一項可解鎖最多客戶」。狀態僅供內部管理,非客戶正式評分。', 'In ⑩, log each customer’s carbon/ESG requirements (add from a template, then edit to your contract). Each is a “gate” = must-pass (any miss flags the customer “at risk”) or “scored” = weighted (only scored gaps → “needs work”; all met → “preferred”). External ratings (CDP/EcoVadis/S&P) the tool can’t compute — self-declare them in ⑩. The scorecard ranks which customer is most at risk and which single fix unblocks the most customers. Status is for internal management, not an official customer score.')},
        ].map((f, i) => (
          <details key={i} className="rounded-lg border border-gray-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-800">{f.q}</summary>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.a}</p>
          </details>
        ))}
      </section>

      {/* sources + CTA */}
      <section className="space-y-4 border-t border-gray-200 pt-8 text-center">
        <p className="text-sm text-gray-500">{t('每個數字的法源與三條資料紅線,見', 'Every figure’s source and our three data red-lines:')}{' '}<Link href="/methodology" className="font-medium text-[#5d7d44] underline-offset-2 hover:underline">{t('方法論與來源', 'Methodology & sources')}</Link></p>
        <Link href="/workbench"><Button className="h-11 bg-[#89B56C] px-8 text-white hover:bg-[#6E9156]">{t('開始用工作台 →', 'Open the workbench →')}</Button></Link>
        <p className="text-xs text-gray-400">{t('本工具提供估算與情報參考,非法律/稅務意見、非永續簽證。正式申報請依主管機關規範與專業意見辦理。', 'This tool is a preliminary estimate and reference — not legal/tax advice, not sustainability assurance. For formal filing, follow the authority’s rules and professional advice.')}</p>
      </section>
    </div>
  );
}
