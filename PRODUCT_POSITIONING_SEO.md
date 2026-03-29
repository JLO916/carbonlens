# CarbonLens 產品定位與 SEO 整合規格書
# Product Positioning & SEO Integration Spec

---

## 一、產品定位總覽

### 核心定位（一句話）

**中文**：CarbonLens 幫企業模擬不同碳費策略的十年成本走勢，在跟 CFO 報告之前、跟顧問簽約之前、跟歐洲客戶談判之前，先用數字把選項看清楚。

**English**：CarbonLens helps businesses model long-term carbon cost scenarios — so you can see the numbers before you brief your CFO, hire a consultant, or negotiate with your EU buyer.

### 產品結構：台灣做深、CBAM 做廣、其他五國做淺

| 層級 | 功能深度 | 目標使用者 |
|------|---------|-----------|
| 台灣版（核心）| 碳費策略十年沙盤、門檻敏感度、CL 係數模擬、碳成本佔比分析 | 512 家碳費對象中的 300-400 家中型廠、1,800 家上市櫃、ESG 顧問 |
| CBAM 跨國比較（廣度）| 六國碳價抵扣比較、實際數據 vs 預設值差異、進口商採購視角 | 鋼鐵/扣件出口商、歐盟進口商、供應鏈管理者 |
| 其他五國（輔助）| 碳成本量級估算 + 接入 CBAM 比較 + 未來費率走勢 | 各國碳費對象的初步認知、RECCESSARY SEA 讀者 |

### 這個工具不是什麼（避免謬誤的紅線）

- ❌ 不是合規申報系統（不能替代環境部碳費申報平台或歐盟 CBAM Registry）
- ❌ 不是碳盤查工具（不計算排放量，而是在已知排放量前提下估算碳成本）
- ❌ 不會說「你要繳多少 CBAM」（CBAM 義務人是歐盟進口商，不是亞洲出口商）
- ❌ 不會說「你能省多少」（碳價抵扣的受益者是歐盟進口商，出口商的受益取決於商業談判）
- ❌ 不會給假精確的單一數字（給的是策略比較和情境範圍）
- ❌ 不會把分析判斷包裝成官方認定（CBAM 抵扣確定性等級是分析判斷，非歐盟官方分類）

---

## 二、頁面架構與 SEO 關鍵字佈局

### 網站地圖（含目標關鍵字）

```
/                          ← 首頁（品牌 + 六國入口）
/tw                        ← 台灣碳費策略分析（深度核心）
/tw/scenario               ← 台灣碳費十年情境模擬
/sg                        ← 新加坡碳稅估算
/kr                        ← 韓國 K-ETS 成本估算
/jp                        ← 日本碳稅與 GX-ETS 估算
/th                        ← 泰國碳稅估算
/vn                        ← 越南碳定價現況與展望
/cbam                      ← CBAM 碳關稅成本評估（通用）
/compare                   ← 跨國碳價競爭力比較
/guide                     ← 使用說明 / 計算方法論
/about                     ← 關於 CarbonLens
```

### 各頁面 SEO 元素規格

---

#### 首頁 `/`

**Title tag（60字內）：**
- ZH：`碳費試算與CBAM碳關稅計算器｜亞太六國碳成本分析 — CarbonLens`
- EN：`Carbon Fee Calculator & CBAM Cost Estimator | Asia-Pacific — CarbonLens`

**Meta description（155字內）：**
- ZH：`免費線上碳成本分析工具。台灣碳費三種費率方案十年成本比較、歐盟CBAM碳關稅影響評估、亞太六國碳價競爭力比較。幫企業在決策前看清碳定價的長期影響。`
- EN：`Free carbon cost analysis tool. Compare Taiwan's three carbon fee rate options over 10 years, assess EU CBAM impact, and benchmark carbon cost competitiveness across 6 Asia-Pacific countries.`

**H1：**
- ZH：`亞太碳成本分析工具 — 用數字看清碳定價對你的生意影響`
- EN：`Asia-Pacific Carbon Cost Analyzer — See how carbon pricing affects your business`

**首頁價值主張文案（SEO 內容區塊）：**

