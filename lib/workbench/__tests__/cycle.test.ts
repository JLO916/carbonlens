import { obligationCalendar, CYCLE_STAGES } from '@/lib/workbench/cycle';
import { emptyProfile } from '@/lib/workbench/profile';

describe('C4 — cycle stages + obligation calendar', () => {
  it('has the 6 annual-cycle stages', () => {
    expect(CYCLE_STAGES.map((s) => s.value)).toEqual(['measure', 'review', 'assure', 'assured', 'filed', 'disclosed']);
  });

  it('derives sourced, dated obligations from the profile, sorted by soonest', () => {
    const p = emptyProfile(); // tw facility, exportsToEU, listed, 1 CBAM line
    p.year = 2026;
    p.customerFrameworks = ['sbti', 'cdp'];
    const cal = obligationCalendar(p, '2026-06-07T00:00:00Z');
    const byKey = Object.fromEntries(cal.map((o) => [o.key, o]));
    // carbon fee 31 May; CBAM 30 Sep (Omnibus-amended, from the data layer); report 31 Aug (§6A-1)
    expect(byKey.carbonfee.dueDate).toBe('2027-05-31');
    expect(byKey.cbam.dueDate).toBe('2027-09-30');
    expect(byKey.report.dueDate).toBe('2027-08-31');
    expect(byKey.cdp.dueDate).toBe('2027-07-31');
    // each cites a source + has a positive countdown
    expect(byKey.carbonfee.source.zhTW).toContain('碳費收費辦法');
    expect(byKey.cbam.source.zhTW).toContain('2023/956');
    expect(byKey.cbam.source.zhTW).toContain('2025/2083'); // Omnibus amendment cited
    expect(byKey.report.source.zhTW).toContain('8/31');
    expect(cal.every((o) => o.daysUntil > 0)).toBe(true);
    // sorted soonest-first → carbon fee (May) now leads; CBAM (Sep) after the report (Aug)
    expect(cal[0].key).toBe('carbonfee');
    expect(cal.findIndex((o) => o.key === 'report')).toBeLessThan(cal.findIndex((o) => o.key === 'cbam'));
  });

  it('only lists obligations that apply (no EU export → no CBAM line)', () => {
    const p = emptyProfile();
    p.exportsToEU = false;
    const cal = obligationCalendar(p, '2026-06-07T00:00:00Z');
    expect(cal.find((o) => o.key === 'cbam')).toBeUndefined();
  });
});
