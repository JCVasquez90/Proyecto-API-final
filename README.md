# Cashi API Final

API REST de finanzas personales con autenticación JWT, transacciones por usuario, balance general, subida de comprobantes a Cloudflare R2 y coordenadas GPS. Proyecto final del ramo Desarrollo de Aplicaciones Web II.

## Stack tecnológico

- Node.js + TypeScript
- Hono 4.12 como framework web
- Prisma 7 como ORM con adaptador `pg`
- PostgreSQL como base de datos
- Docker para desarrollo local
- Zod para validaciones
- bcryptjs para hash de contraseñas
- jsonwebtoken para autenticación JWT
- Cloudflare R2 para almacenamiento de comprobantes
- Render para despliegue en producción
- Yarn como gestor de paquetes

## Estructura de carpetas (N-Layer)

La arquitectura está organizada en capas para separar responsabilidades:

```
src/
├── controllers/    (lógica de negocio, ownership check, cálculo de balance)
├── middlewares/    (auth.middleware.ts centralizado)
├── repositories/   (acceso a BD con Prisma)
├── routes/         (definición de endpoints REST)
├── schemas/        (validación con Zod)
├── services/       (upload a Cloudflare R2)
├── lib/            (instancia de PrismaClient)
├── app.ts          (configuración de Hono)
└── index.ts        (punto de entrada del servidor)
```

- controllers/: implementa la lógica de negocio y verifica ownership (devuelve 403 si el usuario no es propietario).
- repositories/: contiene las consultas y operaciones con Prisma (sin lógica de ownership).
- services/: lógica externa reutilizable (por ejemplo, subida a R2).
- middlewares/: middleware de autenticación centralizada y otros middlewares.

## Requisitos previos

- Node.js 20+
- Yarn
- Docker & Docker Compose
- Git
- Bruno (para probar la API)
- Cuenta en Cloudflare y R2 con credenciales y bucket configurado

## Instalación y configuración (paso a paso)

1. Clonar repositorio

```bash
git clone https://github.com/JCVasquez90/Proyecto-API-final.git
cd cashi-api-final
```

2. Instalar dependencias

```bash
yarn install
```

3. Crear archivo `.env` basado en el apartado `Variables de entorno` más abajo (puede apoyarse en `.env.example`).

4. Levantar servicios locales con Docker

```bash
docker compose up -d
```

5. Ejecutar migraciones de Prisma

```bash
npx prisma migrate dev
```

6. Iniciar modo desarrollo

```bash
yarn dev
```

## Variables de entorno (ejemplo `.env.example`)

```
DATABASE_URL="postgresql://user:password@localhost:5432/cashi"
JWT_SECRET="tu_jwt_secret_aqui"
R2_ENDPOINT="https://<account_id>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="R2ACCESSKEY"
R2_SECRET_ACCESS_KEY="R2SECRETKEY"
R2_BUCKET_NAME="cashi-receipts"
R2_PUBLIC_URL="https://<bucket>.<account_id>.r2.cloudflarestorage.com"
```

## Endpoints

La API expone los siguientes endpoints (13 en total):

| Método | Ruta                         | Auth | Descripción                                                                          |
|--------|------------------------------|-----:|--------------------------------------------------------------------------------------| 
| POST   | /auth/register               | No   | Registrar un nuevo usuario (email, password, name)                                   |
| POST   | /auth/login                  | No   | Iniciar sesión y obtener JWT                                                         |
| GET    | /categories                  | Sí   | Listar categorías del usuario autenticado                                            |
| POST   | /categories                  | Sí   | Crear categoría (name, type: income|expense)                                         |
| GET    | /categories/:id              | Sí   | Obtener categoría por id (ownership check)                                           |
| PUT    | /categories/:id              | Sí   | Actualizar categoría (ownership check)                                               |
| DELETE | /categories/:id              | Sí   | Eliminar categoría (ownership check)                                                 |
| GET    | /transactions                | Sí   | Listar transacciones del usuario con filtros (fecha, categoría)                      |
| POST   | /transactions                | Sí   | Crear transacción (amount, type, categoryId, date, coords, optional receipt file)    |
| GET    | /transactions/:id            | Sí   | Obtener transacción por id (ownership check)                                         |
| PUT    | /transactions/:id            | Sí   | Actualizar transacción (ownership check)                                             |
| DELETE | /transactions/:id            | Sí   | Eliminar transacción (ownership check)                                               |
| GET    | /balance                     | Sí   | Obtener balance general calculado para el usuario (ingresos - egresos)               |
| POST   | /transactions/:id/receipt    | Sí   | Subir comprobante (JPEG/PNG/WebP, max 5 MB) y guardar `receiptUrl` en la transacción |

