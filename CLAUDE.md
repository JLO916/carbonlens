# APAC Carbon Cost Calculator — Claude Code 專案規格書
# 亞太碳成本試算器：國內碳價 × EU CBAM 雙軌合規工具

## 專案概述

建造一個 **APAC 多國碳成本試算器** Web 應用 MVP。涵蓋台灣、泰國、越南、新加坡、韓國、日本六國的國內碳定價機制，與歐盟 CBAM 碳邊境調整機制的成本試算，提供「國內碳價 × CBAM 交叉抵扣」整合分析。

### 產品定位
- **目標用戶**：APAC 六國的碳費/碳稅徵收對象企業、出口歐盟的製造商、ESG 顧問公司
- **核心價值**：市場唯一能同時處理多國國內碳價與歐盟 CBAM 交叉抵扣的免費工具
- **語言**：繁體中文 / English 雙語切換（不需當地語言）
- **商業模式**：免費基礎版（單國碳價 + CBAM 試算）→ 付費版（多國比較 + 情境分析 + PDF 報告匯出）
- **品牌**：預留 RECCESSARY 品牌標示，主色 sage green `#89B56C`

---

## 技術架構

### Tech Stack
- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **State**: React state — 所有計算在前端完成，無需後端
- **Charts**: Recharts
- **i18n**: next-intl（zh-TW + en）
- **Deployment**: Vercel
- **PDF Export**: @react-pdf/renderer（付費功能）

### 專案結構（模組化設計）
```
carbon-calculator/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # Landing page（國家選擇入口）
│   ├── [country]/                        # 動態路由：tw, th, vn, sg, kr, jp
│   │   ├── page.tsx                      # 該國碳價試算主頁
│   │   └── dual-track/
│   │       └── page.tsx                  # 該國 × CBAM 雙軌整合
│   ├── cbam/
│   │   └── page.tsx                      # 純 CBAM 試算（通用）
│   └── compare/
│       └── page.tsx                      # 跨國碳成本比較（付費功能）
├── components/
│   ├── ui/                               # shadcn components
│   ├── calculator/
│   │   ├── CountrySelector.tsx           # 國家選擇卡片
│   │   ├── DomesticCarbonForm.tsx        # 國內碳價表單（依國家動態渲染）
│   │   ├── CBAMForm.tsx                  # CBAM 表單（通用）
│   │   ├── DualTrackDashboard.tsx        # 雙軌整合儀表板
│   │   ├── ScenarioChart.tsx             # 情境分析圖表
│   │   ├── ResultCard.tsx                # 結果卡片
│   │   ├── CrossDeductionPanel.tsx       # 交叉抵扣分析面板
│   │   └── CountryComparisonTable.tsx    # 跨國比較表
│   └── layout/
│       ├── Header.tsx                    # 含語言切換 + 國家切換
│       └── Footer.tsx
├── lib/
│   ├── calculators/
│   │   ├── domestic/                     # ⭐ 國別碳價計算引擎（Plugin 架構）
│   │   │   ├── types.ts                  # 共用介面 DomesticCarbonPriceCalculator
│   │   │   ├── taiwan.ts                 # 台灣碳費
│   │   │   ├── thailand.ts              # 泰國碳稅
│   │   │   ├── vietnam.ts              # 越南 ETS（試行）
│   │   │   ├── singapore.ts            # 新加坡碳稅
│   │   │   ├── korea.ts               # 韓國 K-ETS
│   │   │   ├── japan.ts               # 日本碳稅 + GX-ETS
│   │   │   └── index.ts               # 工廠函數：getCalculator(countryCode)
│   │   ├── cbam.ts                      # EU CBAM 計算引擎（通用）
│   │   ├── dual-track.ts               # 雙軌整合（國內碳價 × CBAM 抵扣）
│   │   └── scenario.ts                 # 情境模擬引擎
│   ├── data/
│   │   ├── countries.ts                 # 六國基本資訊與碳定價摘要
│   │   ├── cbam-defaults.ts            # CBAM 預設排放值、因子、基準值
│   │   └── exchange-rates.ts           # 預設匯率（可手動調整）
│   ├── types.ts                         # 全域 TypeScript 型別
│   └── utils.ts
├── messages/
│   ├── zh-TW.json
│   └── en.json
└── public/
    └── flags/                           # 國旗 SVG
```

