# CarbonLens 產品修正規格書 v2（對應實際程式碼架構）
# 基於 https://github.com/JLO916/carbonlens 的 main branch

---

## 零、程式碼架構確認摘要

在修改前，Claude Code 必須理解以下架構事實：

### i18n 機制
- 使用自建 React Context（`lib/i18n/context.tsx`），**不是 next-intl**
- 翻譯方式：`t('中文', 'English')` 和 `tObj({zhTW: '中文', en: 'English'})`
- **沒有** `messages/zh-TW.json` 或 `en.json` 翻譯檔
- 所有文案都是內聯（inline）在元件程式碼中

### SEO 元素
- 全站 metadata 在 `app/layout.tsx` 的 `export const metadata`（Next.js Metadata API）
- 各頁面在各自的 `app/[country]/page.tsx` 中有 `export const metadata`
- JSON-LD 結構化資料已存在於 `app/layout.tsx`
- OG image 已存在 `public/og-image.png`
- **沒有** `next-sitemap`、沒有 hreflang、沒有 FAQ Schema

### 計算引擎（不修改）
- `lib/calculators/domestic/` — 六國計算引擎（taiwan.ts, singapore.ts, korea.ts, japan.ts, thailand.ts, vietnam.ts）
- `lib/calculators/cbam.ts` — CBAM 通用計算
- `lib/calculators/scenario.ts` — 情境模擬（含 CARBON_PRICE_PROJECTIONS 和 CBAM_EFFECTIVE_RATE）
- `lib/calculators/domestic/types.ts` — DomesticResult, DomesticInput 介面
- `lib/types.ts` — CBAMInput, CBAMResult, CountryConfig 等共用型別

### 前端元件（需修改）
- `app/landing-content.tsx` — 首頁所有內容（299 行）
- `components/calculator/ResultPanel.tsx` — 國內碳費結果面板（155 行）
- `components/calculator/CBAMForm.tsx` — CBAM 表單 + 結果顯示（273 行）
- `components/calculator/CrossDeductionPanel.tsx` — CBAM 抵扣確定性（116 行）
- `components/calculator/DomesticCarbonForm.tsx` — 國內碳費表單（236 行）
- `components/calculator/ScenarioChart.tsx` — 情境分析圖表（96 行）
- `components/calculator/CountrySelector.tsx` — 國家選擇卡片（50 行）

### 頁面檔案
- `app/page.tsx` — 首頁入口（引用 landing-content.tsx）
- `app/tw/page.tsx` + `app/tw/client.tsx` — 台灣頁
- `app/sg/page.tsx` + `app/sg/client.tsx` — 新加坡頁
- `app/kr/page.tsx`, `app/jp/page.tsx`, `app/th/page.tsx`, `app/vn/page.tsx` — 同上結構
- `app/cbam/page.tsx` — CBAM 頁
- `app/compare/page.tsx` + `app/compare/client.tsx` — 跨國比較頁
- `app/guide/page.tsx` + `app/guide/content.tsx` — 使用說明頁（564 行）
- `app/about/page.tsx` + `app/about/content.tsx` — 關於頁

---

## 一、措辭替換（精確對應到檔案和行號）

### 1.1 `app/landing-content.tsx`

**Hero 標題（第 29-31 行）：**
```
現在：'亞太六國碳費與歐盟 CBAM 雙軌試算器 — 30 秒算出合規成本'
改為：'亞太碳成本分析工具 — 30 秒掌握碳定價對你的生意影響'

現在：'Carbon pricing & EU CBAM calculator for Asia-Pacific exporters — get your numbers in 30 seconds'
改為：'Asia-Pacific Carbon Cost Analyzer — See how carbon pricing affects your business'
```

**Hero 副標（第 35-37 行）：**
```
現在：'你的產品出口歐盟，碳成本到底是多少？'
改為：'你的產品出口歐盟，碳成本曝險有多大？'

現在：'How much will carbon cost your exports to Europe?'
改為：'How much carbon cost exposure do your EU exports carry?'
```

