import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutContent from './content';

export const metadata = {
  title: '關於 Carbon Lens 碳排鏡菱｜企業碳管理工作台:碳盤查・碳費・CBAM・IFRS 揭露',
  description: 'Carbon Lens 碳排鏡菱是免費、免註冊的企業碳管理工作台,整合 Scope 1/2/3 溫室氣體盤查(含製程含氟氣體、減排設備 DRE、不確定性與數據品質彙總)、台灣與亞太六國碳費/碳稅、歐盟 CBAM 與原產國碳價交叉抵扣、IFRS S1/S2 永續揭露、SBTi 多重減量目標、RE100、每料號產品碳足跡與客戶問卷回覆,每筆數字標一手法源、資料只存本機。',
  keywords: ['碳排鏡菱', 'Carbon Lens', '企業碳管理', '碳盤查', '溫室氣體盤查', 'Scope 1 2 3', '台灣碳費試算', 'CBAM', '歐盟碳關稅', '碳邊境調整機制', '碳費抵扣 CBAM', 'IFRS S2 永續揭露', 'SBTi', 'RE100', '產品碳足跡', '每料號 PCF', '製程含氟氣體', 'NF3 CF4 SF6', '半導體碳盤查', '減排設備去除率 DRE', '盤查不確定性', '客戶碳問卷 CDP', '亞太碳定價'],
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
  description: '企業碳管理工作台:整合溫室氣體盤查(Scope 1/2/3,含製程含氟氣體、減排設備 DRE、不確定性與數據品質彙總)、亞太六國國內碳費/碳稅、歐盟 CBAM 與原產國碳價交叉抵扣、IFRS S1/S2 永續揭露、SBTi 多重減量目標、市場基礎 Scope 2/RE100、每料號產品碳足跡、客戶問卷回覆與報告匯出。',
  url: 'https://carbonlens.app/',
  inLanguage: ['zh-TW', 'en'],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  featureList: [
    '溫室氣體盤查 Scope 1/2/3',
    '製程含氟氣體 NF₃/CF₄/SF₆ 與減排設備去除率 DRE',
    '盤查不確定性與數據品質彙總(查證就緒度)',
    '台灣與亞太六國國內碳費/碳稅試算',
    'EU CBAM 碳邊境調整暴露評估與原產國碳價交叉抵扣',
    'IFRS S1/S2 永續與氣候揭露階段',
    'SBTi 多重減量目標(近期 Scope 1+2 / Scope 3 / 淨零)',
    '市場基礎 Scope 2 與 RE100(達標綠電反推)',
    '每料號產品碳足跡 PCF 與一頁聲明',
    '客戶問卷回覆(CDP/品牌/SBTi)',
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
    { '@type': 'Question', name: '我在台灣繳的碳費,能從 CBAM 扣掉嗎?', acceptedAnswer: { '@type': 'Answer', text: '可部分抵扣。依 Reg (EU) 2023/956 §9,原產國已付碳價可從 CBAM 義務抵扣;受益者是歐盟進口商,你需提供已付證明。歐盟對各國認定程度不同(新加坡/韓國高、台灣/日本中、泰國低、越南無),工具會標示信心等級。' } },
    { '@type': 'Question', name: '半導體、面板的製程含氟氣體(NF₃/CF₄)能算嗎?', acceptedAnswer: { '@type': 'Answer', text: '可以。盤查內建 NF₃、CF₄、C₂F₆、C₃F₈、CHF₃、c-C₄F₈、SF₆,係數採 IPCC AR5 GWP;若裝有洗滌/燃燒設備,可填減排設備去除率 DRE,申報排放=用量×係數×(1−DRE),符合 IPCC Tier 2b。' } },
    { '@type': 'Question', name: '客戶要我填 CDP 問卷或提供產品碳足跡,工具能幫嗎?', acceptedAnswer: { '@type': 'Answer', text: '能。「客戶問卷回覆」把你算好的盤查、目標、查證狀態對映成 CDP 供應鏈、品牌 ESG 問卷與 SBTi 供應商欄位,逐欄標可回覆/部分/待補並列缺口;「每料號產品碳足跡」把組織足跡依數量/質量/營收分攤到各料號並匯出一頁聲明。' } },
    { '@type': 'Question', name: '適合哪些公司使用?', acceptedAnswer: { '@type': 'Answer', text: '出口歐盟、面對品牌客戶碳要求、或須依 IFRS 編製永續資訊的台灣與亞太製造業,尤其在越南、泰國等地設有海外廠的集團;以及被大廠/品牌要求填碳問卷、提供產品碳足跡的中小供應商。' } },
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