---

## 核心介面定義

### 國內碳價計算器共用介面 (`lib/calculators/domestic/types.ts`)

```typescript
// 所有國別計算器必須實作此介面
export interface DomesticCarbonPriceCalculator {
  countryCode: CountryCode;
  countryName: { zhTW: string; en: string };
  mechanismType: 'carbon_tax' | 'ets' | 'carbon_fee' | 'hybrid';
  
  calculate(input: DomesticInput): DomesticResult;
  getFormFields(): FormFieldConfig[];  // 動態表單欄位配置
  getDefaultParams(): Record<string, any>;
}

export type CountryCode = 'tw' | 'th' | 'vn' | 'sg' | 'kr' | 'jp';

export interface DomesticInput {
  annualEmissions: number;          // tCO₂e（Scope 1+2）
  industryType: string;             // 產業別
  year: number;                     // 計算年度
  countrySpecific: Record<string, any>; // 國別特定參數
}

export interface DomesticResult {
  totalCarbonCost: number;          // 國內碳成本（當地貨幣）
  totalCarbonCostUSD: number;       // 換算 USD
  effectiveRate: number;            // 有效費率（當地貨幣/tCO₂e）
  effectiveRateUSD: number;         // 有效費率 USD
  currency: string;                 // 幣別代碼
  chargeableEmissions: number;      // 實際收費排放量
  breakdown: CostBreakdown[];       // 計算步驟拆解
  deductibleForCBAM: number;        // 可用於抵扣 CBAM 的金額（EUR）
  notes: string[];                  // 注意事項/假設說明
}

export interface CostBreakdown {
  step: string;                     // 步驟名稱（雙語 key）
  value: number;
  unit: string;
  explanation: string;              // 說明（雙語 key）
}

export interface FormFieldConfig {
  key: string;
  type: 'number' | 'select' | 'toggle' | 'radio';
  label: { zhTW: string; en: string };
  options?: { value: string; label: { zhTW: string; en: string } }[];
  defaultValue: any;
  required: boolean;
  tooltip?: { zhTW: string; en: string };
}
```

---

## 六國碳定價計算邏輯

### 1. 台灣 (`domestic/taiwan.ts`)
**機制**：碳費（Carbon Fee）
**公式**：`碳費 = (年排放量 - K值) × CL係數 × 費率`

| 參數 | 值 |
|------|-----|
| 一般費率 | NT$300/tCO₂e |
| 優惠 A（SBTi 行業別削減率） | NT$50/tCO₂e |
| 優惠 B（技術標竿削減率） | NT$100/tCO₂e |
| K 值（非高碳洩漏） | 25,000 tCO₂e |
| K 值（高碳洩漏） | 0 |
| CL 係數（高碳洩漏，第一期 2025-26） | 0.2 |
| CL 係數（第二期 2027-28） | 0.4 |
| CL 係數（第三期 2029-30） | 0.6 |
| CL 係數（非高碳洩漏） | 1.0 |

**表單特有欄位**：產業別、費率選擇（一般/A/B）、是否高碳洩漏、計算期別、碳權扣抵數量
**CBAM 抵扣注意**：台灣碳費涵蓋 Scope 1+2，但 CBAM（鋼鐵/鋁）僅計 Scope 1 直接排放。抵扣時需按比例折算。
**未來費率路徑**：2030 年後預計 NT$1,200-1,800/tCO₂e

### 2. 新加坡 (`domestic/singapore.ts`)
**機制**：碳稅（Carbon Tax）
**公式**：`碳稅 = 應稅排放量 × 碳稅率`

