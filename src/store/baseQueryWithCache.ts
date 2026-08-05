import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

// 24h
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = {
  data: unknown;
  timestamp: number;
};

const rawQuery = fetchBaseQuery({});

// URL de la petición = clave en localStorage
function resolveUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url;
}

// Lee la entrada de caché; si el JSON está corrupto, devolvemos null
function readCache(key: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as CacheEntry;
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Guarda la respuesta con la hora actual (luego comprobamos si ya han pasado 24 h)
function writeCache(key: string, data: unknown): void {
  try {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error(error);
  }
}

// true si aún no ha pasado un día desde que se guardó
export function isCacheFresh(timestamp: number, now = Date.now()): boolean {
  return now - timestamp < CACHE_TTL_MS;
}

// baseQuery de RTK: primero mira localStorage; si no hay nada válido, nueva petición
export const baseQueryWithCache: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const cacheKey = resolveUrl(args);
  const cached = readCache(cacheKey);

  // caché válida solo si hay datos; si alguien dejó solo el timestamp, hacemos una nueva petición
  if (cached && cached.data !== undefined && isCacheFresh(cached.timestamp)) {
    return { data: cached.data };
  }

  const result = await rawQuery(args, api, extraOptions);

  // solo guardamos si la petición ha ido bien y trae datos
  if (result.data !== undefined) {
    writeCache(cacheKey, result.data);
  }

  return result;
};