Nota: Todos los endpoints que requieren autenticación esperan el header `Authorization: Bearer <token>`.

## Notas técnicas importantes

- Autenticación: JWT con `jsonwebtoken`. Las contraseñas se almacenan hasheadas con `bcryptjs`. Los tokens expiran en 7 días por configuración.
- Middleware de auth: centralizado en `src/middlewares/auth.middleware.ts` — valida token y añade `ctx.req.user`.
- Ownership check: se realiza en el `controller` correspondiente (NO en el repository). Si el recurso no pertenece al usuario autenticado, se devuelve HTTP 403.
- Cálculo de balance: realizado en el `controller` consumiendo datos del `repository` y agregando totales de ingresos y egresos.
- Upload a Cloudflare R2: implementado en `src/services/upload.service.ts`. Se valida tipo (JPEG/PNG/WebP) y tamaño máximo 5 MB antes de subir. Las rutas públicas se almacenan como `receiptUrl` en la transacción.
- Prisma 7: se utiliza con adaptador `pg`. El proyecto incluye `prisma.config.ts` para configuración adicional.
- Validaciones: `Zod` se usa en `src/schemas/` para validar payloads entrantes.
- Despliegue: se configuró para desplegar en Render con deploy automático desde GitHub; asegúrese de añadir las variables de entorno en el panel de Render.

## URL de producción

Producción (cuando esté desplegado): https://cashi-api.onrender.com

## Ejemplos de uso con Bruno

Sugerencias de pasos para probar la API en Bruno:

- Registrar usuario
  - Crear nueva request `POST /auth/register`
  - Body JSON: `{ "email": "user@example.com", "password": "secret123", "name": "Juan" }`
  - Enviar y verificar respuesta con `id` y `email`.

- Login y configurar Bearer Token
  - Crear `POST /auth/login` con body `{ "email": "user@example.com", "password": "secret123" }`.
  - Copiar `token` de la respuesta y en Bruno, añadir Authorization -> Bearer Token para las siguientes peticiones.

- CRUD de categorías
  - `GET /categories` para listar.
  - `POST /categories` con body `{ "name": "Comida", "type": "expense" }` para crear.
  - `PUT /categories/:id` y `DELETE /categories/:id` para actualizar/eliminar (asegúrese del header Bearer).

- CRUD de transacciones
  - `POST /transactions` con body ejemplo:
    `{ "amount": 12.5, "type": "expense", "categoryId": "<id>", "date": "2026-06-09T12:00:00Z", "coords": {"lat": -33.45, "lng": -70.66} }`
  - `GET /transactions` para listar, `GET /transactions/:id` para detalle, `PUT` y `DELETE` para modificar/eliminar.

- Subida de comprobante (receipt)
  - En Bruno, crear `POST /transactions/:id/receipt` como multipart/form-data.
  - Añadir campo `file` con imagen JPEG/PNG/WebP (≤ 5 MB).
  - Enviar; la respuesta incluirá `receiptUrl` que apunta al archivo en R2.

- Consulta de balance
  - `GET /balance` devuelve totales calculados (ingresos, egresos, neto).

## Declaración de uso de IA

Se utilizó GitHub Copilot para asistencia en la configuración, estructura de archivos y generación de código durante el desarrollo de este proyecto.

## Licencia

Este proyecto está bajo la licencia MIT.

## Autor

Juan Carlos — jc19900215@gmail.com
---

