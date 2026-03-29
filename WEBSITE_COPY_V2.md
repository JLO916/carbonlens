# CarbonLens 改版網站文案（淺顯易懂 × 專業正確版）
# 此檔案取代原 CarbonLens_Website_Copy.md，供 Claude Code 執行文案替換

---

## 使用說明

本文件涵蓋網站所有說明文案的改版內容。Claude Code 執行時：
- i18n 使用 `t('中文', 'English')` 內聯寫法
- 不建立 JSON 翻譯檔
- 按 Section 編號對應到具體元件和行號（參照 PRODUCT_CORRECTION_V2.md）

核心文案原則：
1. 用日常用語解釋專業概念，但不降低專業精度
2. 不說「你要繳多少 CBAM」——CBAM 義務人是歐盟進口商
3. 不說「你能省多少」——抵扣受益者是進口商
4. 不說「第一個」「唯一」等無法驗證的宣稱
5. 數字和法規細節保持精確，包裝方式變得直覺

---

## 1. Title Tag & Meta Description

### 首頁
**Title**：
- ZH：`碳費試算與CBAM碳關稅計算器｜亞太六國碳成本分析 — CarbonLens`
- EN：`Carbon Fee Calculator & CBAM Cost Estimator | Asia-Pacific — CarbonLens`

**Meta Description**：
- ZH：`免費碳成本分析工具。比較台灣碳費三種費率方案的十年成本差異、評估歐盟CBAM碳關稅影響、一覽亞太六國碳價競爭力。不需要註冊，30秒看到結果。`
- EN：`Free carbon cost analysis tool. Compare Taiwan's 3 carbon fee options over 10 years, assess EU CBAM impact on your exports, and benchmark carbon costs across 6 Asia-Pacific countries. No signup needed.`

### 台灣頁
**Title**：`台灣碳費試算器｜一般費率vs優惠費率十年成本比較 — CarbonLens`
**Meta**：`免費台灣碳費分析。一般費率NT$300、優惠B NT$100、優惠A NT$50 三種方案的十年累計成本一次比清楚。支援高碳洩漏CL係數模擬和碳費門檻敏感度分析。`

### CBAM 頁
**Title**：`CBAM碳關稅計算器｜你的歐盟客戶要付多少碳邊境稅？ — CarbonLens`
**Meta**：`免費CBAM成本評估。從亞洲出口商角度，估算歐盟進口商面臨的碳關稅金額。比較「提供實際排放數據」vs「被套預設值」的成本差異。`

### 跨國比較頁
**Title**：`碳成本跨國比較｜同一產品從六國出口歐盟，CBAM成本差多少？ — CarbonLens`
**Meta**：`比較同一產品從台灣、韓國、越南等六國出口歐盟的碳關稅差異。看你在亞太碳價競爭力的排名。`

### 使用說明頁
**Title**：`使用說明｜碳費與CBAM怎麼算？計算方法與資料來源 — CarbonLens`
**Meta**：`CarbonLens使用指南。了解台灣碳費公式、CBAM計算方法、各國碳價資料來源，以及常見問題解答。`

---

## 2. 首頁 Hero Section

### 中文

**H1**：
你的產品出口歐盟，碳成本曝險有多大？

**副標**：
亞太碳成本分析工具 — 30 秒掌握碳定價對你的生意影響

**說明段落**：
2026 年起，歐盟開始對進口的鋼鐵、鋁、水泥等產品收「碳關稅」（CBAM）——根據產品生產過程排了多少碳來計費。同一時間，台灣碳費、新加坡碳稅、韓國碳交易等亞太碳定價制度也陸續上路。出口企業同時面對國內和國際兩筆碳成本，但要搞清楚這兩筆錢之間的關係並不容易。

CarbonLens 幫你在一個頁面看清三件事：你在國內要付多少碳費、你的歐盟客戶面臨多少碳關稅、以及各國碳價在歐盟能被認定為可抵扣的可能性有多大。免費、不需註冊、30 秒看到結果。

### English

**H1**:
How much carbon cost exposure do your EU exports carry?

**Subheadline**:
Asia-Pacific Carbon Cost Analyzer — See how carbon pricing affects your business in 30 seconds

