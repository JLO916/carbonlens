// 個人／企業雙池分流 (Brief §4, §7.3). Signals: capital tier, self-filled role,
// company email domain. Final CTA shows BOTH pools, with the recommended one emphasized.

import type {
  LeadPool,
  LeadRoutingResult,
  RoutingInput,
  BilingualText,
} from '@/lib/diagnose/types';

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.com.tw', 'hotmail.com',
  'outlook.com', 'icloud.com', 'me.com', 'live.com', 'msn.com',
  'qq.com', '163.com', '126.com', 'pchome.com.tw', 'hinet.net', 'proton.me',
]);

export const LEAD_ROLES: { value: string; label: BilingualText; pool: LeadPool }[] = [
  { value: 'sustainability_lead', label: { zhTW: '永續／ESG 主管', en: 'Sustainability/ESG lead' }, pool: 'enterprise' },
  { value: 'executive', label: { zhTW: '高階主管／決策者', en: 'Executive / decision-maker' }, pool: 'enterprise' },
  { value: 'finance_ir', label: { zhTW: '財務／投資人關係', en: 'Finance / IR' }, pool: 'enterprise' },
  { value: 'consultant', label: { zhTW: '顧問／服務商', en: 'Consultant / service provider' }, pool: 'individual' },
  { value: 'professional', label: { zhTW: '個人專業者', en: 'Individual professional' }, pool: 'individual' },
  { value: 'student_other', label: { zhTW: '學生／其他', en: 'Student / other' }, pool: 'individual' },
];

export function emailDomain(email: string): string | null {
  const m = email.trim().toLowerCase().match(/@([^@\s]+)$/);
  return m ? m[1] : null;
}

export function classifyLead(args: RoutingInput): LeadRoutingResult {
  const signals: BilingualText[] = [];
  let enterprise = 0;
  let individual = 0;

  // 資本額級距（上市櫃模組）
  if (args.capitalTier === 'over100' || args.capitalTier === 'from50to100') {
    enterprise += 1;
    signals.push({ zhTW: '資本額級距偏大', en: 'Larger capital tier' });
  } else if (args.capitalTier === 'under50') {
    enterprise += 0.5; // still a listed entity
  }

  // 員工規模（供應鏈模組）
  if (args.employeeBand === 'over1000') {
    enterprise += 1;
    signals.push({ zhTW: '員工規模 ≥1,000', en: '≥1,000 employees' });
  } else if (args.employeeBand === 'from250to999') {
    enterprise += 0.5;
  }

  // 供應出口供應鏈
  if (args.exportSupplyChain) {
    enterprise += 0.5;
    signals.push({ zhTW: '供應出口供應鏈', en: 'Supplies an export supply chain' });
  }

  // 出口歐盟（CBAM 模組）
  if (args.euExporter) {
    enterprise += 0.5;
    signals.push({ zhTW: '出口歐盟', en: 'Exports to the EU' });
  }

  // 角色（自填）
  const role = LEAD_ROLES.find((r) => r.value === args.role);
  if (role?.pool === 'enterprise') {
    enterprise += 1.5;
    signals.push({ zhTW: `角色：${role.label.zhTW}`, en: `Role: ${role.label.en}` });
  } else if (role?.pool === 'individual') {
    individual += 1.5;
    signals.push({ zhTW: `角色：${role.label.zhTW}`, en: `Role: ${role.label.en}` });
  }

  // 公司 email 網域
  const dom = args.email ? emailDomain(args.email) : null;
  if (dom) {
    if (FREE_EMAIL_DOMAINS.has(dom)) {
      individual += 1;
      signals.push({ zhTW: '個人／免費信箱網域', en: 'Personal / free email domain' });
    } else {
      enterprise += 1;
      signals.push({ zhTW: `公司網域：${dom}`, en: `Corporate domain: ${dom}` });
    }
  }

  const recommendedPool: LeadPool = enterprise >= individual ? 'enterprise' : 'individual';
  return { recommendedPool, signals };
}
