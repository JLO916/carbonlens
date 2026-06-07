import { lockVersion, appendLockedVersion, loadLockedVersions, removeLockedVersion } from '@/lib/workbench/locked-versions';
import { emptyProfile } from '@/lib/workbench/profile';

function fakeStore() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
}

describe('C3 — locked verified versions (freeze + change trail)', () => {
  it('lockVersion captures footprint + a frozen profile copy', () => {
    const v = lockVersion(emptyProfile(), 'FY2025 已查證版', '王經理', 'id-1', '2026-06-01T00:00:00Z');
    expect(v.footprintTonnes).toBe(50000); // Scope 1+2+3 of the default profile
    expect(v.label).toBe('FY2025 已查證版');
    expect(v.signedBy).toBe('王經理');
    expect(JSON.parse(v.profileJson).schemaVersion).toBe(1); // restorable copy
  });

  it('append (newest first) / load / remove round-trips and is a change trail', () => {
    const s = fakeStore();
    appendLockedVersion(lockVersion(emptyProfile(), 'v1', 'A', 'id-1', '2026-01-01T00:00:00Z'), s);
    const list = appendLockedVersion(lockVersion(emptyProfile(), 'v2', 'B', 'id-2', '2026-06-01T00:00:00Z'), s);
    expect(list.map((v) => v.label)).toEqual(['v2', 'v1']); // newest first = change trail
    expect(loadLockedVersions(s)).toHaveLength(2);
    expect(removeLockedVersion('id-1', s)).toHaveLength(1);
  });
});