**Paragraph**:
Starting 2026, the EU charges a "carbon border tax" (CBAM) on imported steel, aluminum, cement, and more — based on how much carbon was emitted during production. At the same time, carbon pricing is ramping up across Asia: Taiwan's carbon fee, Singapore's carbon tax, Korea's emissions trading, and more. Exporters now face carbon costs on two fronts, but figuring out how these two bills interact isn't straightforward.

CarbonLens helps you see three things in one place: your domestic carbon cost, how much carbon border tax your EU buyer faces, and how likely your country's carbon price is to qualify for a CBAM deduction. Free, no signup, results in 30 seconds.

---

## 3. 三功能區塊

### 中文

**段落標題（H2）**：三個問題，一次看清楚

**卡片一：你的國內碳成本曝險有多大？**
選擇你的國家，輸入排放量和產業別，工具自動套用該國最新的碳費率和免徵門檻。台灣企業可以比較三種費率方案（一般費率 NT$300、優惠 B NT$100、優惠 A NT$50），看十年下來每種方案各花多少錢。其他五國也各有對應的計算邏輯。

**卡片二：你的歐盟客戶面臨多少碳關稅？**
如果你的產品出口歐盟，這裡幫你估算歐盟進口商面臨的 CBAM 碳關稅成本。重點功能是「有數據 vs 沒數據」的比較——如果你能提供產品的實際排放數據，客戶的碳關稅可能比被套預設值低 20-40%。這個差距就是你建立碳盤查能力的投資價值。

**卡片三：各國碳價的 CBAM 抵扣可能性有多大？**
你在國內繳的碳費或碳稅，有多少可以被歐盟認定為可抵扣的金額？這個答案因國家而異，差距很大：新加坡和韓國的碳價幾乎確定可以抵扣，台灣和日本部分規則還在跟歐盟談，泰國的碳稅設計特殊所以有疑問，越南則因為沒有正式碳價而完全無法抵扣。工具會標示每個國家的可能性等級，幫你判斷。

### English

**Section title (H2)**: Three questions, one clear picture

**Card 1: How big is your domestic carbon cost exposure?**
Select your country, enter your emissions and industry, and the tool applies the latest carbon rates and thresholds. Taiwan users can compare three fee rate options (Standard NT$300, Preferential B NT$100, Preferential A NT$50) to see how much each costs over ten years. Each of the other five countries has its own calculation logic.

**Card 2: How much carbon border tax does your EU buyer face?**
If you export to the EU, this estimates the CBAM cost your European importer will face. The key feature is the "actual data vs. defaults" comparison — if you can provide real emissions data for your products, your buyer's carbon border tax could be 20-40% lower than with default values. That gap is what your investment in carbon data management is worth.

**Card 3: How likely is your carbon price to qualify for CBAM deduction?**
How much of the carbon fee or tax you pay domestically can the EU recognize as deductible? The answer varies dramatically by country: Singapore and Korea's carbon prices almost certainly qualify, Taiwan and Japan's are partly under negotiation with the EU, Thailand's tax design raises questions, and Vietnam has no formal carbon price at all — meaning zero deduction. The tool flags the likelihood level for each country.

---

## 4. 情境案例卡片

### 中文

**段落標題（H2）**：用實際案例看碳成本的影響

**卡片一：選優惠費率到底能省多少？算上 CBAM 的連動效果**
一家台灣鋼鐵廠，年排放 10 萬噸，出口 5,000 噸鋼鐵到歐盟。選一般費率要繳 NT$600 萬碳費，但國內繳越多，歐盟客戶能申請抵扣的碳關稅也越多；選優惠 A 只繳 NT$100 萬，抵扣的空間也跟著縮小。把兩邊加起來算——優惠 A 的總成本仍然比一般費率低約 NT$240 萬。國內碳費和歐盟碳關稅之間有連動關係，值得一起看。→ 點擊試算

**卡片二：同一批鋼鐵從不同國家出口，歐盟客戶的碳關稅差多少？**
5,000 噸鋼鐵出口歐盟。歐盟進口商從越南買，CBAM 成本約 €338,000；從台灣買約 €321,000。差距目前不大，但背後原因是結構性的：越南沒有正式碳價，進口商無法申請任何抵扣，等於全額負擔碳關稅。2034 年歐盟免費配額歸零後，這個差距會越拉越大。→ 點擊比較

