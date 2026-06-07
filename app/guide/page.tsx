import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GuideContent from './content';

export const metadata = {
  title: '使用指南｜Carbon Lens 碳排鏡菱 企業碳管理工作台',
  description: 'Carbon Lens 碳排鏡菱使用指南:從盤查、設定目標、減量、查證、申報到揭露的完整七步碳管理週期,含 Scope 1/2/3 盤查、各國電網係數、市場基礎 Scope 2/RE100、SBTi 目標,並附一件 AI 伺服器組裝代工廠的實例操作導覽。',
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Carbon Lens 碳排鏡菱是什麼？",
      acceptedAnswer: { "@type": "Answer", text: "一套企業碳管理工作台。填一份公司側寫,即可一次算出國內碳費、CBAM 暴露、IFRS 揭露階段與供應鏈壓力,並串成從盤查、目標、減量、查證、申報到揭露、再年對年閉環的完整七步週期。資料只存在你的瀏覽器、免註冊。" },
    },
    {
      "@type": "Question",
      name: "我的資料會被上傳嗎？",
      acceptedAnswer: { "@type": "Answer", text: "不會。側寫、快照、凍結版本都只存在你的瀏覽器(localStorage),不經伺服器、免註冊。換電腦請用「匯出側寫 JSON」搬移。" },
    },
    {
      "@type": "Question",
      name: "海外廠的用電碳排怎麼算才對？",
      acceptedAnswer: { "@type": "Answer", text: "工具依廠區國別自動套該國電網係數(如越南 0.6592、泰國 0.475、新加坡 0.402、台灣 0.474),不會誤用台灣值。係數逐年公布、可逐行覆寫為你查證的最新值。" },
    },
    {
      "@type": "Question",
      name: "為什麼碳費很低、工具卻說碳風險很大？",
      acceptedAnswer: { "@type": "Answer", text: "因為代工/組裝業的碳幾乎都在 Scope 3(採購零件、售出產品使用),不在你自己繳碳費的 Scope 1+2。工具用總足跡、Scope 3 占比與每單位 PCF 把這塊攤開。" },
    },
    {
      "@type": "Question",
      name: "地點基礎與市場基礎 Scope 2 有什麼差？",
      acceptedAnswer: { "@type": "Answer", text: "地點基礎用當地電網平均;市場基礎把你買的綠電/PPA/REC 算進去(RE100 看的是市場基礎)。填綠電佔比即可同時得到兩個數。" },
    },
    {
      "@type": "Question",
      name: "CBAM 是我要繳嗎？成品伺服器要報嗎？",
      acceptedAnswer: { "@type": "Answer", text: "CBAM 憑證由歐盟進口商購買,不是亞洲出口商。且成品電子/伺服器不在 CBAM 清單上(清單僅鋼/鋁/水泥/肥料/氫/電力),只有出口這些清單貨品時才申報。" },
    },
    {
      "@type": "Question",
      name: "SBTi 的 4.2% 是怎麼來的？",
      acceptedAnswer: { "@type": "Answer", text: "SBTi 1.5°C 近期目標準則要求約每年線性絕對減 4.2%。工具把你的隱含年減(目標% ÷ 年數)和它比對,標示是否對齊。" },
    },
  ],
};

export default function GuidePage() {
  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="flex-1 bg-gray-50">
        <GuideContent />
      </main>
      <Footer />
    </>
  );
}
