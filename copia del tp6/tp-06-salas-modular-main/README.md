# Trabajo práctico 06

## Proyecto de partida y cambios

El proyecto de partida es `tp-05-salas-middleware-main`, conservado sin cambios
como subcarpeta local. Esta copia TP 06 conserva sus vistas EJS, layout, CSS,
las cuatro reservas iniciales y el contrato de rutas. No se copiaron
`node_modules` ni `.git` del proyecto anterior. Se ejecutó la versión original
sin modificarla en el puerto 3305 y esta versión modular en el 3000; la matriz
de abajo registra ambas observaciones. La línea de base respondió al contrato
esperado, así que no hizo falta una reparación previa.

## Instalación y ejecución

Requiere Node.js y npm. Desde esta carpeta:

```sh
npm install
o
npm.cmd install

npm start
o
npm.cmd start
```

Verificación ejecutada con Node.js `v24.20.0` y npm `11.19.0`:

```sh
npm install
o
npm.cmd install

npm run format
o
npm.cmd format

npm run check
o
npm.cmd run check

npm start
o
npm.cmd start
```


## Configuración del entorno

`src/configuracion.js` procesa `PORT` y `NODE_ENV` al inicio. Si `PORT` no está
definido, usa `3000`; de lo contrario lo convierte a número y rechaza valores
que no sean enteros entre 1 y 65535, con un mensaje explícito. `NODE_ENV`
selecciona Morgan `dev` (valor predeterminado) o `combined` cuando es
`production`; esto solo cambia el formato del registro.

`.env.example` contiene valores no secretos. `npm start` no requiere un `.env`.
Opcionalmente se puede copiar `.env.example` a `.env` y usar:

```sh
npm run start:local
```

Ese comando usa `node --env-file=.env` y requiere una versión de Node.js que
admita `--env-file`. `.env` y `node_modules/` están excluidos por `.gitignore`.
No se debe publicar un `.env` local ni incluir claves o credenciales.

## Mapa de módulos y dependencias

| Módulo | Responsabilidad |
| --- | --- |
| `src/index.js` | Declara los datos iniciales, crea una instancia del servicio, lee la configuración, crea la aplicación y ejecuta `listen`. |
| `src/configuracion.js` | Convierte y valida la configuración del entorno sin crear Express ni imprimir valores del entorno. |
| `src/app.js` | Configura vistas, middleware y pipeline; monta rutas de aplicación y reservas y termina en el 404. |
| `src/rutas/index.js` | Relaciona `/` y `/estado` con el controlador. |
| `src/rutas/reservas.js` | Declara rutas relativas al montaje `/reservas` y asocia middleware/controladores. `/nueva` se registra antes de `/:id`. |
| `src/controladores/reservas.js` | Traduce parámetros y datos de la petición en vistas, JSON, estados 404 y redirecciones. |
| `src/servicios/reservas.js` | Mantiene el único arreglo activo en memoria y ofrece listar, buscar, contar y crear. |
| `src/middleware/solicitudes.js` | Genera el ID `BIB-` y mide hasta el evento `finish`. |
| `src/middleware/reservas.js` | Define la sección del router y valida el POST antes de continuar al controlador. |

El servicio no usa `req`, `res`, EJS ni códigos HTTP: se ocupa de los datos y
puede reutilizarse desde distintos controladores. El controlador conoce
Express, interpreta la solicitud, elige qué vista o respuesta HTTP entregar y
solicita cambios al servicio. El router declara caminos relativos porque
`app.js` lo monta una sola vez en `/reservas`; así el prefijo no se repite en
cada ruta interna. `index.js` suministra el arreglo semilla al servicio, que
conserva su propia y única lista activa de reservas.

## Pipeline y contrato de rutas

```text
Morgan -> identificarSolicitud -> medirDuracion -> layouts -> static
       -> urlencoded -> json -> rutas de aplicación -> router /reservas -> 404
```

Morgan se mantiene antes de `express.static`, como en TP 05. Por eso también
quedan registradas las solicitudes que sirven archivos estáticos. La medición
propia registra el ID, método, URL, estado final y duración al completarse cada
respuesta (`finish`), incluidos 200, 302, 400 y 404. El POST válido produce un
302 y su GET posterior es una solicitud independiente, con su propio registro
e ID.

