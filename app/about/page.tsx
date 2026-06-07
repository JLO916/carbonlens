import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutContent from './content';

export const metadata = {
  title: '關於 Carbon Lens 碳排鏡菱｜企業碳管理工作台:碳盤查・碳費・CBAM・IFRS 揭露',
  description: 'Carbon Lens 碳排鏡菱是免費、免註冊的企業碳管理工作台,整合 Scope 1/2/3 溫室氣體盤查、台灣與亞太六國國內碳費/碳稅試算、歐盟 CBAM 碳邊境調整、IFRS S1/S2 永續揭露、SBTi 減量目標與 RE100 市場基礎 Scope 2,每筆數字標一手法源、資料只存本機。',
  keywords: ['碳排鏡菱', 'Carbon Lens', '企業碳管理', '碳盤查', '溫室氣體盤查', 'Scope 1 2 3', '台灣碳費試算', 'CBAM', '歐盟碳關稅', '碳邊境調整機制', 'IFRS S2 永續揭露', 'SBTi', 'RE100', '產品碳足跡', '亞太碳定價'],
  alternates: { canonical: 'https://carbonlens.app/about' },
  openGraph: {
    title: '關於 Carbon Lens 碳排鏡菱｜企業碳管理工作台',
    description: '免費、免註冊的企業碳管理工作台:碳盤查、碳費、CBAM、IFRS 揭露、SBTi 目標,一條從盤查到揭露的可查證流程。',
    url: 'https://carbonlens.app/about',
    siteName: 'Carbon Lens 碳排鏡菱',
    type: 'website',
  },
};

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Carbon Lens 碳排鏡菱',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: '企業碳管理工作台:整合溫室氣體盤查(Scope 1/2/3)、亞太六國國內碳費/碳稅、歐盟 CBAM、IFRS S1/S2 永續揭露、SBTi 減量目標、市場基礎 Scope 2/RE100 與報告匯出。',
  url: 'https://carbonlens.app/',
  inLanguage: ['zh-TW', 'en'],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    '溫室氣體盤查 Scope 1/2/3',
    '台灣與亞太六國國內碳費/碳稅試算',
    'EU CBAM 碳邊境調整暴露評估',
    'IFRS S1/S2 永續與氣候揭露階段',
    'SBTi 減量目標軌跡',
    '市場基礎 Scope 2 與 RE100',
    '產品碳足跡 PCF',
    '盤查清冊/報告段落/CBAM 範本匯出',
  ],
  creator: { '@type': 'Person', name: 'Jimmy Lo', url: 'https://www.linkedin.com/in/jimmylo1979/' },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Carbon Lens 碳排鏡菱是免費的嗎?需要註冊嗎?', acceptedAnswer: { '@type': 'Answer', text: '完全免費、免註冊。公司側寫、盤查、快照與凍結版本都只存在你的瀏覽器(localStorage),不會上傳到任何伺服器。' } },
    { '@type': 'Question', name: '支援哪些國家的碳定價?', acceptedAnswer: { '@type': 'Answer', text: '台灣碳費、新加坡碳稅、韓國 K-ETS、日本碳稅+GX-ETS、泰國碳稅、越南 ETS 試行,共亞太六國,並涵蓋歐盟 CBAM 碳關稅。' } },
    { '@type': 'Question', name: '盤查的排放係數從哪裡來?可靠嗎?', acceptedAnswer: { '@type': 'Answer', text: '電力採能源署電力排碳係數、燃料採環境部排放係數管理表、GWP 採 IPCC AR5、各國電網係數採各國主管機關公布值;每筆數字標一手法源,並可逐行覆寫為你的查證值。' } },
    { '@type': 'Question', name: 'CBAM 碳關稅是亞洲出口商要繳嗎?', acceptedAnswer: { '@type': 'Answer', text: 'CBAM 憑證購買義務由歐盟進口商承擔,不是亞洲出口商;成品電子、紡織不在 CBAM 清單上,清單僅鋼鐵、鋁、水泥、肥料、氫、電力。' } },
    { '@type': 'Question', name: '適合哪些公司使用?', acceptedAnswer: { '@type': 'Answer', text: '出口歐盟、面對品牌客戶碳要求、或須依 IFRS 編製永續資訊的台灣與亞太製造業,尤其在越南、泰國等地設有海外廠的集團。' } },
  ],
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <main className="flex-1 bg-gray-50">
        <AboutContent />
      </main>
      <Footer />
    </>
  );
}