**Hero 說明文字（第 42 行，同一長字串中兩處修改）：**
```
修改 1：'CarbonLens 是第一個專為亞太出口企業設計的碳成本計算器'
改為：'CarbonLens 是專為亞太出口企業設計的碳成本分析工具'

修改 2：'幫你在一個頁面完成國內碳價試算、CBAM 成本估算，以及兩者之間的交叉抵扣分析'
改為：'幫你在一個頁面評估國內碳價曝險、歐盟客戶面臨的 CBAM 成本、以及各國碳價可供抵扣的可能性'
```

**三功能區塊標題（第 90 行）：**
```
現在：'三件事，一次算清楚' / 'Three questions, one calculator'
改為：'三個問題，一次看清楚' / 'Three questions, one clear picture'
```

**功能卡片 1（第 96 行）：**
```
現在：'算你的國內碳成本' / 'What's your domestic carbon cost?'
改為：'你的國內碳成本曝險有多大？' / 'How big is your domestic carbon cost exposure?'
```

**功能卡片 2（第 107 行）：**
```
現在：'算你的 CBAM 碳關稅' / 'What's your CBAM exposure?'
改為：'你的歐盟客戶面臨多少 CBAM 成本？' / 'How much CBAM cost does your EU buyer face?'
```

**功能卡片 3（第 118 行）：**
```
現在：'算你能省多少' / 'How much can you deduct?'
改為：'各國碳價的 CBAM 抵扣可能性有多大？' / 'How likely is your carbon price to qualify for CBAM deduction?'
```

**功能卡片 3 內文（第 121-124 行）：**
```
現在包含：'你在國內繳的碳價，有多少可以折抵歐盟 CBAM？'
改為：'你在國內繳的碳價，有多少可以被歐盟認定為可供進口商抵扣 CBAM 的金額？'

現在包含：'This is what no other tool does: how much of your domestic carbon price can offset your EU CBAM obligation?'
改為：'How much of your domestic carbon price can your EU importer claim as a CBAM deduction? The answer varies dramatically by country — and the deduction benefits your buyer, not you directly.'
```

### 1.2 `components/calculator/ResultPanel.tsx`

**結果面板介紹文字（第 70-74 行）：**
```
現在：'以下為您依據輸入參數計算出的年度碳成本。此金額代表您的設施每年須繳納的碳費/碳稅/配額購買成本。'
改為：'以下為依據輸入參數估算的年度碳成本曝險。此金額為概略估算，供內部評估和初步規劃使用，實際碳費義務以主管機關核定為準。'

英文同步修改。
```

**結果大標題（第 76 行）：**
```
現在：'碳費總額' / 'Total Carbon Cost'
改為：'碳成本曝險' / 'Carbon Cost Exposure'
```

**CBAM 抵扣區塊（第 130-150 行）：**
```
現在（第 132 行）：'可用於 CBAM 抵扣金額' / 'Deductible for CBAM'
改為：'可供歐盟進口商申請 CBAM 抵扣的金額' / 'Amount your EU importer may claim for CBAM deduction'

現在（第 135-138 行）：'若您的產品出口至歐盟，已在國內繳納的碳費/碳稅可申請抵扣 CBAM 費用，避免重複計費。'
改為：'若您的產品出口至歐盟，已在國內繳納的碳費/碳稅可供歐盟進口商申請抵扣 CBAM 費用。此金額是否反映在採購價格上，取決於買賣雙方的商業條件。'

現在（第 148 行）：'CBAM 抵扣確定性因國家而異，詳見雙軌分析'
改為：'此抵扣可能性為分析判斷，非歐盟官方認定。實際認定以歐盟公告為準。'
```

### 1.3 `components/calculator/CrossDeductionPanel.tsx`

**標題（第 68 行）：**
```
現在：'CBAM 抵扣確定性' / 'CBAM Deduction Confidence'
改為：'CBAM 抵扣可能性評估' / 'CBAM Deduction Likelihood Assessment'
```

**表格標題（第 91 行）：**
```
現在：'各國 CBAM 抵扣確定性' / 'CBAM Deduction Confidence by Country'
改為：'各國碳價被歐盟認定為可抵扣的可能性' / 'Likelihood of EU Recognition for CBAM Deduction'
```

**表格說明文字（第 93-96 行），加入分析判斷聲明：**
```
現在的描述末尾加上：
'⚠️ 以下為基於現行法規的分析判斷，非歐盟官方認定。'
'⚠️ These assessments are analytical judgments based on current regulations, not official EU determinations.'
```

