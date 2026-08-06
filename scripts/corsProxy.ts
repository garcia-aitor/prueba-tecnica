// Solo http(s): evita file:// u otros esquemas
export function assertHttpUrl(targetUrl: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(targetUrl);
  } catch {
    throw new Error('URL inválida');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Solo se permiten URLs http(s)');
  }

  return parsed;
}

// El servidor pide el recurso (sin CORS); el navegador solo habla con nuestro origen
export async function fetchThroughProxy(targetUrl: string): Promise<{
  status: number;
  body: string;
  contentType: string;
}> {
  assertHttpUrl(targetUrl);

  const response = await fetch(targetUrl, {
    headers: {
      Accept: 'application/json, application/rss+xml, application/xml, text/xml, */*',
    },
  });
  const body = await response.text();
  const contentType = response.headers.get('content-type') ?? 'text/plain; charset=utf-8';

  return { status: response.status, body, contentType };
}
