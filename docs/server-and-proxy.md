# Servidor de produccion y proxy CORS

## Descripcion general

El proyecto incluye un servidor HTTP ligero (`scripts/serve-prod.ts`) que cumple dos funciones:

1. **Servir los archivos estaticos** generados por el build (`dist/`).
2. **Actuar como proxy CORS** para que el navegador pueda consumir APIs o feeds externos sin toparse con restricciones de origen cruzado.

La logica del proxy vive en un modulo aparte (`scripts/corsProxy.ts`) para mantener las responsabilidades separadas.

---

## Arquitectura

```
Navegador
   |
   |  GET /proxy?url=https://api.example.com/data
   v
serve-prod.ts  (http://localhost:3000)
   |
   |-- /proxy  -->  corsProxy.ts  -->  fetch al servidor externo
   |
   |-- /*      -->  archivos estaticos de dist/
   |                (fallback a index.html para SPA)
```

---

## `scripts/corsProxy.ts`

### `assertHttpUrl(targetUrl: string): URL`

Valida que la URL recibida sea un esquema `http:` o `https:`. Rechaza cualquier otro protocolo (por ejemplo `file://`) para evitar accesos no deseados.

- Lanza un `Error` si la URL es invalida o no es HTTP/HTTPS.
- Devuelve el objeto `URL` parseado si pasa la validacion.

### `fetchThroughProxy(targetUrl: string): Promise<{ status, body, contentType }>`

Realiza la peticion al recurso externo desde el servidor (donde no aplican restricciones CORS) y devuelve:

| Campo         | Tipo     | Descripcion                                      |
|---------------|----------|--------------------------------------------------|
| `status`      | `number` | Codigo HTTP de la respuesta del servidor externo  |
| `body`        | `string` | Cuerpo de la respuesta como texto                 |
| `contentType` | `string` | Valor de la cabecera `Content-Type` de la respuesta |

La cabecera `Accept` que envia incluye JSON, XML, RSS y un wildcard para cubrir la mayoria de APIs y feeds.

---

## `scripts/serve-prod.ts`

### Configuracion

| Variable de entorno | Por defecto | Descripcion                        |
|---------------------|-------------|------------------------------------|
| `PORT`              | `3000`      | Puerto en el que escucha el servidor |

El servidor busca los archivos en la carpeta `dist/` relativa al directorio de trabajo actual.

### Rutas

#### `GET /proxy?url=<URL_CODIFICADA>`

Proxy CORS. Recibe la URL destino como query param `url`.

- **400** si falta el parametro `url`.
- **502** si la peticion al destino falla (red, timeout, etc.).
- En caso de exito, devuelve el mismo `status` y `Content-Type` que el servidor externo.

#### Cualquier otra ruta

1. Busca un archivo que coincida en `dist/`.
2. Si no lo encuentra, devuelve `dist/index.html` (comportamiento SPA / client-side routing).

### Tipos MIME soportados

El servidor reconoce las extensiones mas comunes: `.html`, `.js`, `.css`, `.json`, `.png`, `.jpg`, `.jpeg`, `.svg`, `.ico`, `.map`, `.woff` y `.woff2`. Para cualquier otra extension devuelve `application/octet-stream`.

### Seguridad

- Las rutas se normalizan con `path.normalize` y se eliminan secuencias `../` para evitar path traversal.
- Solo se sirven archivos que esten dentro de `dist/`.
- El proxy solo acepta URLs con esquema `http:` o `https:`.

---

## Uso

```bash
# Construir la app
npm run build

# Levantar el servidor
npx tsx scripts/serve-prod.ts

# O con un puerto personalizado
PORT=8080 npx tsx scripts/serve-prod.ts
```

### Ejemplo de llamada al proxy

```
http://localhost:3000/proxy?url=https%3A%2F%2Fapi.example.com%2Fdata.json
```

El navegador recibe la respuesta como si viniera de `localhost:3000`, sin problemas de CORS.
