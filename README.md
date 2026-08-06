# Prueba técnica

Documentación del desarrollo (diseño, decisiones y kanban): [Notion — Test técnico](https://app.notion.com/p/Test-t-cnico-Aitor-Garc-a-Bellver-3b3f79cb7e268011b8cce13df9df4939?source=copy_link).

SPA para explorar los 100 podcasts musicales más populares de Apple Podcasts: listado con búsqueda, detalle del podcast, detalle del episodio y reproducción con el player nativo HTML5. La navegación es en cliente y los datos se cachean 24 horas en `localStorage`.

## Stack

- React 19 + TypeScript
- Webpack
- Redux Toolkit Query
- React Router (data APIs / loaders)
- styled-components
- ESLint + Prettier
- Jest + Testing Library
- Playwright (E2E)

## Requisitos

- Node.js 22 (LTS)

```bash
nvm use
```

## Instalación

```bash
npm install
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm start` | Dev server en [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Bundle de producción en `dist/` |
| `npm run serve` | Sirve el `dist/` en el puerto 3000 (incluye `/proxy` anti-CORS) |
| `npm run lint` / `npm run lint:fix` | ESLint (y autofix) |
| `npm run format` / `npm run format:check` | Prettier |
| `npm test` | Tests unitarios (Jest) |
| `npm run test:e2e` | Tests E2E (Playwright) |

Antes de los E2E, instala el browser:

```bash
npx playwright install chromium
```

## Rutas

- `/` — listado + búsqueda
- `/podcast/:podcastId` — detalle del podcast y sus episodios
- `/podcast/:podcastId/episode/:episodeId` — detalle del episodio + player

## Decisiones técnicas

- **Caché 24h:** un `baseQuery` custom de RTK Query guarda en `localStorage` (clave = URL). Si la entrada tiene menos de un día, no se vuelve a pedir a la red.
- **Descripción / HTML:** iTunes lookup casi no trae HTML útil en los episodios. La descripción del canal y el HTML de cada episodio salen del RSS (`feedUrl`). Antes de pintar el HTML del episodio lo pasamos por DOMPurify (así evitamos XSS del feed).
- **Loading del header / loaders:** el spinner usa `useNavigation` de React Router. Mientras la navegación no está `idle`, se muestra arriba a la derecha.

  Las rutas de detalle (`/podcast/:id` y episodio) tienen **loaders** que, antes de pintar la vista, disparan las queries de RTK Query (`initiate` + `unwrap`). Así el spinner cubre de verdad la espera de red, no solo el cambio de ruta.

  En **podcast detail** el loader hace dos pasos: primero el lookup de iTunes (episodios, `feedUrl`, etc.) y, si hay `feedUrl`, el RSS para la **descripción del canal**. La página también espera ese feed (`isWaitingForFeed`) antes de mostrar el sidebar con la descripción, para no enseñar el detalle a medias. Si el RSS falla, se loguea en consola y la vista sigue (sin descripción). El home no lleva loader a propósito: la carga inicial del top 100 no es una “navegación” entre rutas.
- **Proxy `/proxy` (CORS):** el enunciado apunta a allorigins, pero ese servicio (y otros públicos) fallaban con 500/522. Top 100, lookup y RSS van a `/proxy?url=…` en el mismo origen en **dev y prod**: webpack-dev-server y `npm run serve`. Node pide el recurso sin CORS; el navegador solo habla con localhost.

  > **No desplegar este `/proxy` tal cual en internet.** Acepta cualquier URL `http(s)` y el servidor la pide por ti: es un proxy abierto (riesgo SSRF hacia localhost/red interna). Vale para demo local (`npm start` / `npm run serve`). Una allowlist estricta es incómoda porque los RSS salen de decenas de dominios distintos; en un deploy real habría que acotar destinos (p. ej. bloquear redes privadas) o un proxy más controlado.

## Estructura

```text
src/
  app/         # providers, router, layout
  pages/       # Home, detalle podcast, detalle episodio
  components/  # UI reutilizable (Header, cards, sidebar…)
  hooks/       # búsqueda, formato de fechas/duración…
  store/       # RTK Query + caché
  types/
```

## Hitos (tags)

- `v0.1-boilerplate` — proyecto base
- `v0.2-home` — homepage con la vista de listado, búsqueda y caché
- `v0.3-podcast-detail` — vista de podcast
- `v0.4-episode-detail` — vista de episodio + player
- `v1.0` — aplicación lista (vistas, caché, proxy CORS, E2E, README)