```
2025-2026 年，亞太碳定價進入加速期。台灣碳費首度實徵、新加坡碳稅調升
至 SGD 45、日本 GX-ETS 從自願轉強制、泰國通過首部碳稅立法。與此同時，
歐盟碳邊境調整機制（CBAM）正式進入實質階段。

企業面臨的不是一個數字，而是一連串選擇：

• 台灣碳費選一般費率還是優惠費率？十年下來差多少？
• 出口歐盟的產品，客戶的碳關稅成本有多高？
  提供實際排放數據能幫客戶省多少？
• 跟韓國、越南的競爭對手比，我的碳價競爭力在哪？

CarbonLens 幫你在做決策之前，先用數字把選項看清楚。
免費、開放、不需要註冊。
```

**六國卡片區（保留現有設計，調整文案）：**

每張卡片底部加一句使用場景描述：

- 台灣：「比較三種費率方案的十年成本差異」
- 新加坡：「估算碳稅調升對營運成本的影響」
- 韓國：「評估 K-ETS 配額成本與 CBAM 抵扣效益」
- 日本：「了解碳稅加 GX-ETS 雙軌制的綜合碳成本」
- 泰國：「掌握碳稅上路後的成本量級」
- 越南：「評估無正式碳價下的 CBAM 競爭力劣勢」

---

#### 台灣頁面 `/tw`（深度核心）

**Title tag：**
- ZH：`台灣碳費試算器｜一般費率vs優惠費率比較、高碳洩漏CL係數模擬 — CarbonLens`
- EN：`Taiwan Carbon Fee Calculator | Rate Comparison & Carbon Leakage Simulation — CarbonLens`

**Meta description：**
- ZH：`台灣碳費免費試算工具。比較一般費率NT$300、優惠B NT$100、優惠A NT$50三種方案的十年累計成本。支援高碳洩漏風險CL係數三期模擬、碳費門檻敏感度分析、碳成本佔營收比計算。`
- EN：`Free Taiwan carbon fee calculator. Compare three rate options (NT$300/100/50) over 10 years. Simulate carbon leakage CL coefficient changes, threshold sensitivity, and carbon cost as % of revenue.`

**H1：**
- ZH：`台灣碳費策略分析 — 三種費率方案，哪個對你最有利？`
- EN：`Taiwan Carbon Fee Strategy Analysis — Which rate option works best for you?`

**頁面內容架構（SEO 優化的 H2/H3 結構）：**

```
H2: 碳費基本資訊
    - 收費對象與門檻（年排放量 ≥ 25,000 tCO₂e）
    - 計算公式：收費排放量 = (年排放量 - K值) × CL係數
    - 三種費率說明

H2: 費率方案比較試算  ← 互動工具區
    [表單輸入區]

H2: 十年碳費成本走勢模擬
    - CL 係數三期遞增（0.2 → 0.4 → 0.6）的累計影響
    - 2030 年後費率調升（NT$1,200-1,800）的情境預測

H2: 碳費門檻敏感度分析
    - 如果門檻從 25,000 噸降至 15,000 或 10,000 噸

H2: 碳成本佔營收比分析
    - 碳費佔營收 / 毛利的百分比
    - 是否符合高碳洩漏風險個別事業條件（佔毛利 30% 以上）

H2: 出口歐盟？評估你的 CBAM 碳價競爭力 → [連結到 /cbam]

H2: 計算方法與資料來源
    - 引用環境部碳費三子法
    - 引用氣候署碳費專區
    - 免責聲明
```

**台灣頁面底部 SEO 內容區塊（約 300 字）：**

```
台灣碳費自 2025 年起正式開徵，首波徵收對象為年溫室氣體排放量達 
2.5 萬公噸以上的電力業、鋼鐵業、煉油業、水泥業、半導體業、
面板業及石化業等約 512 家企業。

碳費計算公式為「收費排放量 × 徵收費率」。收費排放量的計算取決於
企業是否屬於高碳洩漏風險行業：高碳洩漏風險行業享有排放量調整
係數（CL 係數），初期為 0.2（等同打二折），第二期調升至 0.4，
第三期 0.6；非高碳洩漏風險行業則扣除 K 值門檻（25,000 噸）後
全額計算。

費率分為三種：一般費率 NT$300/tCO₂e、優惠費率 B NT$100/tCO₂e
（需達技術標竿削減率）、優惠費率 A NT$50/tCO₂e（需達 SBTi 
行業別削減率）。優惠費率需提出自主減量計畫並經環境部核定。

CarbonLens 台灣碳費策略分析工具幫助企業比較三種費率方案在
不同 CL 係數期別下的十年累計成本差異，作為內部策略討論和
預算規劃的參考起點。

本工具提供概略估算，不構成法律或稅務建議。實際碳費義務
以環境部核定為準。
```

