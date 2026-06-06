// Public lookup for a promoted CBAM official default. Two shapes:
//   ?country=&cnCode=&year=   → the EXACT marked-up value for that CN code
//   ?country=&product=&year=  → the category min–max range (when the CN code is unknown)
// Returns { locked: true } until a human has confirmed the baseline (Brief §7.3) — so the
// official-default path shows no number until then.

import { getCbamDefaultByCn, getCbamCategoryRange } from '@/lib/diagnose/cbam-live-store';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const country = url.searchParams.get('country') ?? '';
  const cnCode = url.searchParams.get('cnCode') ?? '';
  const product = url.searchParams.get('product') ?? '';
  const year = Number(url.searchParams.get('year') ?? '2026');
  if (!country) return Response.json({ locked: true, error: 'missing_params' });

  if (cnCode) {
    const d = await getCbamDefaultByCn(country, cnCode, year);
    return d ? Response.json({ locked: false, ...d }) : Response.json({ locked: true });
  }
  if (product) {
    const r = await getCbamCategoryRange(country, product, year);
    return r ? Response.json({ locked: false, ...r }) : Response.json({ locked: true });
  }
  return Response.json({ locked: true, error: 'missing_params' });
}
