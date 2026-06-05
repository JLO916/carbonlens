// Public lookup for a promoted CBAM default emission factor (country × product × year).
// Returns { locked: true } until a human has confirmed the baseline (Brief §7.3) — so the
// official-default path shows no number until then.

import { getCbamDefault } from '@/lib/diagnose/cbam-live-store';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const country = url.searchParams.get('country') ?? '';
  const product = url.searchParams.get('product') ?? '';
  const year = Number(url.searchParams.get('year') ?? '2026');
  if (!country || !product) return Response.json({ locked: true, error: 'missing_params' });

  const d = await getCbamDefault(country, product, year);
  if (!d) return Response.json({ locked: true });
  return Response.json({ locked: false, ...d });
}
