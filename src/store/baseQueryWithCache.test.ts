/**
 * @jest-environment node
 */
import type { BaseQueryApi } from '@reduxjs/toolkit/query';
import { CACHE_TTL_MS, baseQueryWithCache, isCacheFresh } from './baseQueryWithCache';

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

function createApi(): BaseQueryApi {
  return {
    signal: new AbortController().signal,
    abort: jest.fn(),
    dispatch: jest.fn(),
    getState: jest.fn(() => ({})),
    extra: undefined,
    endpoint: 'testEndpoint',
    type: 'query',
  };
}

function mockJsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('isCacheFresh', () => {
  it('returns true when timestamp is within 24 hours', () => {
    const now = 1_000_000;
    expect(isCacheFresh(now - CACHE_TTL_MS + 1, now)).toBe(true);
  });

  it('returns false when timestamp is older than 24 hours', () => {
    const now = 1_000_000;
    expect(isCacheFresh(now - CACHE_TTL_MS, now)).toBe(false);
  });
});

describe('baseQueryWithCache', () => {
  const url = 'https://example.com/podcasts';
  const localStorageMock = createLocalStorageMock();

  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    });
  });

  beforeEach(() => {
    localStorageMock.clear();
    jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns cached data without fetching when cache is fresh', async () => {
    localStorage.setItem(
      url,
      JSON.stringify({
        data: { cached: true },
        timestamp: Date.now(),
      }),
    );

    const result = await baseQueryWithCache(url, createApi(), {});

    expect(result).toEqual({ data: { cached: true } });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('fetches and stores data when cache is missing', async () => {
    const payload = { items: [1, 2, 3] };
    jest.mocked(globalThis.fetch).mockResolvedValue(mockJsonResponse(payload));

    const result = await baseQueryWithCache(url, createApi(), {});

    expect(globalThis.fetch).toHaveBeenCalled();
    expect(result.data).toEqual(payload);

    const stored = JSON.parse(localStorage.getItem(url) ?? '{}') as {
      data: unknown;
      timestamp: number;
    };

    expect(stored.data).toEqual(payload);
    expect(typeof stored.timestamp).toBe('number');
  });

  it('fetches when cache has timestamp but no data', async () => {
    localStorage.setItem(
      url,
      JSON.stringify({
        timestamp: Date.now(),
      }),
    );

    const payload = { recovered: true };
    jest.mocked(globalThis.fetch).mockResolvedValue(mockJsonResponse(payload));

    const result = await baseQueryWithCache(url, createApi(), {});

    expect(globalThis.fetch).toHaveBeenCalled();
    expect(result.data).toEqual(payload);
  });

  it('fetches again when cache is expired', async () => {
    localStorage.setItem(
      url,
      JSON.stringify({
        data: { stale: true },
        timestamp: Date.now() - CACHE_TTL_MS - 1,
      }),
    );

    const payload = { fresh: true };
    jest.mocked(globalThis.fetch).mockResolvedValue(mockJsonResponse(payload));

    const result = await baseQueryWithCache(url, createApi(), {});

    expect(globalThis.fetch).toHaveBeenCalled();
    expect(result.data).toEqual(payload);

    const stored = JSON.parse(localStorage.getItem(url) ?? '{}') as {
      data: unknown;
    };

    expect(stored.data).toEqual(payload);
  });
});
