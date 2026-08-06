import DOMPurify from 'dompurify';

export function sanitizeEpisodeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}
