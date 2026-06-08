import type { Metadata } from "next";
import { Inter, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { CurrencyProvider } from "@/lib/currency/context";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "企業碳管理工作台｜碳盤查・碳費・CBAM・IFRS 揭露・SBTi 目標 — Carbon Lens 碳排鏡菱",
  description: "免費、免註冊的企業碳管理工作台。一份側寫完成 Scope 1/2/3 盤查(含製程含氟氣體、減排設備 DRE、不確定性彙總)、台灣與亞太六國碳費/碳稅、歐盟 CBAM 與原產國碳價交叉抵扣、IFRS S1/S2 揭露、SBTi 多重目標、RE100、每料號產品碳足跡與客戶問卷回覆——每筆數字標一手法源、資料只存本機。",
  keywords: [
    "企業碳管理", "碳盤查", "溫室氣體盤查", "Scope 1 2 3", "碳費計算", "碳費試算", "台灣碳費", "CBAM計算器", "CBAM試算", "碳關稅計算", "碳費抵扣 CBAM", "歐盟碳邊境調整機制",
    "IFRS S2 永續揭露", "SBTi 減量目標", "RE100", "市場基礎 Scope 2", "產品碳足跡", "每料號 PCF", "製程含氟氣體", "NF3 CF4 SF6", "半導體碳盤查", "減排設備去除率 DRE", "盤查不確定性", "客戶碳問卷 CDP", "亞太碳價",
    "corporate carbon management", "GHG inventory Scope 1 2 3", "CBAM calculator", "carbon fee calculator Taiwan", "IFRS S2 disclosure", "SBTi targets", "product carbon footprint", "semiconductor F-gases", "APAC carbon pricing",
  ],
  openGraph: {
    title: "企業碳管理工作台｜碳盤查・碳費・CBAM・IFRS 揭露 — Carbon Lens 碳排鏡菱",
    description: "免費、免註冊的企業碳管理工作台:一份側寫走完 Scope 1/2/3 盤查、碳費、CBAM 交叉抵扣、IFRS 揭露、SBTi 多重目標、每料號 PCF 與客戶問卷,一條從盤查到揭露的可查證流程。",
    type: "website",
    locale: "zh_TW",
    alternateLocale: "en_US",
    siteName: "Carbon Lens 碳排鏡菱",
    url: "https://carbonlens.app",
    images: [{ url: "https://carbonlens.app/og-image.png", width: 1200, height: 630, alt: "Carbon Lens 碳排鏡菱 — corporate carbon-management workbench for Taiwan & APAC manufacturers" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate carbon-management workbench — Carbon Lens 碳排鏡菱",
    description: "Free workbench: Scope 1/2/3 inventory (incl. semiconductor F-gases), APAC carbon fees, EU CBAM with cross-deduction, IFRS disclosure, SBTi targets, per-SKU PCF and customer-questionnaire answers.",
    images: ["https://carbonlens.app/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Carbon Lens 碳排鏡菱",
  alternateName: "企業碳管理工作台",
  description: "Free corporate carbon-management workbench: Scope 1/2/3 GHG inventory (incl. semiconductor F-gases, abatement DRE, uncertainty rollup), APAC domestic carbon fees, EU CBAM with origin carbon-price cross-deduction, IFRS S1/S2 disclosure, multiple SBTi targets, RE100, per-SKU product footprints and customer-questionnaire answers.",
  url: "https://carbonlens.app",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "Jimmy Lo", url: "https://www.linkedin.com/in/jimmylo1979/" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={`${inter.variable} ${notoSansTC.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider><CurrencyProvider>{children}</CurrencyProvider></I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
