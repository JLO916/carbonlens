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
  title: "碳費試算與CBAM碳關稅計算器｜亞太六國碳成本分析 — CarbonLens",
  description: "免費線上碳成本分析工具。台灣碳費三種費率方案十年成本比較、歐盟CBAM碳關稅影響評估、亞太六國碳價競爭力比較。幫企業在決策前看清碳定價的長期影響。",
  keywords: [
    "碳費計算", "碳費試算", "CBAM計算器", "CBAM試算", "碳關稅計算", "碳成本計算", "台灣碳費", "碳費優惠費率", "歐盟碳邊境調整機制", "碳定價", "亞太碳價",
    "CBAM calculator", "carbon cost calculator", "carbon pricing calculator", "CBAM cost estimator", "carbon fee calculator Taiwan", "carbon tax calculator Singapore", "K-ETS calculator Korea", "APAC carbon pricing",
  ],
  openGraph: {
    title: "碳費試算與CBAM碳關稅計算器｜亞太六國碳成本分析 — CarbonLens",
    description: "免費線上碳成本分析工具。台灣碳費三種費率方案十年成本比較、歐盟CBAM碳關稅影響評估、亞太六國碳價競爭力比較。",
    type: "website",
    locale: "zh_TW",
    alternateLocale: "en_US",
    siteName: "CarbonLens",
    url: "https://carbonlens.app",
    images: [{ url: "https://carbonlens.app/og-image.png", width: 1200, height: 630, alt: "CarbonLens — Carbon Pricing & EU CBAM Calculator for Asia-Pacific Exporters" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CBAM & Carbon Pricing Calculator for Asia-Pacific Exporters — CarbonLens",
    description: "Free tool to calculate domestic carbon costs across 6 APAC countries and EU CBAM exposure, with cross-border deduction analysis.",
    images: ["https://carbonlens.app/og-image.png"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CarbonLens",
  alternateName: "碳成本透視鏡",
  description: "Free carbon cost analysis tool for Asia-Pacific businesses. Compare domestic carbon pricing across 6 countries and assess EU CBAM carbon border tax exposure.",
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
