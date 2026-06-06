// Public: CN-code options for a (country, product) category — so the CBAM form can let the
// user pick their exact CN code. Returns nomenclature only (code + official description), no
// emission values (those come gated from /api/cbam-default after a human baseline confirm).

import { getCnOptions } from '@/lib/diagnose/cbam-live-store';

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const country = url.searchParams.get('country') ?? '';
  const product = url.searchParams.get('product') ?? '';
  if (!country || !product) return Response.json({ options: [], n: 0 });
  const options = getCnOptions(country, product);
  return Response.json({ options, n: options.length });
}
