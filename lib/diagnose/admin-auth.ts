// Shared admin-token gate for admin APIs. Requires `Authorization: Bearer <ADMIN_TOKEN>`.

export function checkAdmin(req: Request): Response | null {
  const admin = process.env.ADMIN_TOKEN;
  if (!admin) return Response.json({ ok: false, error: 'admin_not_configured' }, { status: 503 });
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token.length === 0 || token !== admin) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  return null;
}
