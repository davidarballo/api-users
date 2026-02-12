# API Users (NestJS)

API REST para gestión de usuarios con autenticación JWT, perfil asociado, validaciones y documentación Swagger.

## Stack
- NestJS
- MongoDB + Mongoose
- JWT (`@nestjs/jwt`, `passport-jwt`)
- Class Validator / Class Transformer
- Swagger (`@nestjs/swagger`)
- Jest (unit tests)

## Requisitos
- Node.js 18+
- npm 9+
- MongoDB en ejecución

## Variables de entorno
Crear archivo `.env` en la raíz:

```env
MONGO_URI=mongodb://localhost:27017/api-users
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=1d
```

## Instalación y ejecución

```bash
npm install
npm run start:dev
```

La API corre por defecto en `http://localhost:3000`.

## Documentación Swagger
- URL: `http://localhost:3000/docs`

## Autenticación
Flujo básico:
1. Registrar usuario con perfil en `POST /auth/register`
2. Loguear en `POST /auth/login`
3. Usar `accessToken` en `Authorization: Bearer <token>`

## Endpoints principales

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (protegido)

click en Authorize y pegar: Bearer <token>
### Users (protegidos con JWT)
- `POST /users`
- `GET /users`
- `GET /users/:id`
- `PUT /users/:id`
- `DELETE /users/:id`

## Ejemplos de payload

### Register
`POST /auth/register`

```json
{
  "email": "david@prueba.com",
  "password": "Password123!",
  "profile": {
    "firstName": "David",
    "lastName": "Arballo",
    "phone": "+54 9 11 5555 5555",
    "city": "Cordoba"
  }
}
```

### Login
`POST /auth/login`

```json
{
  "email": "david@prueba.com",
  "password": "Password123!"
}
```

### Crear usuario (admin/uso interno)
`POST /users`

```json
{
  "email": "user@prueba.com",
  "password": "Password123!",
  "profile": {
    "firstName": "User",
    "lastName": "Test"
  }
}
```

### Actualizar usuario
`PUT /users/:id`

```json
{
  "email": "nuevo@prueba.com",
  "password": "Password456!",
  "profile": {
    "city": "Cordoba"
  }
}
```

## Búsqueda, paginación y orden
Endpoint: `GET /users`

Query params:
- `search`: texto a buscar (actualmente sobre `email`)
- `page`: página (min 1)
- `limit`: cantidad por página (min 1, max 100)
- `sortBy`: `email | createdAt | updatedAt`
- `sortDir`: `asc | desc`

Ejemplo:

```http
GET /users?search=david&page=1&limit=10&sortBy=createdAt&sortDir=desc
```

## Validaciones y errores
- Se usa `ValidationPipe` global con:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`
- Errores comunes:
  - `400 Bad Request`: payload inválido o ID inválido
  - `401 Unauthorized`: credenciales/token inválidos
  - `404 Not Found`: usuario no encontrado
  - `409 Conflict`: email duplicado

## Tests

```bash
npm test
```

## Build

```bash
npm run build
```

## Docker (opcional)
Proyecto incluye `Dockerfile` y `docker-compose.yml`.

Uso típico:

```bash
docker compose up --build
```