**卡片三：越南沒有碳價——歐盟客戶的額外負擔**
越南是亞洲第三大 CBAM 涵蓋產品對歐出口國。但因為沒有正式碳定價機制，歐盟進口商從越南採購時無法申請任何碳價抵扣——同樣的鋼鐵，從越南進口就是全額碳關稅。對正在評估供應鏈佈局的企業來說，供應商所在國的碳定價狀態，已經直接影響到歐盟端的採購成本。→ 點擊試算

**卡片四：2030 年碳成本會是現在的幾倍？**
台灣碳費預計從 NT$300 逐步調升至 NT$1,200-1,800。加上高碳洩漏風險的 CL 係數從 0.2 升至 0.6，雙重疊加之下，高碳排企業的碳費可能在 2030 年達到現在的 12 倍。歐盟端也一樣：CBAM 免費配額從 97.5% 遞減到 0%，2034 年的碳關稅是 2026 年的約 2.5 倍。國內和國際碳成本同步攀升——用情境模擬看看你的十年成本曲線。→ 點擊模擬

### English

**Section title (H2)**: See carbon costs through real examples

**Card 1: How much does choosing a preferential rate really save — including the CBAM effect?**
A Taiwan steel plant, 100K tonnes annual emissions, exporting 5,000 tonnes to the EU. The standard rate means NT$6M in domestic carbon fees, but paying more domestically also means the EU buyer can claim a larger CBAM deduction. Preferential A means only NT$1M, but less deduction room. Add both sides up — Preferential A still saves about NT$2.4M total. Domestic fees and EU carbon border tax are linked, and worth looking at together. → Try it

**Card 2: Same steel from different countries — how much does the EU buyer's carbon border tax differ?**
5,000 tonnes of steel exported to the EU. The importer's CBAM cost from Vietnam: ~€338,000. From Taiwan: ~€321,000. The gap is modest for now, but structural: Vietnam has no carbon price, so the importer gets zero deduction — full carbon border tax. By 2034 when EU free allowances hit zero, this gap widens significantly. → Compare

**Card 3: Vietnam has no carbon price — the extra cost for EU buyers**
Vietnam is Asia's third-largest exporter of CBAM-covered goods to the EU. But without formal carbon pricing, EU importers sourcing from Vietnam cannot claim any carbon price deduction — the same steel means full carbon border tax. For companies planning supply chain shifts, a supplier's country-level carbon pricing status now directly affects EU procurement costs. → Calculate

**Card 4: By 2030, how many times will your carbon cost multiply?**
Taiwan's carbon fee is projected to rise from NT$300 to NT$1,200-1,800. Combined with the carbon leakage CL coefficient increasing from 0.2 to 0.6, high-emission manufacturers could see domestic carbon fees reach 12× their 2025 level by 2030. On the EU side, CBAM free allowances drop from 97.5% to zero, pushing carbon border tax to ~2.5× its 2026 level by 2034. Run the scenario simulator to see your 10-year cost curve. → Simulate

---

## 5.「為什麼需要這個工具」段落

### 中文

**H2**：亞太碳定價正在快速改變，但資訊還沒跟上

2025-2026 年是亞太碳定價的轉折期。台灣碳費開徵、新加坡碳稅大幅調升、日本排放交易從自願變強制、泰國通過首部碳稅——六個主要經濟體幾乎同時在加速。與此同時，歐盟碳關稅（CBAM）正式進入收費階段，亞洲出口企業第一次同時面對國內碳價和國際碳關稅的雙重成本。

但市場上的工具還沒跟上這個變化。現有的碳關稅計算器大多從歐盟進口商的角度設計，回答的是「進口商要買多少憑證」。而亞洲出口企業更需要知道的是：我在國內繳的碳費，有多少可以幫歐盟客戶抵扣碳關稅？不同國家的抵扣規則差多大？選哪種費率方案長期最划算？據我們所知，把這些問題整合在一起回答的公開工具還很少。

CarbonLens 就是為了補上這個缺口。

免費開放，不需要註冊。碳成本的資訊透明度不應該有門檻。

這個工具主要服務三類使用者：正在評估碳費方案的企業永續或財務部門、需要快速幫客戶估算碳成本的 ESG 顧問、以及研究各國碳定價差異的產業分析師。

碳定價的規則每年都在變，這個工具也會持續更新。歡迎回饋任何計算問題。