| 參數 | 值 |
|------|-----|
| 2024 費率 | SGD 25/tCO₂e |
| 2026-2027 費率 | SGD 45/tCO₂e |
| 2028-2029 費率 | SGD 50-80/tCO₂e（取中位 SGD 65） |
| 門檻 | 年排放 ≥ 25,000 tCO₂e 的設施 |
| 涵蓋範圍 | 電力及工業部門直接排放 |
| 國際碳權抵扣 | 最多可抵 5% 應稅排放量 |
| EITE 過渡配額 | 高碳洩漏風險產業享部分免費配額 |

**表單特有欄位**：年排放量、年度、是否為 EITE 產業、國際碳權使用量
**CBAM 抵扣**：新加坡碳稅直接對應 CBAM 的「carbon price paid in country of origin」，抵扣邏輯最直接
**特色**：計算最簡單的國家，適合作為第二個實作的模組

### 3. 韓國 (`domestic/korea.ts`)
**機制**：排放交易制度 K-ETS（Cap-and-Trade）
**公式**：`碳成本 = max(0, 實際排放 - 免費配額) × KAU 市場價格`

| 參數 | 值 |
|------|-----|
| KAU 市場價格（2025） | ~KRW 9,145/tCO₂e（~USD 6.3） |
| 覆蓋範圍 | 全國 79% 排放，685+ 受管制企業 |
| 涵蓋氣體 | CO₂, CH₄, N₂O, HFCs, PFCs, SF₆ |
| 免費配額比例 | 依產業別 benchmark 分配 |
| 現行階段 | 第三期（2021-2025），第四期規劃中 |

**表單特有欄位**：年排放量、免費配額估算（可依產業 benchmark 自動帶入或手動輸入）、KAU 價格（預設最新值，可調）
**CBAM 抵扣**：K-ETS 配額購買成本可用於 CBAM 抵扣。韓國鋼鐵業（POSCO 等）是歐盟主要進口來源
**注意**：ETS 價格波動大，需提示用戶這是估算

### 4. 日本 (`domestic/japan.ts`)
**機制**：碳稅 + GX-ETS 雙軌（Hybrid）
**公式**：`碳成本 = 碳稅成本 + GX-ETS 配額成本`

| 參數 | 值 |
|------|-----|
| 碳稅（氣候變遷減緩稅） | ¥289/tCO₂e（自 2016 年起固定） |
| 碳稅門檻 | 適用所有化石燃料進口/消費 |
| GX-ETS（2026 年 4 月起強制） | 年排 ≥ 100,000 tCO₂e 企業，約 300-400 家 |
| GX-ETS 配額價格 | 待定（將設價格上下限），J-Credit 參考 ¥2,600-5,600/tCO₂e |
| 碳附加費（2028 年起） | 針對化石燃料進口商，費率待定 |
| 配額拍賣（2033 年起） | 僅電力部門 |

**表單特有欄位**：化石燃料使用量（碳稅部分）、年排放量（GX-ETS 部分）、是否為 GX-ETS 受管制企業、GX-ETS 配額價格假設
**CBAM 抵扣**：日本碳稅 ¥289 是否符合 CBAM 的「carbon price」定義尚有爭議（因為是在既有能源稅架構內）。GX-ETS 配額購買成本較明確可抵扣。工具應標註此不確定性。
**特色**：最複雜的計算模組（碳稅 + ETS 雙軌）

### 5. 泰國 (`domestic/thailand.ts`)
**機制**：碳稅（嵌入消費稅，2025 年 3 月起）
**公式**：`碳稅 = 燃料消費量 × 燃料排放因子 × THB 200/tCO₂e`

