# ChatMSG — Fase 1

App de mensajería en tiempo real. React + Express + Socket.IO, **sin Redis, sin persistencia, sin cookies httpOnly**.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite |
| Backend | Express 4 + Socket.IO 4 |
| Comunicación | WebSockets (socket.io) |
| Persistencia | ❌ Solo en memoria (se borra al reiniciar) |
| Redis | ❌ No aplica en Fase 1 |
| Cookies | ❌ Sin httpOnly en Fase 1 |

## Estructura

```
ChatMSG_Fase1/
├── server/
│   ├── index.js       ← Express + Socket.IO
│   └── package.json
└── client/
    ├── src/
    │   ├── App.jsx    ← UI principal
    │   ├── socket.js  ← Singleton de socket
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Cómo correr el proyecto

### 1. Instalar dependencias

```bash
# Terminal 1 — Backend
cd server
npm install

# Terminal 2 — Frontend
cd client
npm install
```

### 2. Levantar los servidores

```bash
# Terminal 1 — Backend (puerto 3001)
cd server
npm run dev        # con nodemon (recarga automática)
# o
npm start          # sin nodemon

# Terminal 2 — Frontend (puerto 5173)
cd client
npm run dev
```

### 3. Abrir en el navegador

```
http://localhost:5173
```

Puedes abrir múltiples pestañas/ventanas con distintos usuarios para probar el chat en tiempo real.

## Funcionalidades

- **Login** con nombre de usuario (solo en memoria)
- **Sala "General"** creada automáticamente al iniciar
- **Crear salas** personalizadas desde el sidebar
- **Mensajería en tiempo real** vía WebSockets
- **Historial por sesión** (máximo 100 mensajes por sala, se borra al reiniciar)
- **Notificaciones** de entrada/salida de usuarios
- **Contador de usuarios** por sala

## Eventos Socket.IO

| Evento (emit) | Dirección | Descripción |
|---------------|-----------|-------------|
| `register` | client → server | Registra username |
| `join_room` | client → server | Unirse a una sala |
| `create_room` | client → server | Crear sala nueva |
| `send_message` | client → server | Enviar mensaje |
| `registered` | server → client | Confirmación + lista de salas |
| `room_history` | server → client | Historial al unirse |
| `new_message` | server → room | Nuevo mensaje broadcast |
| `user_joined` | server → room | Notificación de entrada |
| `user_left` | server → room | Notificación de salida |
| `room_created` | server → all | Nueva sala disponible |
