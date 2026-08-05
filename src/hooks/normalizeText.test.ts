import { normalizeText } from './normalizeText';

describe('normalizeText', () => {
  it('lowercases the text', () => {
    expect(normalizeText('Joe Budden')).toBe('joe budden');
  });

  it('removes diacritics', () => {
    expect(normalizeText('José Ángel')).toBe('jose angel');
  });

  it('keeps the same result for already normalized text', () => {
    expect(normalizeText('podcast')).toBe('podcast');
  });
});
