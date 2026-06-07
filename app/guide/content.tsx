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

function Feature({ id, icon, title, lead, children }: { id: string; icon: string; title: string; lead: string; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20 rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900"><span className="text-xl">{icon}</span>{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{lead}</p>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600">{children}</div>
    </div>
  );
}

function Walk({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#89B56C] text-sm font-bold text-white">{n}</span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-gray-600">{children}</div>
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
          {t('Carbon Lens 碳排鏡菱是一套「企業碳管理工作台」。你只要填一份公司側寫,它就能一次算出你的國內碳費、CBAM 暴露、IFRS 揭露階段、供應鏈壓力,並把這些串成一條從盤查到揭露、年年滾動的完整流程。每筆數字都標一手法源、可追溯;資料只存在你的瀏覽器,免註冊。', 'Carbon Lens is a corporate carbon-management workbench. Fill one company profile and it computes your domestic carbon fee, CBAM exposure, IFRS phase and supply-chain pressure at once — then threads them into one auditable, year-over-year flow from inventory to disclosure. Every figure cites primary law; data stays in your browser, no signup.')}
        </p>
        <p className="leading-relaxed text-gray-600">
          {t('最適合:出口歐盟、面對品牌客戶碳要求、或須依 IFRS 編製永續資訊的台灣與 APAC 製造業——尤其在海外(越南、泰國等)設有廠區的公司。', 'Best for: Taiwan & APAC manufacturers that export to the EU, face brand-customer carbon demands, or file IFRS sustainability information — especially groups with overseas plants (Vietnam, Thailand, …).')}
        </p>
        <div className="rounded-lg bg-[#89B56C]/10 p-4 text-sm leading-relaxed text-[#5d7d44]">
          {t('看不懂專有名詞?工作台裡每個術語旁都有一個 ⓘ:點一下會先給你一句白話說明,再附上精確定義與標準出處。新手照著做、專家也站得住。', 'New to the jargon? Every term in the workbench carries an ⓘ: tap it for a one-line explanation, then the precise definition and source. Easy for newcomers, solid for experts.')}
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

        <Feature id="f-profile" icon="📝" title={t('填側寫(①–④)', 'Fill the profile (①–④)')} lead={t('工作台最上面是公司側寫。填一次,下面所有計算都用它。', 'The top of the workbench is your company profile. Fill it once; everything below uses it.')}>
          <p>{t('① 公司基本:產業別、分析年度;若要管目標,順手填基準年、基準年排放、目標年、目標減量%。', '① Basics: industry, analysis year; for target tracking, also set base year, base-year emissions, target year and target %.')}</p>
          <p>{t('② 揭露:上市/上櫃與資本額——工具據此推你哪一年要編 IFRS S1/S2 永續揭露。', '② Disclosure: listed/OTC + capital tier — sets which year you must file IFRS S1/S2.')}</p>
          <p>{t('③ 供應鏈位置:商業模式(品牌/代工/零組件)、員工規模、客戶承諾的框架(RE100/SBTi/CDP)——決定你被要求碳數據的壓力。', '③ Supply-chain position: business model, headcount, customer frameworks — sets how hard you’ll be pushed for carbon data.')}</p>
          <p>{t('④ 出口與假設:是否出口歐盟、歐盟碳價(ETS)的低/中/高假設——驅動 CBAM 估算與敏感度區間。', '④ Export & assumptions: EU export? low/mid/high EU ETS price — drives the CBAM estimate and its sensitivity band.')}</p>
        </Feature>

        <Feature id="f-inventory" icon="📏" title={t('盤查:把排放一筆筆算出來(⑤⑦)', 'Inventory: compute emissions line by line (⑤⑦)')} lead={t('這是整套工具的地基。你可以「直接填總數」,或切到「從活動數據建模」逐項算出可查證的數字。', 'The foundation. Type a total, or switch to “build from activity data” for an auditable, line-by-line number.')}>
          <p>{t('每一行 = 活動量 × 排放係數 = tCO₂e,並顯示完整計算式與來源(供查證)。電力是 Scope 2、燃料/製程/冷媒是 Scope 1。', 'Each line = activity × factor = tCO₂e, with the full formula and source shown. Electricity is Scope 2; fuels/process/refrigerants are Scope 1.')}</p>
          <p>{t('海外廠會自動套該國電網係數:越南 0.6592、泰國 0.475、新加坡 0.402、台灣 0.474……(都可逐行覆寫為你的查證值)。', 'Overseas sites auto-use that country’s grid factor: Vietnam 0.6592, Thailand 0.475, Singapore 0.402, Taiwan 0.474… (each overridable).')}</p>
          <p>{t('填「綠電/PPA/REC 佔比」就會多算一個「市場基礎 Scope 2」與 RE100% (品牌客戶最看這個)。每行還能標數據品質(實測/發票/估算)與佐證來源,供查證留痕。', 'Enter your renewable % to also get market-based Scope 2 and RE100% (what brand customers check). Each line can carry a data-quality tier and evidence note for the audit trail.')}</p>
          <p>{t('Scope 3(⑦):代工/組裝業 90% 以上的碳在這裡。用「使用階段」算售出產品的用電(類別11)、用「支出基礎」估採購零件(類別1)。', 'Scope 3 (⑦): 90%+ of an assembler’s carbon is here. Use “use-phase” for sold-product electricity (Cat 11) and “spend-based” for purchased parts (Cat 1).')}</p>
          <p className="rounded bg-amber-50 px-2 py-1 text-[13px] text-amber-800">{t('提醒:切到「盤查」卻還沒填活動量時,碳費不會被歸零——會暫用你原填的總數,並提示你完成盤查。', 'Note: switching to inventory before entering data won’t zero your fee — it falls back to your typed total and flags it.')}</p>
        </Feature>

        <Feature id="f-target" icon="🎯" title={t('目標管理:訂目標、看是否在軌', 'Targets: set them, see if you’re on track')} lead={t('填了基準年、基準年排放、目標年、目標% 之後,結果區會出現「減量目標管理」。', 'Once base year + base emissions + target year + target % are set, a “target management” panel appears.')}>
          <p>{t('它畫出基準年到目標年的線性軌跡,標出今年「該降到多少」、實際排多少、差多少(在軌/落後),並把你的隱含年減% 跟 SBTi 1.5°C 最低 4.2%/年比對。', 'It draws the linear pathway, shows this year’s allowance vs actual (on track / behind), and compares your implied annual % to the SBTi 1.5°C minimum of 4.2%/yr.')}</p>
        </Feature>

        <Feature id="f-reduce" icon="📉" title={t('減碳鏡:一個目標牽動三筆', 'Reduction lens: one target, three levers')} lead={t('拉動「目標減量%」滑桿(會自動帶入你設的目標),看同一個減量如何同時降低碳費與(有實際數據時的)CBAM。', 'Drag the “target reduction %” (seeded from your set target) to see one cut lower the carbon fee and — with actual data — CBAM together.')}>
          <p>{t('減量槓桿(綠電、能效、製程、燃料轉換)是質性列出的——本工具不會給你沒有依據的「每噸減碳成本」。', 'Reduction levers are listed qualitatively — the tool never invents an unsourced “cost per tonne abated”.')}</p>
        </Feature>

        <Feature id="f-assure" icon="🔒" title={t('查證定版:把已查證的數字凍結', 'Assurance: freeze the verified number')} lead={t('盤查經內審/查證後,按「凍結此版本」,填版本名與簽核人,就把當下整份側寫鎖成一個版本。', 'After review/assurance, “freeze this version” with a label and signer to lock the whole profile as a version.')}>
          <p>{t('版本清單就是你的變更軌跡;任何一版都能「還原」回來重現或比對。這是自我聲明的凍結紀錄,不是第三方查證。', 'The version list is your change trail; any version can be “restored” to reproduce/compare. It’s a self-attested freeze, not third-party assurance.')}</p>
        </Feature>

        <Feature id="f-cycle" icon="🗓" title={t('週期狀態 + 義務行事曆', 'Cycle status + obligation calendar')} lead={t('結果區頂端有一條週期看板(盤查中→內審→查證中→已查證→已申報→已揭露),點一下標記你目前所在階段。', 'A status bar at the top of the results (measuring → review → assurance → assured → filed → disclosed) — tap your current stage.')}>
          <p>{t('下面是依你側寫導出的年度義務行事曆:碳費申報(5/31)、CBAM 申報、永續報告書、CDP——每筆都有截止日、倒數天數與法源。', 'Below it, an obligation calendar derived from your profile: carbon-fee filing (May 31), CBAM, sustainability report, CDP — each with a due date, countdown and source.')}</p>
        </Feature>

        <Feature id="f-results" icon="📊" title={t('看結果:總足跡、碳 P&L、先做哪件', 'Read results: footprint, carbon P&L, do-this-first')} lead={t('按「計算我的合規全貌」後,結果由上而下:', 'After “compute”, results read top-down:')}>
          <p>{t('總碳足跡(Scope 1+2+3)領銜,並拆出 Scope 3 占比與每單位 PCF——避免「碳費近零」誤導你以為碳風險小。', 'Total footprint (Scope 1+2+3) leads, with Scope 3 share and per-unit PCF — so a near-zero fee doesn’t mislead you.')}</p>
          <p>{t('接著是碳 P&L 四卡(碳費/CBAM/IFRS/供應鏈)、碳費算式(可給查核員)、「先做哪件」優先序(依工作量與死線排,不只看金額)、CBAM 逐年暴露圖。', 'Then the carbon P&L (fee/CBAM/IFRS/supply-chain), an auditor-ready fee breakdown, a “do this first” priority list (by workload + deadline, not just money), and the CBAM ramp chart.')}</p>
        </Feature>

        <Feature id="f-loop" icon="🔁" title={t('年對年閉環:拍快照、結轉下一年', 'Close the loop: snapshot & carry forward')} lead={t('「拍下這次快照」把總額存進歷史;歷史表會顯示總足跡與 vs 前次的 Δ%。', '“Take a snapshot” saves totals to history; the table shows footprint and Δ% vs the prior one.')}>
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
          <Walk n={1} title={t('填側寫', 'Fill the profile')}>
            <p>{t('① 產業=電子/半導體、年度 2026、基準年 2024、基準年排放 40,000 t、目標年 2030、目標減量 30%。② 上市、資本逾 100 億。③ 商業模式=ODM 代工、員工逾千、客戶框架 SBTi+CDP。④ 出口歐盟=是。', '① Industry = electronics, year 2026, base year 2024, base emissions 40,000 t, target year 2030, target −30%. ② Listed, capital >NT$10bn. ③ ODM, >1,000 staff, frameworks SBTi+CDP. ④ Exports to EU = yes.')}</p>
          </Walk>

          <Walk n={2} title={t('建越南廠盤查(電力)', 'Build the Vietnam plant inventory (electricity)')}>
            <p>{t('新增廠區「越南廠」、國別=越南,切到「從活動數據建模」,排放源選「外購電力」、活動量填 8,000,000 度。工具自動套越南電網係數 0.6592:', 'Add “Vietnam plant”, country = Vietnam, switch to activity-data, pick electricity, enter 8,000,000 kWh. The tool auto-applies Vietnam’s 0.6592 grid factor:')}</p>
            <p className="rounded bg-gray-50 px-2 py-1 font-mono text-[13px] text-gray-700">8,000,000 × 0.6592 ÷ 1000 = 5,273.6 tCO₂e（Scope 2 地點基礎）</p>
            <p>{t('再填「綠電佔比 40%」→ 多出市場基礎 Scope 2 = 5,273.6 × 60% = 3,164 t,RE100 40%。', 'Set renewable 40% → market-based Scope 2 = 5,273.6 × 60% = 3,164 t, RE100 40%.')}</p>
          </Walk>

          <Walk n={3} title={t('加泰國廠', 'Add the Thailand plant')}>
            <p>{t('同樣方式,泰國廠電力 5,000,000 度 × 0.475(泰國 TGO)= 2,375 t。兩廠 Scope 1+2 合計 ≈ 7,649 t。', 'Same way: Thailand 5,000,000 kWh × 0.475 (TGO) = 2,375 t. Both plants’ Scope 1+2 ≈ 7,649 t.')}</p>
          </Walk>

          <Walk n={4} title={t('量化 Scope 3(這才是大宗)', 'Quantify Scope 3 (this is the big one)')}>
            <p>{t('在 ⑦ 新增一筆,類別 11(售出產品使用)、方法=使用階段,填:2,000 台 × 800 W × 8,760 小時/年 × 4 年壽命 × 0.4 kgCO₂e/kWh:', 'In ⑦ add Cat 11 (use of sold products), method = use-phase: 2,000 units × 800 W × 8,760 h/yr × 4 yr × 0.4 kgCO₂e/kWh:')}</p>
            <p className="rounded bg-gray-50 px-2 py-1 font-mono text-[13px] text-gray-700">2000 × 800 × 8760 × 4 × 0.4 ÷ 1,000,000 = 22,426 tCO₂e</p>
            <p>{t('再填「年售出 2,000 台、單位=台」,工具就能算每台 PCF。', 'Enter “2,000 units/yr, unit = server” so the tool can compute per-unit PCF.')}</p>
          </Walk>

          <Walk n={5} title={t('按「計算」,看全貌', 'Compute and read the picture')}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Num label={t('總碳足跡', 'Total footprint')} value="30,074" sub="tCO₂e" />
              <Num label={t('Scope 3 占比', 'Scope 3 share')} value="75%" sub={t('價值鏈', 'value chain')} />
              <Num label={t('每台 PCF', 'Per-server PCF')} value="15,037" sub="kgCO₂e" />
              <Num label={t('市場基礎 Scope 2', 'Market Scope 2')} value="3,164" sub={t('越南廠', 'VN plant')} />
            </div>
            <p>{t('重點:你自己營運(Scope 1+2)只有 ~7,649 t,但加上售出伺服器的使用階段,總足跡衝到 30,074 t——Scope 3 佔 75%。這正是客戶要你揭露的數字。', 'Key insight: your own operations (Scope 1+2) are only ~7,649 t, but with the sold servers’ use-phase the total jumps to 30,074 t — Scope 3 is 75%. That’s exactly what customers want disclosed.')}</p>
          </Walk>

          <Walk n={6} title={t('目標、CBAM、行事曆', 'Targets, CBAM, calendar')}>
            <p>{t('目標管理顯示:2026 年該降到 ~36,000 t、實際 30,074 t → ✓ 在軌;隱含年減 5%/年 ✓ 達 SBTi 1.5°C(≥4.2%)。', 'Target panel: 2026 allowance ~36,000 t, actual 30,074 t → ✓ on track; implied 5%/yr ✓ meets SBTi 1.5°C (≥4.2%).')}</p>
            <p>{t('CBAM:成品伺服器不在 CBAM 清單上——若你出口鋁機殼等清單貨品,才在 ⑥ 申報;否則此區留空即可(工具會提示)。', 'CBAM: finished servers are not on the CBAM list — only list goods (e.g. aluminium chassis) go in ⑥; otherwise leave it empty (the tool says so).')}</p>
            <p>{t('行事曆自動列出:碳費申報 2027-05-31、永續報告書 2027-03-31、CDP 2027-07-31,各含倒數與法源。', 'The calendar lists carbon-fee filing 2027-05-31, sustainability report 2027-03-31, CDP 2027-07-31 — each with a countdown and source.')}</p>
          </Walk>

          <Walk n={7} title={t('定版、匯出、結轉', 'Lock, export, carry forward')}>
            <p>{t('查證後按「凍結此版本」存成「FY2025 已查證版」。下載「盤查清冊(CSV)」交查核、「揭露報告段落」貼進報告書、「CBAM 溝通範本」給買家。最後按「結轉下一年(2027)」,明年從這裡接著盤。', 'After assurance, “freeze” it as “FY2025 assured”. Download the inventory CSV for auditors, the disclosure draft for the report, the CBAM template for buyers. Finally “carry forward to 2027” and pick up there next year.')}</p>
          </Walk>
        </CardContent></Card>
      </section>

      {/* 5. Deliverables */}
      <section id="deliver" className="scroll-mt-20 space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">{t('⑤ 匯出與交付', '⑤ Exports & deliverables')}</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-gray-600">
          <li>{t('• 側寫 JSON:換電腦或多廠彙整用——匯出存檔、之後匯入即還原。', '• Profile JSON: for switching machines / merging plants — export then import to restore.')}</li>
          <li>{t('• 盤查清冊 CSV:逐排放源含係數、來源、Scope、數據品質、佐證、tCO₂e——Excel 可開,交查證的工作底稿。', '• Inventory sheet CSV: every source with factor, source, scope, data quality, evidence, tCO₂e — opens in Excel, the assurance working paper.')}</li>
          <li>{t('• 揭露報告段落:IFRS S1/S2 四支柱草稿,已用你的實算數字預填,定性內容留空待你補。', '• Disclosure draft: an IFRS S1/S2 four-pillar draft pre-filled with your numbers; qualitative parts left to complete.')}</li>
          <li>{t('• CBAM 設施溝通範本:依 Reg (EU) 2023/956 欄位整理,給歐盟買家所需的設施資料。', '• CBAM communication template: per Reg (EU) 2023/956, the installation data your EU buyer needs.')}</li>
        </ul>
        <p className="text-sm text-gray-500">{t('所有匯出都在前端產生、直接下載,不經伺服器。', 'All exports are generated in your browser and downloaded directly — nothing leaves your device.')}</p>
      </section>

      {/* 6. FAQ */}
      <section id="faq" className="scroll-mt-20 space-y-3">
        <h2 className="text-2xl font-bold text-gray-900">{t('⑥ 常見問題', '⑥ FAQ')}</h2>
        {[
          { q: t('我的資料會被上傳嗎?', 'Is my data uploaded?'), a: t('不會。側寫、快照、凍結版本都只存在你的瀏覽器(localStorage),不經伺服器、免註冊。換電腦請用「匯出側寫 JSON」搬移。', 'No. Your profile, snapshots and locked versions live only in your browser (localStorage) — no server, no signup. Use “export profile JSON” to move machines.')},
          { q: t('海外廠的用電碳排怎麼算才對?', 'How are overseas plants’ electricity emissions calculated?'), a: t('工具依廠區國別自動套該國電網係數(如越南 0.6592、泰國 0.475),不會誤用台灣值。係數逐年公布、可逐行覆寫為你查證的最新值。', 'The tool auto-applies each country’s grid factor (e.g. Vietnam 0.6592, Thailand 0.475), not Taiwan’s. Factors are updated yearly and overridable per line.')},
          { q: t('為什麼我的碳費很低、工具卻說風險很大?', 'Why is my fee low but the tool flags big risk?'), a: t('因為代工/組裝業的碳幾乎都在 Scope 3(採購零件、售出產品使用),不在你自己繳碳費的 Scope 1+2。工具用「總足跡 + Scope 3 占比 + 每台 PCF」把這塊攤開給你看。', 'Because most of an assembler’s carbon is Scope 3 (purchased parts, use of sold products), not the Scope 1+2 you pay a fee on. The tool surfaces this via total footprint, Scope 3 share and per-unit PCF.')},
          { q: t('地點基礎與市場基礎 Scope 2 有什麼差?', 'Location- vs market-based Scope 2?'), a: t('地點基礎用當地電網平均;市場基礎把你買的綠電/PPA/REC 算進去(RE100 看的是這個)。填「綠電佔比」即可同時得到兩個數。', 'Location-based uses the grid average; market-based counts your green-power contracts (RE100 looks at this). Enter your renewable % to get both.')},
          { q: t('CBAM 是我要繳嗎?成品伺服器要報嗎?', 'Do I pay CBAM? Do finished servers count?'), a: t('CBAM 憑證由歐盟進口商購買,不是你。且成品電子/伺服器不在 CBAM 清單上(清單僅鋼/鋁/水泥/肥料/氫/電力)——只有你出口這些清單貨品時才在 ⑥ 申報。', 'CBAM certificates are bought by the EU importer, not you. And finished electronics/servers aren’t on the CBAM list (only steel/al/cement/fertilizer/H₂/power) — file in ⑥ only for those list goods.')},
          { q: t('SBTi 的 4.2% 是怎麼來的?', 'Where does the SBTi 4.2% come from?'), a: t('SBTi 1.5°C 近期目標準則要求約每年線性絕對減 4.2%。工具把你「目標% ÷ 年數」的隱含年減和它比對,標示是否對齊。', 'SBTi’s 1.5°C near-term criteria require ≈4.2%/yr linear absolute reduction. The tool compares your implied annual cut (target % ÷ years) and flags alignment.')},
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
