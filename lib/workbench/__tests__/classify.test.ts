import { ifrsPhaseFromCapital, suggestBusinessModel } from '@/lib/workbench/classify';

describe('workbench classify', () => {
  it('ifrsPhaseFromCapital derives phase + deadline from capital tier (FSC mapping)', () => {
    expect(ifrsPhaseFromCapital('over100').phase).toBe(1);
    expect(ifrsPhaseFromCapital('over100').fileDeadlineISO).toBe('2027-03-16');
    expect(ifrsPhaseFromCapital('from50to100').phase).toBe(2);
    expect(ifrsPhaseFromCapital('under50').phase).toBe(3);
    expect(ifrsPhaseFromCapital('under50').fileYear).toBe(2029);
  });

  it('suggestBusinessModel gives a labelled starting hint per industry', () => {
    expect(suggestBusinessModel('electronics').businessModel).toBe('odm_oem');
    expect(suggestBusinessModel('metals').businessModel).toBe('component');
    expect(suggestBusinessModel('retail').businessModel).toBe('brand');
    expect(suggestBusinessModel('unknown-industry').businessModel).toBe('odm_oem'); // safe default
    expect(suggestBusinessModel('electronics').note.zhTW).toContain('起點');
  });
});
