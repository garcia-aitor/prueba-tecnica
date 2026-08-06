import { sanitizeEpisodeHtml } from './sanitizeEpisodeHtml';

describe('sanitizeEpisodeHtml', () => {
  it('keeps safe markup', () => {
    expect(sanitizeEpisodeHtml('<p>Hola <strong>mundo</strong></p>')).toBe(
      '<p>Hola <strong>mundo</strong></p>',
    );
  });

  it('strips script tags', () => {
    expect(sanitizeEpisodeHtml('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>');
  });
});
