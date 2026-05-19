# ChatMSG — Fase 2

App de mensajería multi-servidor con Redis Pub/Sub y cookies httpOnly.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Backend | Express 4 + Socket.IO 4 |
| Broker | Redis (Pub/Sub) via `@socket.io/redis-adapter` |
| Sesión | Cookie httpOnly firmada |
| Servidores | Múltiples instancias en diferentes puertos |

---

## PASO 1 — Instalar Redis

### Opción A: Redis Cloud (recomendada para trabajar entre compañeros)
1. Ir a https://redis.io/try-free/
2. Crear cuenta gratis
3. Crear una base de datos gratuita
4. Copiar la URL de conexión (formato: `redis://default:PASSWORD@HOST:PORT`)

### Opción B: Redis local (solo si están en la misma red)
- **Windows:** Descargar desde https://github.com/microsoftarchive/redis/releases
  - Descargar `Redis-x64-3.0.504.msi` e instalar
  - El servicio arranca automático en `redis://localhost:6379`
- **Con WSL/Linux:** `sudo apt install redis-server && sudo service redis start`

---

## PASO 2 — Configurar el .env del server

```bash
cd server
copy .env.example .env    # Windows
# o
cp .env.example .env      # Linux/Mac
```

Editar `.env`:

```env
# Cada compañero usa puerto diferente
PORT=3001          # Jack: 3001 | Compañero2: 3002 | Compañero3: 3003

# TODOS usan la misma URL de Redis
REDIS_URL=redis://default:PASSWORD@HOST:PORT

# TODOS usan el mismo secreto
SESSION_SECRET=chatmsg_secreto_super_seguro_2024

# URL del cliente que se conecta a este server
CLIENT_ORIGIN=http://localhost:5173
```

---

## PASO 3 — Instalar dependencias y correr

```bash
# Terminal 1 — Backend
cd server
npm install
npm run dev

# Terminal 2 — Frontend
cd client
npm install
npm run dev
```

---

## PASO 4 — Prueba con múltiples servidores

Cada compañero levanta su propio server con un puerto diferente.
El cliente puede conectarse a cualquier server — los mensajes llegarán
a todos gracias a Redis.

Para cambiar a qué server se conecta el cliente, crear un `.env` en `client/`:

```env
# client/.env
VITE_SERVER_URL=http://IP_DEL_COMPANERO:3002
```

---

## Diferencias con Fase 1

| Característica | Fase 1 | Fase 2 |
|---|---|---|
| Redis | ❌ | ✅ Pub/Sub |
| Cookies httpOnly | ❌ | ✅ |
| Sesión persistente | ❌ | ✅ (24h) |
| Multi-servidor | ❌ | ✅ |
| Mensajes en Redis | ❌ | ✅ (100 por sala) |
| Login real | ❌ | ✅ POST /api/login |
| Logout | ❌ | ✅ POST /api/logout |