| 參數 | 值 |
|------|-----|
| 費率 | THB 200/tCO₂e（~USD 5.9） |
| 適用範圍 | 石油及石油產品（汽油、柴油、LPG 等） |
| 機制 | 嵌入消費稅，不影響零售價格（稅內結構調整） |
| ETS 規劃 | 2029 年啟動 |
| 泰版 CBAM | 2031 年規劃實施 |
| 報告門檻 | 25,000 tCO₂e（與氣候變遷法草案一致） |

**表單特有欄位**：各類燃料年消費量（汽油、柴油、LPG、燃料油等）、或直接輸入總排放量以費率計算
**CBAM 抵扣**：泰國碳稅目前僅嵌入消費稅且不影響終端價格，是否被歐盟認定為有效「carbon price paid」存在高度不確定性。工具應標註此風險。
**注意**：泰國鋼鐵/鋁出口歐盟量相對小，但氣候變遷法 2029 年後可能大幅擴大碳定價範圍

### 6. 越南 (`domestic/vietnam.ts`)
**機制**：ETS 試行（Pilot）+ 規劃中
**公式**：目前無正式碳價，提供情境模擬

| 參數 | 值 |
|------|-----|
| 目前狀態 | ETS 試點啟動中，無正式碳價 |
| 規劃時程 | 2025-2027 試行 → 2028 後正式 ETS |
| 涵蓋產業 | 預計電力、鋼鐵、水泥先行 |
| 預估碳價 | 市場預估 USD 1-5/tCO₂e（初期） |

**表單特有欄位**：年排放量、出口歐盟產品量。因無正式碳價，主要提供：(1) CBAM 成本估算（無國內碳價抵扣 = 全額負擔）、(2) 假設不同碳價水準的情境模擬
**CBAM 抵扣**：越南目前無正式碳價，意味著出口商**無法抵扣任何 CBAM 費用**——這是越南出口商面臨的最大風險，工具應突出顯示
**特色**：越南是 CBAM 涵蓋商品對歐出口第三大國（~USD 30 億），痛感最強

---

## CBAM 計算引擎（通用，`lib/calculators/cbam.ts`）

與前版相同，不分國家。核心公式：

```
CBAM 成本 = [進口量 × 單位內含排放 - (EU ETS 基準值 × CBAM 因子 × 進口量)] × CBAM 憑證價格 - 原產國碳價抵扣
```

**CBAM 因子時程**（免費配額遞減）：
2026: 97.5% → 2027: 95.0% → 2028: 90.0% → 2029: 82.5% → 2030: 75.0% → 2034: 0%

**預設排放值加成**：2026 +10%, 2027 +20%, 2028+ +30%

**CBAM 憑證價格**：2026 按季度平均 EU ETS 拍賣價，預設 €70-100 區間

**De minimis**：年進口 ≤ 50 噸豁免（氫/電力除外）

**涵蓋產品**：鋼鐵（含扣件）、鋁、水泥、化肥、氫、電力。2028 年起擬擴大至 180 種下游鋼鋁產品。

---

## 雙軌整合邏輯 (`lib/calculators/dual-track.ts`)

```typescript
interface DualTrackInput {
  countryCode: CountryCode;
  domesticInput: DomesticInput;
  cbamInput: CBAMInput;
  exportToEUPercentage: number;
}

interface DualTrackResult {
  domesticResult: DomesticResult;
  cbamResult: CBAMResult;
  crossDeduction: {
    domesticCostDeductibleFromCBAM_EUR: number;  // 可抵扣金額
    deductionConfidence: 'high' | 'medium' | 'low'; // 抵扣確定性
    deductionNotes: string[];  // 不確定性說明
    netCBAMCost_EUR: number;
    netCombinedCost_USD: number;
  };
  scenarioComparison?: any;  // 國別特有的費率方案比較
  optimizationSuggestions: string[];
}
```