### English

**H2**: Carbon pricing in Asia-Pacific is changing fast — the tools haven't kept up

2025-2026 is a turning point for carbon pricing across Asia-Pacific. Taiwan's carbon fee launched, Singapore's carbon tax jumped sharply, Japan's emissions trading went from voluntary to mandatory, and Thailand passed its first carbon tax law — six major economies accelerating almost simultaneously. Meanwhile, the EU carbon border tax (CBAM) entered its payment phase, creating a first-of-its-kind dual cost structure for Asian exporters.

But the available tools haven't caught up. Most carbon border tax calculators are designed for EU importers — answering "how many certificates does the importer need to buy." Asian exporters need different answers: how much of my domestic carbon fee can help my EU buyer offset their carbon border tax? How do deduction rules differ across countries? Which fee rate option is cheapest long-term? From what we can find, few public tools bring these questions together.

CarbonLens was built to fill that gap.

Free and open — no registration required. Carbon cost transparency shouldn't have a paywall.

The tool primarily serves three types of users: corporate sustainability or finance teams evaluating carbon fee strategies, ESG consultants who need quick cost estimates for clients, and industry analysts researching carbon pricing differences across the region.

Carbon pricing rules change every year, and this tool will be updated accordingly. Feedback on any calculation issues is always welcome.

---

## 6. 結果面板文案

### 6.1 國內碳費結果（ResultPanel.tsx）

**結果區介紹文字**：
- ZH：`以下為依據您輸入參數估算的年度碳成本。此金額為概略估算，供內部評估和初步規劃參考，實際碳費義務以主管機關核定為準。`
- EN：`Below is the estimated annual carbon cost based on your inputs. This is an approximate figure for internal assessment and preliminary planning. Actual obligations are subject to regulatory determination.`

**大數字標題**：
- ZH：`碳成本曝險` / EN：`Carbon Cost Exposure`

**收費排放量 InfoTip**：
- ZH：`收費排放量是扣除免徵額、套用碳洩漏係數後，實際要計費的排放量。簡單說：不是你排了多少碳都要繳費，而是經過門檻和折扣計算後的部分才算錢。`
- EN：`Chargeable emissions are what you actually pay for — your total emissions minus exemptions, adjusted by the carbon leakage coefficient. In other words, not all your emissions are charged; only the portion after thresholds and discounts.`

**有效費率 InfoTip**：
- ZH：`有效費率 = 碳費總額 ÷ 年排放量。代表你平均每排放一噸碳的實際成本，已經把免徵額和折扣的效果算進去了。`
- EN：`Effective rate = total carbon cost ÷ annual emissions. This is your actual average cost per tonne of CO₂e emitted, reflecting all exemptions and discounts.`

**計算步驟拆解介紹**：
- ZH：`下方是從年排放量到最終碳成本的推算過程，幫你了解費用是怎麼算出來的。`
- EN：`Below is the step-by-step derivation from annual emissions to final carbon cost, showing how the fee is calculated.`

**CBAM 抵扣區塊標題**：
- ZH：`可供歐盟進口商申請 CBAM 抵扣的金額`
- EN：`Amount your EU importer may claim for CBAM deduction`

**CBAM 抵扣區塊說明**：
- ZH：`如果你的產品出口到歐盟，你在國內繳的碳費可以作為歐盟進口商申請抵扣碳關稅的依據——也就是幫你的客戶降低他的 CBAM 成本。但這筆抵扣的受益者是進口商，是否反映在給你的採購價格上，取決於你們之間的商業談判。`
- EN：`If you export to the EU, the carbon fee you pay domestically can serve as the basis for your EU buyer to claim a CBAM deduction — helping them reduce their carbon border tax. However, the beneficiary of this deduction is the importer. Whether it's reflected in your purchase price depends on your commercial arrangement.`

**CBAM 抵扣底部提示**：
- ZH：`此抵扣可能性為分析判斷，非歐盟官方認定。實際認定以歐盟公告為準。`
- EN：`This deduction likelihood is an analytical assessment, not an official EU determination. Actual eligibility is subject to EU ruling.`

### 6.2 CBAM 結果（CBAMForm.tsx）

**結果大標題**：
- ZH：`歐盟進口商的 CBAM 淨成本`
- EN：`EU Importer's Net CBAM Cost`

