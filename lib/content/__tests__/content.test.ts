import { GLOSSARY, GLOSSARY_BY_KEY } from '@/lib/content/glossary';
import { JOURNEY } from '@/lib/content/journey';

const bilingual = (o: { zhTW: string; en: string } | undefined) => !!o && !!o.zhTW.trim() && !!o.en.trim();

describe('dual-level content discipline', () => {
  it('every glossary term has a bilingual term + PLAIN line + PRO line', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(12);
    for (const g of GLOSSARY) {
      expect(bilingual(g.term)).toBe(true);
      expect(bilingual(g.plain)).toBe(true); // 白話 for newcomers
      expect(bilingual(g.pro)).toBe(true); // 專業 for experts
      expect(GLOSSARY_BY_KEY[g.key]).toBe(g);
    }
  });

  it('the journey is the full 7-step cycle, each step plain + pro + tool', () => {
    expect(JOURNEY.map((s) => s.num)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(JOURNEY.map((s) => s.id)).toEqual(['measure', 'target', 'reduce', 'assure', 'file', 'disclose', 'close']);
    for (const s of JOURNEY) {
      expect(bilingual(s.title)).toBe(true);
      expect(bilingual(s.plain)).toBe(true);
      expect(bilingual(s.pro)).toBe(true);
      expect(bilingual(s.tool)).toBe(true);
      expect(s.href).toBe('/workbench');
    }
  });
});