**越南 reason（第 42 行）：**
```
現在：'無正式碳價，無法抵扣 — 出口商面臨全額 CBAM 負擔'
改為：'無正式碳價，無法抵扣 — 歐盟進口商須全額負擔 CBAM 成本'

現在：'No formal carbon price — exporters face full CBAM cost exposure'
改為：'No formal carbon price — EU importers bear full CBAM cost with no deduction available'
```

### 1.4 `components/calculator/CBAMForm.tsx`

**結果標題（第 226 行）：**
```
現在：'CBAM 淨成本' / 'Net CBAM Cost'
改為：'歐盟進口商的 CBAM 淨成本' / 'EU Importer\'s Net CBAM Cost'
```

**原產國碳價抵扣標籤（第 239 行）：**
```
現在：'原產國碳價抵扣' / 'Domestic Deduction'
改為：'原產國碳價可抵扣金額' / 'Domestic Carbon Price Deductible'
```

**在結果區塊底部（第 264 行 `</div>` 之前）新增免責說明：**
```tsx
<div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mt-4">
  <p className="text-xs text-amber-800">
    {t(
      '提醒：CBAM 憑證的購買和繳交義務由歐盟進口商承擔。本工具估算的成本是進口商面臨的成本，對出口商的影響取決於買賣雙方的商業條件。各國碳價的 CBAM 抵扣資格以歐盟最終認定為準。',
      'Note: CBAM certificate purchase obligations are borne by EU importers. Costs shown represent the importer\'s liability. Impact on exporters depends on commercial terms between buyer and seller. CBAM deduction eligibility is subject to final EU determination.'
    )}
  </p>
</div>
```

---

## 二、新增元件

### 2.1 `components/calculator/DataVsDefaultPanel.tsx`（新建）

顯示「提供實際排放數據 vs 被套預設值」的 CBAM 成本差異。

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/data/exchange-rates';
import { useI18n } from '@/lib/i18n/context';
import { useCurrency } from '@/lib/currency/context';

interface Props {
  actualEmissions: number;       // tCO₂e per tonne product (user-provided)
  defaultEmissions: number;      // from CBAM defaults
  defaultMarkupPercent: number;  // 10%, 20%, or 30%
  importVolume: number;          // tonnes
  euEtsPrice: number;
  year: number;
}