**結果區介紹**：
- ZH：`以下是歐盟進口商為你的產品需要負擔的碳關稅估算。CBAM 的繳費義務由歐盟進口商承擔，不是出口商直接繳納。`
- EN：`Below is the estimated carbon border tax your EU importer would pay for your products. CBAM payment obligations are borne by the EU importer, not the exporter.`

**原產國碳價抵扣**：
- ZH：`原產國碳價可抵扣金額`
- EN：`Domestic Carbon Price Deductible`

**結果底部免責**：
- ZH：`提醒：CBAM 憑證的購買義務由歐盟進口商承擔。本工具估算的是進口商面臨的成本，對你（出口商）的影響取決於雙方的商業條件。各國碳價的 CBAM 抵扣資格以歐盟最終認定為準。`
- EN：`Note: CBAM certificate obligations are borne by EU importers. Costs shown represent the importer's liability. The impact on you as an exporter depends on your commercial terms. CBAM deduction eligibility is subject to final EU determination.`

---

## 7. CBAM 抵扣確定性面板文案

### 單國面板標題
- ZH：`CBAM 抵扣可能性評估`
- EN：`CBAM Deduction Likelihood Assessment`

### 各國 reason（修正版）

**新加坡**：
- ZH：`明確的碳稅制度，高度可能被歐盟認定為可抵扣`
- EN：`Clear carbon tax mechanism, highly likely to be recognized by the EU for deduction`

**韓國**：
- ZH：`K-ETS 配額購買成本符合歐盟對「碳價」的定義，高度可能被認定`
- EN：`K-ETS allowance purchase costs meet the EU's definition of "carbon price," highly likely to be recognized`

**台灣**：
- ZH：`碳費制度可抵扣，但碳費涵蓋的 Scope 2（間接排放）部分如何折算，仍待與歐盟協商`
- EN：`Carbon fee is deductible, but how to convert Scope 2 (indirect emissions) coverage is still under negotiation with the EU`

**日本**：
- ZH：`碳稅 ¥289 是否被歐盟視為「碳價」存在定義模糊；GX-ETS 配額購買成本較明確可抵`
- EN：`Whether the ¥289 carbon tax qualifies as a "carbon price" under EU rules is ambiguous; GX-ETS allowance costs are more clearly deductible`

**泰國**：
- ZH：`碳稅嵌入消費稅結構，不額外增加終端價格，歐盟是否認定為有效「碳價」存在不確定性`
- EN：`Carbon tax is embedded in excise tax structure with no additional price impact — whether the EU recognizes this as a valid "carbon price" is uncertain`

**越南**：
- ZH：`目前沒有正式碳定價機制，歐盟進口商無法申請任何碳價抵扣`
- EN：`No formal carbon pricing mechanism currently in place — EU importers cannot claim any carbon price deduction`

### 表格標題
- ZH：`各國碳價被歐盟認定為可抵扣的可能性`
- EN：`Likelihood of EU Recognition for CBAM Carbon Price Deduction`

### 表格說明
- ZH：`下表依我們的分析判斷排序，不是歐盟官方認定結果。歐盟尚未公布各國碳價 CBAM 抵扣資格的正式清單。🟢 表示該國碳價機制高度可能符合 CBAM 抵扣條件；⚫ 表示無正式碳價，進口商須全額負擔 CBAM 成本。`
- EN：`Ranked by our analytical assessment, not official EU determinations. The EU has not published a formal list of eligible carbon prices. 🟢 = highly likely to qualify for CBAM deduction; ⚫ = no formal carbon price, importer bears full CBAM cost.`

### 單國面板底部說明
- ZH：`歐盟只認可符合其定義的「碳價」用於 CBAM 抵扣。一般來說，碳稅和排放交易配額購買成本比較明確；嵌入其他稅制或沒有正式碳價的國家，認定上存在不確定性。抵扣的受益者是歐盟進口商，不是出口商。`
- EN：`The EU only recognizes carbon prices meeting its specific definition for CBAM deduction. Generally, carbon taxes and emissions trading allowance costs are more clearly eligible; countries with embedded taxes or no formal carbon pricing face uncertainty. The deduction benefits the EU importer, not the exporter.`

---

## 8. 情境分析圖表文案