**各國 CBAM 抵扣確定性等級**：
| 國家 | 確定性 | 原因 |
|------|-------|------|
| 新加坡 | 🟢 High | 明確碳稅，直接適用 |
| 韓國 | 🟢 High | K-ETS 配額購買成本符合 CBAM 定義 |
| 台灣 | 🟡 Medium | 碳費可抵，但 Scope 2 部分的折算規則待與歐盟協商 |
| 日本 | 🟡 Medium | 碳稅 ¥289 定義模糊，GX-ETS 配額較明確 |
| 泰國 | 🔴 Low | 碳稅嵌入消費稅且不影響價格，歐盟認定存疑 |
| 越南 | ⚫ None | 無正式碳價，無法抵扣 |

---

## 情境模擬引擎 (`lib/calculators/scenario.ts`)

為每個國家提供 2025-2034 年的碳成本預測曲線，包含：
- 國內碳價調升路徑（各國不同）
- CBAM 因子逐年遞減（通用）
- EU ETS 價格預測（€70→€130 區間）
- 企業自身減排路徑（可選輸入）

各國碳價預測路徑（預設值，可手動調整）：
```typescript
export const CARBON_PRICE_PROJECTIONS: Record<CountryCode, Record<number, number>> = {
  tw: { 2025: 300, 2026: 300, 2028: 500, 2030: 1200, 2034: 1800 }, // NTD
  sg: { 2025: 25, 2026: 45, 2027: 45, 2028: 65, 2030: 80 },       // SGD
  kr: { 2025: 9145, 2026: 12000, 2028: 18000, 2030: 25000 },       // KRW
  jp: { 2025: 289, 2026: 289, 2028: 1500, 2030: 3300 },            // JPY（含碳附加費）
  th: { 2025: 200, 2026: 200, 2029: 400, 2030: 600 },              // THB
  vn: { 2025: 0, 2027: 50000, 2028: 75000, 2030: 150000 },         // VND（預估）
};
```

---

## UI / UX 設計規格

### Landing Page (`/`)
- Hero：「亞太碳成本試算器」/「APAC Carbon Cost Calculator」
- 副標：「六國碳價 × EU CBAM — 一站式合規成本計算」
- **六國卡片**：每張卡片顯示國旗、國名、碳定價機制類型、現行費率、狀態標籤（已實施/規劃中）
- 點擊任一國家卡片 → 進入該國計算器
- 底部：CBAM 法規時間軸（2023-2034）、語言切換

### 國別計算頁 (`/[country]`)
- 頂部：國家標題 + 碳定價機制摘要卡片
- **Step 1**：基本資訊（排放量、產業別）— 共用欄位
- **Step 2**：國別特有參數 — 由 `getFormFields()` 動態渲染
- **Step 3**：結果面板
  - 大數字：碳成本金額（當地貨幣 + USD）
  - 計算步驟拆解
  - 「前往 CBAM 整合分析」CTA 按鈕

### 雙軌整合頁 (`/[country]/dual-track`)
- 左欄：國內碳價摘要
- 右欄：CBAM 成本摘要
- 中間：交叉抵扣分析（含確定性等級標示 🟢🟡🔴⚫）
- 底部：情境分析圖表（2025-2034 碳成本預測）

### CBAM 通用頁 (`/cbam`)
- 不選國家，純 CBAM 計算
- 出口國下拉選單（六國 + 其他）
- 如選六國之一，提示「前往該國雙軌整合分析可獲得更完整結果」

### 跨國比較頁 (`/compare`)（Phase 2）
- 輸入同一排放量假設
- 六國碳成本並排比較
- 「如果你在越南設廠 vs 台灣設廠，CBAM 成本差多少？」

### 設計規格
- **色彩**：主色 `#89B56C`，輔色 `#6E9156`，強調色 `#6DAD42`，每個國家有辨識色帶
- **字型**：Noto Sans TC（中文）+ Inter（英文/數字）
- **響應式**：Desktop first，支援平板
- **數字**：千分位分隔，排放量保留小數 1 位，金額整數
- **匯率**：頁面右上角顯示當前使用匯率，可手動調整

---

## 資料檔案