---

#### CBAM 頁面 `/cbam`

**Title tag：**
- ZH：`CBAM碳關稅計算器｜歐盟碳邊境調整機制成本評估 — CarbonLens`
- EN：`CBAM Calculator | EU Carbon Border Adjustment Mechanism Cost Estimator — CarbonLens`

**Meta description：**
- ZH：`免費CBAM成本評估工具。從亞洲出口企業的角度，估算歐盟進口商面臨的碳關稅成本。比較提供實際排放數據vs使用預設值的成本差異，以及各國碳價的CBAM抵扣可能性。`
- EN：`Free CBAM cost estimator from the Asian exporter's perspective. Compare actual vs default emission value costs for EU importers, and assess cross-country carbon price deduction likelihood.`

**H1：**
- ZH：`CBAM 碳關稅成本評估 — 你的歐盟客戶面臨多少碳成本？`
- EN：`CBAM Carbon Border Tax Assessment — How much carbon cost does your EU buyer face?`

**頁面價值主張文案：**

```
重要前提：CBAM（碳邊境調整機制）的繳費義務由歐盟進口商承擔，
不是亞洲出口商。

但這不代表跟你無關。你的歐盟客戶的 CBAM 成本越高，
他轉向碳排更低的競爭對手的可能性就越大。

這個工具幫你回答三個問題：

1. 你的歐盟客戶因為跟你買產品，要多付多少 CBAM 成本？
2. 如果你提供實際排放數據（而不是被套預設值），
   能幫客戶省多少？
3. 你在國內繳的碳費，有多少可以被歐盟認定為可抵扣？
```

**「數據 vs 預設值」比較區塊（H2）：**

```
H2: 為什麼提供實際排放數據很重要？

歐盟規定，如果進口商無法取得供應商的實際排放數據，
必須使用預設排放值申報 CBAM。預設值的計算基礎是
歐盟境內同類產品排放最高 10% 的生產商平均值，
而且逐年加成：2026 年加 10%、2027 年加 20%、2028 年起加 30%。

換句話說，不提供數據 = 被當作最差的那一批。

用這個工具比較看看：同樣的產品、同樣的出口量，
你的歐盟客戶用預設值申報 vs 用你的實際數據申報，
CBAM 成本差多少。這個差額就是你建立碳盤查能力的投資價值。
```

**CBAM 抵扣確定性區塊（修正措辭）：**

```
H2: 各國碳價被歐盟認定為可抵扣的可能性

以下為基於現行法規和公開資訊的分析判斷，
非歐盟官方認定結果。歐盟尚未公布各國碳價
CBAM 抵扣資格的正式清單。

🟢 新加坡、韓國：碳定價機制明確，高度可能被認定為可抵扣
🟡 台灣、日本：碳費/碳稅可抵，但部分規則（如 Scope 2 折算）待協商
🔴 泰國：碳稅嵌入消費稅且不影響終端價格，認定存在不確定性
⚫ 越南：目前無正式碳定價，無法申請抵扣

提醒：即使碳價被認定為可抵扣，
受益者是歐盟進口商（減少需購買的 CBAM 憑證數量），
不是亞洲出口商。出口商能否從中受益，
取決於與進口商的商業條件和議價結果。
```

---

#### 跨國比較頁面 `/compare`

**Title tag：**
- ZH：`碳成本跨國比較｜台灣vs韓國vs越南出口歐盟CBAM成本差異 — CarbonLens`
- EN：`Carbon Cost Country Comparison | CBAM Cost by Export Origin — CarbonLens`

**Meta description：**
- ZH：`比較同一產品從台灣、新加坡、韓國、日本、泰國、越南出口歐盟的CBAM碳關稅成本差異。了解各國碳價抵扣能力對出口競爭力的影響。`
- EN：`Compare CBAM costs for the same product exported from 6 Asia-Pacific countries. Understand how domestic carbon pricing affects your EU export competitiveness.`

**H1：**
- ZH：`跨國碳成本比較 — 你的碳價競爭力排在哪裡？`
- EN：`Cross-Country Carbon Cost Comparison — Where does your carbon competitiveness rank?`

**頁面價值主張文案：**

