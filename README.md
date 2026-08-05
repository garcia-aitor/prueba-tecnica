# Prueba técnica

## Requisitos

- Node.js 22 (LTS)

```bash
nvm use
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm start
```

## Producción

```bash
npm run build
npm run serve
```

`build` genera el bundle en `dist/`. `serve` lo sirve en [http://localhost:3000](http://localhost:3000).

## Lint y tests

```bash
npm run lint
npm run format
npm test
npm run test:e2e
```

Antes de ejecutar los tests E2E, instala el browser de Playwright:

```bash
npx playwright install chromium
```

Sin este paso, `npm run test:e2e` fallará al intentar abrir el navegador.
