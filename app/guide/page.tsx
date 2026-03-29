import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GuideContent from './content';

export const metadata = {
  title: '碳費與CBAM計算方法說明｜CarbonLens 使用指南',
  description: 'CarbonLens使用指南。了解台灣碳費公式、CBAM計算方法、各國碳價資料來源，以及常見問題解答。',
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "台灣碳費怎麼算？",
      acceptedAnswer: { "@type": "Answer", text: "碳費 = 收費排放量 × 徵收費率。收費排放量 = (年排放量 - K值) × CL係數。高碳洩漏風險產業K值為0但享CL係數折減，非高碳洩漏產業K值為25,000噸。" },
    },
    {
      "@type": "Question",
      name: "碳費一般費率和優惠費率差多少？",
      acceptedAnswer: { "@type": "Answer", text: "一般費率NT$300/tCO₂e、優惠B NT$100（技術標竿）、優惠A NT$50（SBTi路徑）。同一排放量下，一般費率的碳費是優惠A的6倍。" },
    },
    {
      "@type": "Question",
      name: "什麼是高碳洩漏風險？CL係數怎麼用？",
      acceptedAnswer: { "@type": "Answer", text: "高碳洩漏風險指企業可能因碳成本過高而將生產外移。台灣對這類產業取消K值免徵額但給予CL係數折減：第一期0.2（只收20%）、第二期0.4、第三期0.6。" },
    },
    {
      "@type": "Question",
      name: "CBAM是誰要繳的？出口商還是進口商？",
      acceptedAnswer: { "@type": "Answer", text: "CBAM憑證的購買義務由歐盟進口商承擔，不是亞洲出口商。但進口商的CBAM成本可能透過商業談判影響採購價格。" },
    },
    {
      "@type": "Question",
      name: "國內繳的碳費可以抵扣CBAM嗎？",
      acceptedAnswer: { "@type": "Answer", text: "可以，但需歐盟認定該國碳價符合CBAM抵扣條件。新加坡和韓國高度可能被認定，台灣和日本部分待協商，越南因無正式碳價無法抵扣。抵扣受益者是歐盟進口商。" },
    },
    {
      "@type": "Question",
      name: "什麼是CBAM預設值？為什麼用預設值比較貴？",
      acceptedAnswer: { "@type": "Answer", text: "若進口商無法取得供應商實際排放數據，須使用歐盟預設值申報。預設值以歐盟境內排放最高10%生產商的平均值為基礎，且逐年加成（2026年+10%、2027年+20%、2028年起+30%）。" },
    },
    {
      "@type": "Question",
      name: "碳費2030年會漲到多少？",
      acceptedAnswer: { "@type": "Answer", text: "台灣碳費預計從NT$300逐步調升至NT$1,200-1,800/tCO₂e。加上CL係數從0.2升至0.6，高碳排企業的碳費可能在2030年達到2025年水準的12倍。" },
    },
    {
      "@type": "Question",
      name: "CBAM什麼時候開始收錢？",
      acceptedAnswer: { "@type": "Answer", text: "CBAM正式期自2026年1月開始，但憑證購買自2027年2月才啟動。進口商須在次年9月30日前完成申報和繳交憑證。2026年的憑證價格按季度平均EU ETS拍賣價計算。" },
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