### `lib/data/countries.ts`
```typescript
export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  tw: {
    code: 'tw',
    name: { zhTW: '台灣', en: 'Taiwan' },
    flag: '🇹🇼',
    currency: 'TWD',
    currencySymbol: 'NT$',
    mechanism: { zhTW: '碳費', en: 'Carbon Fee' },
    mechanismType: 'carbon_fee',
    currentRate: { value: 300, unit: 'TWD/tCO₂e', year: 2025 },
    status: 'active', // active | planned | pilot
    cbamRelevance: 'medium', // CBAM 出口歐盟相關度
    keyIndustries: ['steel', 'fasteners', 'aluminum', 'cement'],
  },
  sg: {
    code: 'sg',
    name: { zhTW: '新加坡', en: 'Singapore' },
    flag: '🇸🇬',
    currency: 'SGD',
    currencySymbol: 'S$',
    mechanism: { zhTW: '碳稅', en: 'Carbon Tax' },
    mechanismType: 'carbon_tax',
    currentRate: { value: 25, unit: 'SGD/tCO₂e', year: 2024 },
    status: 'active',
    cbamRelevance: 'low',
    keyIndustries: ['refining', 'petrochemicals', 'power'],
  },
  kr: {
    code: 'kr',
    name: { zhTW: '韓國', en: 'South Korea' },
    flag: '🇰🇷',
    currency: 'KRW',
    currencySymbol: '₩',
    mechanism: { zhTW: '排放交易制度 K-ETS', en: 'K-ETS (Cap-and-Trade)' },
    mechanismType: 'ets',
    currentRate: { value: 9145, unit: 'KRW/tCO₂e', year: 2025 },
    status: 'active',
    cbamRelevance: 'high',
    keyIndustries: ['steel', 'aluminum', 'petrochemicals', 'cement'],
  },
  jp: {
    code: 'jp',
    name: { zhTW: '日本', en: 'Japan' },
    flag: '🇯🇵',
    currency: 'JPY',
    currencySymbol: '¥',
    mechanism: { zhTW: '碳稅 + GX-ETS', en: 'Carbon Tax + GX-ETS' },
    mechanismType: 'hybrid',
    currentRate: { value: 289, unit: 'JPY/tCO₂e (tax only)', year: 2025 },
    status: 'active',
    cbamRelevance: 'high',
    keyIndustries: ['steel', 'automotive', 'power', 'chemicals'],
  },
  th: {
    code: 'th',
    name: { zhTW: '泰國', en: 'Thailand' },
    flag: '🇹🇭',
    currency: 'THB',
    currencySymbol: '฿',
    mechanism: { zhTW: '碳稅（嵌入消費稅）', en: 'Carbon Tax (Excise-embedded)' },
    mechanismType: 'carbon_tax',
    currentRate: { value: 200, unit: 'THB/tCO₂e', year: 2025 },
    status: 'active',
    cbamRelevance: 'low',
    keyIndustries: ['power', 'petrochemicals', 'cement', 'steel'],
  },
  vn: {
    code: 'vn',
    name: { zhTW: '越南', en: 'Vietnam' },
    flag: '🇻🇳',
    currency: 'VND',
    currencySymbol: '₫',
    mechanism: { zhTW: 'ETS 試行中', en: 'ETS Pilot (No formal price yet)' },
    mechanismType: 'ets',
    currentRate: { value: 0, unit: 'VND/tCO₂e', year: 2025 },
    status: 'pilot',
    cbamRelevance: 'high', // CBAM 第三大亞洲出口國
    keyIndustries: ['steel', 'cement', 'power', 'fertilizer'],
  },
};
```

### `lib/data/exchange-rates.ts`
```typescript
// 預設匯率（對 USD），用戶可手動調整
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  TWD: 32.5,
  SGD: 1.34,
  KRW: 1380,
  JPY: 150,
  THB: 34.5,
  VND: 25400,
  EUR: 0.92,
};
```

---

## 開發階段