```
同一批鋼鐵出口歐盟，從韓國出口和從越南出口，
你的歐盟客戶面臨的 CBAM 成本可能差 20-40%。

差異來自兩個因素：
一是各國的碳排放強度不同，
二是各國碳價能抵扣的 CBAM 金額不同。

這個比較工具從歐盟進口商的採購決策視角出發，
讓你看到自己在六個亞太國家中的碳價競爭力排名。
```

---

#### 其他五國頁面（輕量版，以新加坡為範例）

**Title tag `/sg`：**
- ZH：`新加坡碳稅計算器｜SGD 25→45→80 碳稅成本估算 — CarbonLens`
- EN：`Singapore Carbon Tax Calculator | SGD 25→45→80 Cost Estimator — CarbonLens`

**Meta description `/sg`：**
- ZH：`免費新加坡碳稅估算工具。依年排放量和年度計算碳稅成本，含2024-2030年費率調升路徑預覽及CBAM交叉抵扣可能性評估。`
- EN：`Free Singapore carbon tax estimator. Calculate carbon tax by emissions and year, with 2024-2030 rate trajectory and CBAM cross-deduction assessment.`

**H1 `/sg`：**
- ZH：`新加坡碳稅估算 — 費率調升對你的營運成本影響多大？`
- EN：`Singapore Carbon Tax Estimator — How does the rate increase affect your operating costs?`

五國頁面的功能保持輕量：碳成本估算 + 未來費率走勢圖 + 「前往 CBAM 比較」CTA。
不做台灣那種多方案十年沙盤（因為制度設計沒有那個決策複雜度）。

---

#### 使用說明頁 `/guide`

**Title tag：**
- ZH：`碳費與CBAM計算方法說明｜CarbonLens 使用指南`
- EN：`Carbon Fee & CBAM Calculation Methodology | CarbonLens Guide`

**內容結構：**

```
H2: 工具定位與使用前提
    - 本工具提供概略估算，用於內部策略討論和初步規劃
    - 不替代合規申報系統或專業顧問

H2: 台灣碳費計算方法
    - 公式、參數來源、資料更新頻率
    - 引用環境部碳費三子法原文連結

H2: CBAM 計算方法
    - CBAM 公式拆解
    - 預設值加成規則
    - 碳價抵扣邏輯

H2: 各國碳定價資料來源
    - 每國列出具體法規來源和 URL

H2: 免責聲明（完整版）

H2: 常見問題（FAQ — 自然語言 SEO 目標）
    Q: 台灣碳費怎麼算？
    Q: 碳費一般費率和優惠費率差多少？
    Q: 什麼是高碳洩漏風險？CL 係數怎麼用？
    Q: CBAM 是誰要繳的？出口商還是進口商？
    Q: 國內繳的碳費可以抵扣 CBAM 嗎？
    Q: 什麼是 CBAM 預設值？為什麼用預設值比較貴？
    Q: 碳費 2030 年會漲到多少？
```

FAQ 區塊同時服務 SEO（長尾問句關鍵字）和使用者教育。每個問題的答案控制在 2-3 句內，精準回答並引導到對應工具頁面。

---

## 三、全站 SEO 技術規格

### 3.1 結構化資料（JSON-LD）

每頁加入適當的 Schema.org 結構化資料：

```json
// 首頁
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "CarbonLens",
  "description": "亞太碳成本分析工具",
  "url": "https://carbonlens-blond.vercel.app",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "author": {
    "@type": "Person",
    "name": "Jimmy Lo",
    "url": "https://www.linkedin.com/in/jimmylo1979/"
  }
}

// FAQ 頁面
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "台灣碳費怎麼算？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "碳費 = 收費排放量 × 徵收費率。收費排放量 = (年排放量 - K值) × CL係數..."
      }
    }
  ]
}
```

### 3.2 hreflang 標籤（雙語切換）

```html
<link rel="alternate" hreflang="zh-TW" href="https://carbonlens-blond.vercel.app/tw" />
<link rel="alternate" hreflang="en" href="https://carbonlens-blond.vercel.app/en/tw" />
```

### 3.3 Sitemap

自動生成 `sitemap.xml`，包含所有頁面及 lastmod 日期。
Next.js 的 `next-sitemap` 套件可自動處理。

### 3.4 Open Graph / Twitter Card