export default function DataVsDefaultPanel({
  actualEmissions, defaultEmissions, defaultMarkupPercent,
  importVolume, euEtsPrice, year
}: Props) {
  const { t } = useI18n();
  const { formatConverted } = useCurrency();

  const defaultWithMarkup = defaultEmissions * (1 + defaultMarkupPercent / 100);
  const costWithActual = importVolume * actualEmissions * euEtsPrice;
  const costWithDefault = importVolume * defaultWithMarkup * euEtsPrice;
  const savings = costWithDefault - costWithActual;
  const savingsPercent = costWithDefault > 0 ? (savings / costWithDefault * 100) : 0;

  return (
    <Card className="border-2 border-orange-200">
      <CardHeader className="bg-orange-50">
        <CardTitle className="text-lg">
          {t('有數據 vs 沒數據：你的歐盟客戶成本差多少？', 'Actual Data vs Defaults: How much can your EU buyer save?')}
        </CardTitle>
        <p className="text-xs text-gray-500 mt-1">
          {t(
            `${year} 年預設值加成 ${defaultMarkupPercent}%。提供實際排放數據可降低歐盟進口商的 CBAM 成本。`,
            `${year} default markup: ${defaultMarkupPercent}%. Providing actual emissions data reduces your EU importer's CBAM cost.`
          )}
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-green-700 mb-1">{t('提供實際數據', 'With Actual Data')}</p>
            <p className="text-xs text-gray-500">{actualEmissions.toFixed(2)} tCO₂e/t</p>
            <p className="text-2xl font-bold text-green-800">€{formatCurrency(costWithActual)}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-700 mb-1">{t('用預設值申報', 'With Default Values')}</p>
            <p className="text-xs text-gray-500">{defaultWithMarkup.toFixed(2)} tCO₂e/t (+{defaultMarkupPercent}%)</p>
            <p className="text-2xl font-bold text-red-800">€{formatCurrency(costWithDefault)}</p>
          </div>
        </div>
        <div className="text-center p-3 bg-orange-100 rounded-lg">
          <p className="text-sm font-semibold text-orange-900">
            {t('差額', 'Difference')}: €{formatCurrency(savings)} ({savingsPercent.toFixed(0)}%)
          </p>
          <p className="text-xs text-orange-700 mt-1">
            {t(
              '→ 這個差額代表你建立碳排放數據管理能力後，能幫歐盟客戶省下的 CBAM 成本',
              '→ This gap represents how much CBAM cost your EU buyer saves when you provide actual emissions data'
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

**整合位置**：在 `CBAMForm.tsx` 的結果區塊中（第 204 行 `{result && (` 之後），當 `result` 存在且使用者有填入 `specificEmissions` 時，渲染此元件。

### 2.2 `components/calculator/RecommendationsPanel.tsx`（新建）

情境化行動建議模組，根據計算結果自動觸發建議。

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DomesticResult } from '@/lib/calculators/domestic/types';
import { CBAMResult, CountryCode } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';

interface Props {
  countryCode: CountryCode;
  domesticResult?: DomesticResult;
  cbamResult?: CBAMResult;
  dataVsDefaultSavings?: number; // EUR
}

export default function RecommendationsPanel({ countryCode, domesticResult, cbamResult, dataVsDefaultSavings }: Props) {
  const { t } = useI18n();
  const recommendations: { icon: string; text: string }[] = [];

  // 越南特殊提醒
  if (countryCode === 'vn') {
    recommendations.push({
      icon: '⚠️',
      text: t(
        '越南目前無正式碳定價機制，歐盟進口商無法申請任何碳價抵扣。建議關注越南 ETS 試行進度，並提前建立 ISO 14064 碳盤查能力。',
        'Vietnam has no formal carbon pricing. EU importers cannot claim any carbon price deduction. Monitor Vietnam ETS pilot progress and consider building ISO 14064 inventory capability.'
      ),
    });
  }

  // 數據 vs 預設值建議
  if (dataVsDefaultSavings && dataVsDefaultSavings > 50000) {
    recommendations.push({
      icon: '💡',
      text: t(
        `提供實際排放數據可幫歐盟客戶減少約 €${Math.round(dataVsDefaultSavings).toLocaleString()} 的 CBAM 成本。建議優先建立產品碳排放數據管理能力。`,
        `Providing actual emissions data could reduce your EU buyer's CBAM cost by ~€${Math.round(dataVsDefaultSavings).toLocaleString()}. Consider prioritizing product carbon data management.`
      ),
    });
  }

  // CBAM 義務主體提醒（所有有 CBAM 結果的情境）
  if (cbamResult) {
    recommendations.push({
      icon: '📋',
      text: t(
        '提醒：CBAM 憑證的購買義務由歐盟進口商承擔。本工具估算的 CBAM 成本是進口商面臨的成本，對出口商的影響取決於買賣雙方的商業條件和議價結果。',
        'Reminder: CBAM certificate obligations are borne by EU importers. CBAM costs shown reflect the importer\'s liability. The impact on exporters depends on commercial terms and negotiation outcomes.'
      ),
    });
  }

  if (recommendations.length === 0) return null;

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{t('這些數字對你意味著什麼', 'What these numbers mean for you')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, i) => (
          <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-lg text-sm">
            <span>{rec.icon}</span>
            <p className="text-gray-700">{rec.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

**整合位置**：在各國 client.tsx 的結果顯示區塊底部，以及 CBAMForm.tsx 的結果區塊底部。

---

## 三、SEO 元素修正（精確到檔案）

### 3.1 `app/layout.tsx` 全站 metadata 修正

**第 20-21 行 title + description：**
```typescript
// 現在
title: "碳費與CBAM試算器 | 亞太六國碳成本計算工具 — CarbonLens",
description: "免費計算台灣碳費、新加坡碳稅、韓國K-ETS、日本GX-ETS的實際成本，同步試算歐盟CBAM碳關稅義務與交叉抵扣金額。涵蓋亞太六國，支援情境模擬與跨國比較。",

// 改為
title: "碳費試算與CBAM碳關稅計算器｜亞太六國碳成本分析 — CarbonLens",
description: "免費線上碳成本分析工具。台灣碳費三種費率方案十年成本比較、歐盟CBAM碳關稅影響評估、亞太六國碳價競爭力比較。幫企業在決策前看清碳定價的長期影響。",
```

**第 27-28 行 OG title + description 同步修改。**

**第 46-50 行 JSON-LD description：**
```typescript
// 改為
description: "Free carbon cost analysis tool for Asia-Pacific businesses. Compare domestic carbon pricing across 6 countries and assess EU CBAM carbon border tax exposure.",
```

### 3.2 各頁面 `page.tsx` metadata 修正

**`app/tw/page.tsx`（第 5-8 行）：**
```typescript
export const metadata = {
  title: '台灣碳費試算器｜一般費率vs優惠費率比較、高碳洩漏CL係數模擬 — CarbonLens',
  description: '台灣碳費免費試算工具。比較一般費率NT$300、優惠B NT$100、優惠A NT$50三種方案的十年累計成本。支援高碳洩漏風險CL係數三期模擬、碳費門檻敏感度分析。',
};
```

**`app/cbam/page.tsx`（第 5-8 行）：**
```typescript
export const metadata = {
  title: 'CBAM碳關稅計算器｜歐盟碳邊境調整機制成本評估 — CarbonLens',
  description: '免費CBAM成本評估工具。從亞洲出口企業角度評估歐盟進口商面臨的碳關稅成本，比較實際排放數據vs預設值的成本差異，以及各國碳價CBAM抵扣可能性。',
};
```

**`app/compare/page.tsx`（第 5-8 行）：**
```typescript
export const metadata = {
  title: '碳成本跨國比較｜台灣vs韓國vs越南出口歐盟CBAM成本差異 — CarbonLens',
  description: '比較同一產品從台灣、新加坡、韓國、日本、泰國、越南出口歐盟的CBAM碳關稅成本差異。了解各國碳價抵扣能力對出口競爭力的影響。',
};
```

**`app/sg/page.tsx`、`app/kr/page.tsx`、`app/jp/page.tsx`、`app/th/page.tsx`、`app/vn/page.tsx`：**
每個都補齊 description（目前 kr/jp/th/vn 只有 title 沒有 description）。參照 PRODUCT_POSITIONING_SEO.md 規格書中各國的 meta description。

### 3.3 新增 SEO 技術元素

**安裝 next-sitemap：**
```bash
npm install next-sitemap
```

**新增 `next-sitemap.config.js`（專案根目錄）：**
```javascript
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://carbonlens-blond.vercel.app',
  generateRobotsTxt: true,
  changefreq: 'monthly',
  priority: 0.7,
  additionalPaths: async () => [
    { loc: '/tw', priority: 0.9 },
    { loc: '/cbam', priority: 0.8 },
    { loc: '/compare', priority: 0.8 },
  ],
};
```

**在 `package.json` scripts 中加入：**
```json
"postbuild": "next-sitemap"
```

**在 `app/guide/page.tsx` 加入 FAQ Schema（JSON-LD）：**
在 page.tsx 的 metadata 下方新增 FAQ 結構化資料，內容涵蓋 6-8 個常見問題（參照 PRODUCT_POSITIONING_SEO.md 的 FAQ 區塊）。

---

## 四、首頁內容區塊修正

### 4.1 `app/landing-content.tsx` — 情境案例卡片修正

**Hero 說明文字（第 42 行）：**
```
現在包含：'CarbonLens 是第一個專為亞太出口企業設計的碳成本計算器'
改為：'CarbonLens 是專為亞太出口企業設計的碳成本分析工具'（刪除「第一個」）
```

**卡片 3（越南，約第 180-200 行）：**
```
現在包含：'越南沒有碳價——出口歐盟的隱形代價'
和：'出口商無法折抵任何 CBAM 費用——同一批鋼鐵，從越南出口就是全額負擔'
改為：'越南沒有碳價——歐盟客戶的額外負擔'
和：'歐盟進口商無法申請任何碳價抵扣——同一批鋼鐵，從越南進口的 CBAM 成本比從韓國進口高出 XX%'
```

**「亞太碳定價的資訊斷層」區塊（第 274 行）：**
```
現在：'CBAM 計算器清一色為歐盟進口商設計'
改為：'CBAM 計算器大多從歐盟進口商角度設計'（刪除「清一色」）

現在：'這些問題沒有任何公開工具能回答'
改為：'據我們所知，缺乏從亞洲出口企業角度整合這些分析的公開工具'
```

**「免費工具」段落（第 283 行）：**
```
現在：'都應該能在 30 秒內知道碳定價對營運意味著什麼 — 而不是花幾十萬請顧問才能得到一個數字'
改為：'都應該能在 30 秒內掌握碳定價的影響量級 — 作為進一步評估和規劃的起點'
（刪除顧問報價對標，避免得罪潛在合作對象）
```

**CrossDeductionPanel 表格描述（第 94-95 行）額外修正：**
```
現在：'出口商須全額負擔 CBAM 成本' / 'exporters bear the full CBAM cost'
改為：'歐盟進口商須全額負擔 CBAM 成本，無碳價可供抵扣' / 'EU importers bear full CBAM cost with no carbon price deduction available'
```

---

## 五、執行順序（給 Claude Code）

```
讀取這份 PRODUCT_CORRECTION_V2.md。這是一份精確對應到現有程式碼架構的修正規格書。

核心原則：
- lib/calculators/ 底下所有檔案完全不動
- lib/types.ts 完全不動
- lib/data/ 底下所有檔案完全不動
- i18n 使用 t('中文', 'English') 內聯寫法，不要建立 JSON 翻譯檔

Phase 1（措辭替換）：
1. 按照「一、措辭替換」中列出的精確位置，逐一修改 landing-content.tsx、ResultPanel.tsx、CBAMForm.tsx、CrossDeductionPanel.tsx 的文案
2. 修改完後 npm run build 確認無編譯錯誤

Phase 2（SEO 修正）：
1. 修改 app/layout.tsx 的全站 metadata 和 JSON-LD
2. 修改所有 page.tsx 的 export const metadata
3. 安裝 next-sitemap 並設定 config
4. 在 guide/page.tsx 加入 FAQ Schema
5. 修改完後 npm run build 確認無編譯錯誤

Phase 3（新增元件）：
1. 建立 components/calculator/DataVsDefaultPanel.tsx
2. 建立 components/calculator/RecommendationsPanel.tsx
3. 在 CBAMForm.tsx 結果區塊中整合 DataVsDefaultPanel
4. 在 CBAMForm.tsx 結果區塊底部整合 RecommendationsPanel
5. 在各國 client.tsx 的結果區塊底部整合 RecommendationsPanel
6. 修改完後 npm run build 確認無編譯錯誤

Phase 4（驗證）：
1. npm run build 全站無錯
2. npm run dev 啟動開發伺服器
3. 逐頁確認措辭替換正確
4. 確認新元件渲染正常
5. 確認 SEO meta tags 正確（用瀏覽器 View Source 檢查）
6. 跑既有測試 npx jest 確認計算引擎未被影響
```

---

## 六、自我檢驗清單

修正完成後，逐項確認：

- [ ] 全站不再出現「你要繳多少 CBAM」的表述
- [ ] 全站不再出現「你能省多少」的表述
- [ ] 全站不再出現「第一個」「唯一」等絕對宣稱
- [ ] 全站不再出現暗示出口商直接繳 CBAM 的措辭
- [ ] 越南頁面不再說「出口商全額負擔」而是說「進口商全額負擔」
- [ ] CrossDeductionPanel 有「分析判斷，非歐盟官方認定」聲明
- [ ] CBAMForm 結果區塊有義務主體（進口商）免責說明
- [ ] DataVsDefaultPanel 在 CBAM 結果中正確顯示
- [ ] RecommendationsPanel 在有結果時正確顯示
- [ ] 所有 page.tsx 都有完整的 title + description
- [ ] layout.tsx 的 JSON-LD 已更新
- [ ] next-sitemap 設定完成且 build 時生成 sitemap.xml
- [ ] npx jest 所有既有測試通過（計算引擎未被影響）
- [ ] npm run build 零錯誤
