// Admin: review staged CBAM defaults, promote to live (human baseline), or re-lock.
// Requires `Authorization: Bearer <ADMIN_TOKEN>`. Promotion is the §7.3 human-baseline step —
// it writes only an unlock flag; per-CN values are read from the repo JSON on lookup.

import { promoteCbamBaseline, revertCbamLive, getCbamLiveStatus, stagingSummary } from '@/lib/diagnose/cbam-live-store';
import { checkAdmin } from '@/lib/diagnose/admin-auth';

export async function GET(req: Request): Promise<Response> {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const live = await getCbamLiveStatus();
  const sum = stagingSummary();
  return Response.json({
    ok: true,
    live,
    staged: { rows: sum.rows, categories: sum.categories, countries: sum.countries, asOf: sum.asOf },
  });
}

export async function POST(req: Request): Promise<Response> {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const promoted = await promoteCbamBaseline(new Date().toISOString());
    return Response.json({ ok: true, promoted });
  } catch {
    return Response.json({ ok: false, error: 'promote_failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<Response> {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    await revertCbamLive();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: 'revert_failed' }, { status: 500 });
  }
}
