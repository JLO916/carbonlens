import { emptyProfile } from '@/lib/workbench/profile';
import { saveProfile, loadProfile, clearProfile, exportProfileJson, parseProfile } from '@/lib/workbench/storage';
import { snapshotOf, appendSnapshot, loadSnapshots, type Snapshot } from '@/lib/workbench/snapshots';
import { computeWorkbench } from '@/lib/workbench/aggregate';
import { monthsSince, STALE_MONTHS } from '@/lib/diagnose/aging';

function fakeStore() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
}

describe('workbench storage (localStorage-shaped, injectable)', () => {
  it('round-trips the profile', () => {
    const s = fakeStore();
    const p = { ...emptyProfile(), company: 'ACME' };
    saveProfile(p, s);
    expect(loadProfile(s)?.company).toBe('ACME');
  });

  it('discards a different schema version safely', () => {
    const s = fakeStore();
    s.setItem('recc:workbench:profile', JSON.stringify({ ...emptyProfile(), schemaVersion: 2 }));
    expect(loadProfile(s)).toBeNull();
  });

  it('clear + empty store → null (no throw)', () => {
    const s = fakeStore();
    expect(loadProfile(s)).toBeNull();
    saveProfile(emptyProfile(), s);
    clearProfile(s);
    expect(loadProfile(s)).toBeNull();
  });

  it('B1 export → import round-trips; bad input rejected', () => {
    const p = { ...emptyProfile(), company: 'PORTABLE' };
    const json = exportProfileJson(p);
    expect(parseProfile(json)?.company).toBe('PORTABLE');
    expect(parseProfile('{"schemaVersion":2}')).toBeNull();
    expect(parseProfile('not json')).toBeNull();
    expect(parseProfile(JSON.stringify({ schemaVersion: 1 }))).toBeNull(); // missing arrays
  });
});

describe('workbench snapshots', () => {
  const snap = (at: string): Snapshot => snapshotOf(computeWorkbench(emptyProfile()), at);

  it('snapshotOf slims a result to totals', () => {
    const s = snap('2026-06-01T00:00:00Z');
    expect(s.feeTWD).toBe(7_500_000);
    expect(s.ifrsPhase).toBe(3);
    expect(['low', 'medium', 'high']).toContain(s.pressure);
  });

  it('appendSnapshot prepends (newest first) and persists', () => {
    const s = fakeStore();
    appendSnapshot(snap('2026-06-01T00:00:00Z'), s);
    const list = appendSnapshot(snap('2026-09-01T00:00:00Z'), s);
    expect(list).toHaveLength(2);
    expect(list[0].at).toBe('2026-09-01T00:00:00Z'); // newest first
    expect(loadSnapshots(s)).toHaveLength(2);
  });

  it('caps at 60', () => {
    const s = fakeStore();
    let list: Snapshot[] = [];
    for (let i = 0; i < 65; i++) list = appendSnapshot(snap(`2026-06-0${(i % 9) + 1}T00:00:00Z`), s);
    expect(list).toHaveLength(60);
  });
});

describe('aging (shared by CitationTag + snapshots)', () => {
  it('monthsSince counts whole months; stale at 9', () => {
    expect(monthsSince('2026-06', new Date('2026-06-15'))).toBe(0);
    expect(monthsSince('2026-02-04', new Date('2026-11-01'))).toBe(9);
    expect(monthsSince('2026-02-04', new Date('2026-11-01'))! >= STALE_MONTHS).toBe(true);
    expect(monthsSince('not-a-date')).toBeNull();
  });
});