| Método | Ruta | Respuesta |
| --- | --- | --- |
| GET | `/` | 200; inicio |
| GET | `/estado` | 200; JSON con `servicio`, cantidad de reservas e ID `BIB-` |
| GET | `/reservas` | 200; listado |
| GET | `/reservas/nueva` | 200; formulario |
| GET | `/reservas/:id` | 200 si existe; 404 HTML si no existe |
| POST | `/reservas` | 302 al listado si es válido; 400 con formulario y valores si es inválido |
| GET | `/css/estilos.css` | 200; CSS |
| GET | otra URL | 404 HTML |

El parser `express.urlencoded` antecede al validador. Se conservan los campos,
mensajes, reglas y selección de valores del TP 05: estudiante, email con `@`,
sala y turno permitidos, fecha obligatoria y personas enteras de 1 a 6. Ante
error, el validador responde 400 y no llama a `next()`; si es válido, prepara
`req.reservaValidada` y continúa al controlador.

## Matriz antes/después

Resultados observados primero en TP 05 sin cambios (puerto 3305) y luego en
TP 06 modular (puerto 3000), cada uno iniciado con sus cuatro reservas semilla:

| Caso | TP 05 HTTP | TP 06 HTTP | Reservas antes / después | Evidencia |
| --- | --- | --- | --- | --- |
| Inicio | 200 | 200 | 4 / 4 | Vista de inicio y un ID `BIB-####` visible en ambas. |
| Estado inicial | 200 | 200 | 4 / 4 | JSON `servicio: activo`, cantidad e ID de solicitud. |
| Listado | 200 | 200 | 4 / 4 | Las mismas cuatro tarjetas iniciales. |
| Formulario | 200 | 200 | 4 / 4 | Campos, selectores y formulario presentes; ID visible. |
| Detalle existente `/reservas/1` | 200 | 200 | 4 / 4 | Vista de detalle de Lucía Fernández en ambas versiones. |
| Detalle inexistente `/reservas/999` | 404 | 404 | 4 / 4 | HTML incluye “Error 404”; servidor sigue disponible. |
| POST vacío | 400 | 400 | 4 / 4 | Mensaje “Completa todos los campos”; no crea una reserva. |
| POST válido y GET posterior | 302, luego 200 | 302, luego 200 | 4 / 5 | Redirección a `/reservas`; la nueva reserva aparece y `/estado` pasa a 5. |
| CSS `/css/estilos.css` | 200 | 200 | 4 / 4 | `Content-Type: text/css; charset=UTF-8`. |
| URL inexistente | 404 | 404 | 4 / 4 | Vista HTML final de no encontrado. |
| Registro y medición | Morgan `dev` y línea propia | Morgan `dev` y línea propia | Ambas registraron respuestas 200, 302, 400 y 404; la línea propia incluye ID y duración hasta `finish`. |

En TP 05 y TP 06, sala no permitida, email sin `@` y personas `0`, `7` o
fraccionarias respondieron 400 sin crear altas; en TP 06 también se verificó
fecha vacía. Un envío inválido conservó los valores escritos en el formulario.
Tras un POST válido, `/estado` pasó de 4 a 5; al reiniciar TP 06, `/estado`
volvió a 200 con cantidad 4. Con `PORT=3401`, `npm start` atendió `/estado`
con 200. Con `PORT=65536`, no inició y mostró
`PORT debe ser un número entero entre 1 y 65535.`. Con `NODE_ENV=production`,
`/estado` respondió 200 y Morgan emitió el formato `combined`.

## Formato y análisis estático

Los scripts disponibles son:

```sh
npm run format
npm run format:check
npm run lint
npm run check
```

`npm run check` ejecuta primero la verificación de Prettier y después ESLint
para los módulos CommonJS bajo `src/`; ambas etapas finalizaron correctamente.

## Persistencia temporal y límites

La única lista activa vive dentro de la instancia creada por
`crearServicioReservas`. La instancia compartida atiende listado, detalle,
`/estado` y altas, así que la cantidad de estado corresponde a las mismas
reservas que aparecen en el listado. La lista existe solo en memoria: al
reiniciar el proceso se descartan las altas y se vuelve a la semilla de cuatro
reservas. No se incorporaron base de datos ni persistencia en archivos.

No se añadieron APIs, autenticación, autorización ni pruebas automatizadas;
este trabajo reorganiza la aplicación existente y conserva sus vistas,
layout, CSS, datos iniciales y comportamiento previsto.