每頁設定 OG 標籤，分享到 LinkedIn 時顯示：
- 標題（對應該頁 Title）
- 描述（對應該頁 Meta description）
- 圖片（製作品牌 OG image 1200x630，含 CarbonLens logo + 六國國旗）

---

## 四、內容行銷 SEO 延伸（RECCESSARY 導流策略）

CarbonLens 本身的頁面 SEO 是有限的（工具頁面的文字量天然較少）。
真正能帶動 SEO 流量的是 RECCESSARY 官網的文章連結到 CarbonLens。

### 建議從 RECCESSARY 放連結的文章主題

| RECCESSARY 文章主題 | 嵌入 CarbonLens 連結的方式 |
|-------------------|-------------------------|
| 台灣碳費三子法解析 | 「想快速比較三種費率方案？→ 試試 CarbonLens 碳費策略分析工具」|
| CBAM 2026 正式實施懶人包 | 「評估你的產品出口歐盟的碳成本曝險 → CarbonLens CBAM 評估工具」|
| 亞太六國碳定價比較 | 「用互動工具比較六國碳成本 → CarbonLens 跨國比較」|
| 越南碳市場發展趨勢 | 「越南出口商在 CBAM 框架下的競爭力分析 → CarbonLens」|
| 碳費對鋼鐵業的影響 | 「鋼鐵業碳費試算：一般費率 vs 優惠費率十年差異 → CarbonLens」|

每篇文章至少放 1-2 個指向 CarbonLens 對應頁面的連結，
使用描述性錨點文字（不要用「點這裡」）。

---

## 五、給 Claude Code 的執行指令

```
讀取這份產品定位與 SEO 整合規格書。

Phase 1（Day 1-2）：SEO 基礎建設
1. 按照規格書設定每個頁面的 title tag、meta description、H1
2. 加入 hreflang 標籤
3. 安裝 next-sitemap 自動生成 sitemap.xml
4. 加入 JSON-LD 結構化資料（WebApplication + FAQPage）
5. 設定 Open Graph 標籤
6. 更新 i18n 的 zh-TW.json 和 en.json

Phase 2（Day 2-3）：首頁與台灣頁面內容重構
1. 重寫首頁 Hero 文案和六國卡片描述
2. 台灣頁面加入 SEO 內容區塊（底部 300 字）
3. 台灣頁面 H2/H3 結構按規格書調整
4. 所有頁面的語言框架按 PRODUCT_CORRECTION.md 措辭替換表執行

Phase 3（Day 3-4）：CBAM 頁面與其他頁面
1. CBAM 頁面加入「數據 vs 預設值」說明區塊和「抵扣可能性」修正措辭
2. 跨國比較頁面加入「進口商採購視角」文案
3. 使用說明頁加入 FAQ 區塊（含 Schema.org FAQPage 結構化資料）
4. 其他五國頁面加入輕量 SEO 內容區塊

Phase 4（Day 4-5）：驗證與上線
1. Google Search Console 設定
2. sitemap.xml 提交
3. 所有頁面的 title/meta/H1 驗證
4. 結構化資料驗證（Google Rich Results Test）
5. OG 標籤預覽驗證（LinkedIn Post Inspector）

重要提醒：
- 計算引擎（lib/calculators/）完全不改動
- SEO 內容區塊放在工具互動區下方，不影響使用者操作體驗
- 所有文案遵守 PRODUCT_CORRECTION.md 的措辭規範
- FAQ 答案要精準簡短（2-3 句），不要長篇大論
```

---

## 六、SEO 成效預期（務實版）

| 時間 | 預期 | 前提條件 |
|------|------|---------|
| 第 1-2 月 | 自然搜尋流量接近零 | 提交 sitemap、等待收錄 |
| 第 3-6 月 | 中文長尾字開始帶入 200-500 月訪客 | RECCESSARY 至少 3 篇文章放連結 |
| 第 6-12 月 | 月自然搜尋 1,000-3,000 | 持續內容更新 + 法規變動時更新工具數據 |

最重要的 SEO 動作不在 CarbonLens 本身，而是從 RECCESSARY 放連結。
RECCESSARY 的 domain authority 遠高於 vercel.app 子網域，
每一條從 RECCESSARY 指向 CarbonLens 的連結都是 SEO 加速器。

長期來看，綁自訂域名 `carbonlens.reccessary.com` 或獨立域名，
是最大的 SEO 槓桿——但這是下一步的決策，不影響現在的執行。