**標題**：
- ZH：`碳成本預測 2025-2034：如果什麼都不變，費用會怎麼走？`
- EN：`Carbon Cost Projection 2025-2034: If nothing changes, where do costs go?`

**說明**：
- ZH：`下方圖表假設你的排放量維持不變，模擬國內碳價逐年調升、CBAM 免費配額逐年減少的成本走勢。紅色虛線是國內碳費和歐盟碳關稅的合計。實際情況取決於你的減排進度和各國政策調整。`
- EN：`This chart assumes your emissions stay constant and models rising domestic carbon prices alongside declining CBAM free allowances. The red dashed line is the combined domestic + EU carbon cost. Actual costs depend on your decarbonization progress and policy changes.`

---

## 9. 使用說明頁（Guide）重點文案

### 總覽段落
- ZH：`CarbonLens 是一個碳成本分析工具，涵蓋台灣、新加坡、韓國、日本、泰國、越南六國的碳定價制度，加上歐盟碳關稅（CBAM）。它幫你做三件事：估算國內碳費或碳稅金額、評估歐盟碳關稅對出口產品的影響、以及比較不同國家的碳成本差異。`
- EN：`CarbonLens is a carbon cost analysis tool covering carbon pricing in six countries — Taiwan, Singapore, South Korea, Japan, Thailand, and Vietnam — plus the EU carbon border tax (CBAM). It helps you do three things: estimate your domestic carbon fee or tax, assess how the EU carbon border tax affects your exports, and compare carbon costs across countries.`

### CBAM 是什麼（簡明版）
- ZH：`CBAM 全名是「碳邊境調整機制」，簡單說就是歐盟對進口產品收的碳關稅。如果你出口鋼鐵、鋁、水泥、化肥、氫或電力到歐盟，歐盟的進口商需要根據產品生產過程的碳排放量，購買等量的 CBAM 憑證。憑證的價格跟歐盟自己的碳交易市場（EU ETS）掛鉤，目前大約每噸 CO₂ €60-100。如果生產國已經收了碳費或碳稅，進口商可以申請抵扣——但能抵多少，取決於各國碳價是否被歐盟認定。`
- EN：`CBAM stands for Carbon Border Adjustment Mechanism — essentially, it's the EU's carbon border tax on imports. If you export steel, aluminum, cement, fertilizers, hydrogen, or electricity to the EU, the European importer must purchase CBAM certificates based on the carbon emissions from production. Certificate prices are linked to the EU's own carbon trading market (EU ETS), currently around €60-100 per tonne of CO₂. If a carbon fee or tax was already paid in the country of production, the importer can apply for a deduction — but how much depends on whether the EU recognizes that country's carbon price.`

### 重要提醒（各工具頁面統一使用）
- ZH：`本工具提供碳成本的概略估算，幫助你在做決策前了解大致的金額範圍。它不是合規申報系統，不能替代環境部的碳費申報平台或歐盟的 CBAM Registry。也不能替代專業顧問——如果你需要精確的碳費計算或 CBAM 申報輔導，建議尋求專業協助。`
- EN：`This tool provides approximate carbon cost estimates to help you understand the general magnitude before making decisions. It is not a compliance filing system and cannot replace your national carbon fee reporting platform or the EU CBAM Registry. It also cannot replace professional advisory — if you need precise carbon fee calculations or CBAM filing support, please seek professional assistance.`

---

## 10. About 頁面

### 中文
**關於 CarbonLens**

CarbonLens 是一個免費的亞太碳成本分析工具，由 Jimmy Lo 獨立開發與維護。

亞太地區正進入碳定價的加速期。台灣、新加坡、韓國、日本、泰國、越南——六個經濟體的碳費、碳稅或碳交易制度在 2025-2026 年間密集上路或大幅調整。企業需要理解碳定價對營運成本的影響，但要搞清楚各國制度的差異和交互關係並不容易。

CarbonLens 的目標是讓碳成本的估算變得透明、直覺、所有人都能使用。工具目前涵蓋六國國內碳定價機制和歐盟碳關稅（CBAM），未來將視法規變化和使用者回饋持續更新。

本工具提供概略估算，不構成法律或稅務建議。

### English
**About CarbonLens**

CarbonLens is a free carbon cost analysis tool for Asia-Pacific, independently built and maintained by Jimmy Lo.

