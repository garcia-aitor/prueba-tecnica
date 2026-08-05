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
| `npm run serve` | Sirve el `dist/` en el puerto 3000 |
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
- **Descripción / HTML:** iTunes lookup casi no trae HTML útil en los episodios. La descripción del canal y el HTML de cada episodio salen del RSS (`feedUrl`).
- **Loading del header:** el spinner usa `useNavigation` de React Router. Las rutas de detalle tienen loaders que disparan las queries de RTK para que el indicador se vea al navegar.
- **iTunes en directo:** el top 100 y el lookup ya mandan CORS, así que no paso por proxy para esas llamadas.

### Nota sobre la descripción del podcast

La descripción del canal (y el HTML rico de los episodios) sale del RSS del podcast, no del lookup de iTunes. En desarrollo suele ir bien porque muchos feeds permiten CORS desde el navegador.

En producción, al servir el `dist` en estático, algunos feeds bloquean la petición por CORS. El enunciado sugiere pasar por allorigins, pero ese proxy (y otras alternativas públicas que probé) me devolvía errores 500/522 de forma intermitente, así que preferí no depender de un tercero inestable solo para ese dato. Si el feed falla, la app sigue mostrando el detalle y los episodios; solo puede faltar la descripción.

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