### Phase 1：核心架構 + 台灣 + 新加坡 + CBAM（Week 1-2）
1. 初始化 Next.js 專案 + Tailwind + shadcn/ui + next-intl
2. 建立 `DomesticCarbonPriceCalculator` 共用介面
3. 實作 `taiwan.ts` 計算引擎 + 單元測試（最複雜，先做確保介面設計正確）
4. 實作 `singapore.ts` 計算引擎 + 單元測試（最簡單，驗證介面通用性）
5. 實作 `cbam.ts` 通用引擎 + 單元測試
6. 實作 `dual-track.ts` 整合邏輯
7. 建立 Landing page（六國卡片）
8. 建立國別計算頁（動態表單）
9. 建立雙軌整合頁
10. 中英文雙語

### Phase 2：其餘四國 + 視覺化（Week 3-4）
1. 實作 `korea.ts`、`japan.ts`、`thailand.ts`、`vietnam.ts`
2. 情境分析圖表（Recharts 2025-2034 曲線）
3. 跨國比較頁面
4. 各國 CBAM 抵扣確定性等級標示
5. PDF 報告匯出
6. SEO + Open Graph

### Phase 3：打磨 + 部署（Week 5）
1. 響應式適配
2. 錯誤處理 + 邊界條件
3. 效能優化
4. 部署至 Vercel
5. RECCESSARY 品牌整合

---

## 測試案例

### 台灣
```
鋼鐵業，年排放 100,000 tCO₂e，高碳洩漏，優惠B，第一期
→ K=0, CL=0.2 → 收費排放量=20,000 → 碳費=20,000×100=NT$2,000,000
```

### 新加坡
```
煉油廠，年排放 500,000 tCO₂e，2026年
→ 碳稅=500,000×SGD45=SGD22,500,000
→ 無特殊減免
```

### 韓國
```
鋼鐵業，年排放 1,000,000 tCO₂e，免費配額 850,000
→ 需購配額=150,000×KRW9,145=KRW1,371,750,000
```

### 日本
```
鋼鐵業，年排放 200,000 tCO₂e
→ 碳稅=200,000×¥289=¥57,800,000
→ GX-ETS 額外成本待定（取決於配額分配與市場價格）
```

### 越南
```
鋼鐵業，年排放 80,000 tCO₂e，出口歐盟 5,000 噸鋼
→ 國內碳價=0（無正式碳價）
→ CBAM 成本=全額負擔（無法抵扣）
→ ⚠️ 突出顯示：越南出口商面臨最高 CBAM 淨成本
```

### CBAM 跨國比較
```
同一鋼鐵產品 5,000 噸出口歐盟（BF-BOF, 2.1 tCO₂e/噸）：
- 從韓國出口：CBAM 淨成本 = X（扣除 K-ETS 碳價）
- 從越南出口：CBAM 淨成本 = Y（無扣除）
- 差額 = Y-X（越南劣勢）
```

---

## 重要注意事項

1. **免責聲明**：每頁底部附「本工具提供估算參考，不構成法律或稅務建議。各國碳價與 CBAM 規則持續更新，請以主管機關公告為準。」
2. **資料來源**：各國計算結果旁標注法規來源（台灣環境部三子法、SG Carbon Pricing Act、K-ETS 第三期規則等）
3. **不確定性標示**：CBAM 抵扣確定性等級必須清楚標示（🟢🟡🔴⚫），避免用戶誤判
4. **匯率與碳價**：MVP 用預設值+手動調整，未來可串接即時 API
5. **越南特殊處理**：因無正式碳價，越南頁面的核心訊息是「你將全額負擔 CBAM」，並突出情境模擬功能
6. **品牌**：Header 預留 RECCESSARY logo 位，footer 附 "Powered by RECCESSARY" + 連結
7. **新增國家**：只需新增一個 `domestic/[country].ts` 檔案實作 `DomesticCarbonPriceCalculator` 介面，無需改動其他程式碼