Asia-Pacific is entering an acceleration phase of carbon pricing. Taiwan, Singapore, South Korea, Japan, Thailand, and Vietnam — six economies are launching or significantly adjusting their carbon fees, taxes, and emissions trading systems in 2025-2026. Businesses need to understand how carbon pricing affects their operating costs, but figuring out the differences and interactions across country systems isn't easy.

CarbonLens aims to make carbon cost estimation transparent, intuitive, and accessible to everyone. The tool currently covers six countries' domestic carbon pricing mechanisms plus the EU carbon border tax (CBAM), and will be updated as regulations evolve and users provide feedback.

This tool provides approximate estimates and does not constitute legal or tax advice.

---

## 11. Footer 文案

### 中文
CarbonLens 由 Jimmy Lo 製作與維護。本工具提供碳成本估算參考，不構成法律或稅務建議。各國碳定價與歐盟 CBAM 規則持續更新，實際義務請以各國主管機關公告為準。CBAM 繳費義務由歐盟進口商承擔。

### English
CarbonLens is built and maintained by Jimmy Lo. This tool provides carbon cost estimates for reference only and does not constitute legal or tax advice. Carbon pricing rules and EU CBAM regulations are subject to change — verify with relevant authorities. CBAM payment obligations are borne by EU importers.

---

## 12. 新增：數據 vs 預設值面板文案

### 標題
- ZH：`有數據 vs 沒數據：你的歐盟客戶成本差多少？`
- EN：`Actual Data vs. Defaults: How much can your EU buyer save?`

### 說明
- ZH：`歐盟規定，如果進口商拿不到供應商的實際排放數據，就必須用「預設值」申報 CBAM。預設值的計算基礎是歐盟境內排放最高的 10% 生產商的平均值，而且逐年加成（2026 年 +10%、2027 年 +20%、2028 年起 +30%）。簡單說：沒有數據 = 被當作最差的那一群，而且還要加罰。`
- EN：`EU rules require importers to use "default values" for CBAM reporting if they can't get actual emissions data from suppliers. These defaults are based on the average of the worst-performing 10% of EU producers — and they get marked up each year (2026: +10%, 2027: +20%, 2028+: +30%). In short: no data = treated as worst-in-class, plus a penalty markup.`

### 差額區塊
- ZH：`→ 這個差額代表你建立碳排放數據管理能力後，能幫歐盟客戶省下的碳關稅金額。能提供實際數據的供應商，讓客戶花更少的錢，也讓自己更有競爭力。`
- EN：`→ This gap represents how much carbon border tax your EU buyer saves when you provide actual emissions data. Suppliers who can provide real data help their buyers pay less — and become more competitive in the process.`

---

## 13. 新增：行動建議面板文案

### 標題
- ZH：`這些數字對你意味著什麼`
- EN：`What these numbers mean for you`

### CBAM 義務主體提醒（所有有 CBAM 結果的情境）
- ZH：`提醒：CBAM 的繳費義務由歐盟進口商承擔，不是出口商。本工具估算的碳關稅是你的歐盟客戶面臨的成本。這個成本會不會影響到你——比如客戶要求你分攤、或轉向碳排更低的競爭對手——取決於你和客戶之間的商業關係。`
- EN：`Reminder: CBAM payment obligations fall on the EU importer, not the exporter. The carbon border tax shown here is what your EU buyer faces. Whether this cost affects you — through cost-sharing requests or buyers switching to lower-carbon competitors — depends on your commercial relationship.`

### 越南特殊提醒
- ZH：`越南目前沒有正式的碳定價機制，這意味著你的歐盟客戶從越南進口時，無法申請任何碳價抵扣——碳關稅必須全額負擔。建議關注越南碳交易試行進度，並考慮提前建立碳排放數據的管理能力（例如 ISO 14064 碳盤查），這樣至少能幫客戶用實際數據申報，避免被套用更貴的預設值。`
- EN：`Vietnam currently has no formal carbon pricing mechanism. This means your EU buyer cannot claim any carbon price deduction when importing from Vietnam — they pay full carbon border tax. We recommend monitoring Vietnam's ETS pilot progress and considering building carbon data management capability (e.g., ISO 14064 inventory). At minimum, this lets your buyer report with actual data instead of the more expensive default values.`
