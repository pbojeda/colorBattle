# Knowledge Artifact: MVP-v5 Context 🧠

Este documento sirve como puente para futuros contextos de IA, resumiendo el estado técnico y funcional del proyecto tras completar la Fase 5.

## 🏁 Estado Actual: Fase 5 (Social & Real-time) Completada

### 🏛️ Arquitectura de Sockets
- **Namespace Global**: Se utiliza el namespace raíz de Socket.io.
- **Rooms**: Cada cliente se une a una sala con el nombre del `battleId` al cargar `BattlePage.jsx`.
- **Eventos Clave**:
    - `join_battle`: Emitido por el frontend con el `battleId`.
    - `vote_update`: Emitido por el backend cuando cambian los porcentajes.
    - `chat:new_message`: Retransmite comentarios nuevos a los usuarios de la sala.
    - `battle:new_reaction`: Retransmite reacciones (emojis) a los usuarios de la sala.

### 👤 Gestión de Identidad (Sin Login)
- Se utiliza `FingerprintJS` en el frontend para generar un `visitorId`.
- Este ID se envía en cada voto, mensaje y reacción como el campo `fingerprint`.
- **Validación de Nickname**: El backend permite que un usuario (`fingerprint`) use el mismo nombre infinitamente, pero bloquea si alguien más intenta usar ese nombre en la misma batalla.

### 🎨 Diseño y UX
- **Theme System**: El objeto `battleData.theme` (generado por Gemini) dicta los colores. El `Chat.jsx` y `BattleArena.jsx` consumen estos colores dinámicamente.
- **Framer Motion**: Se usa `layout` prop para reordenamientos suaves y `AnimatePresence` para entradas/salidas de chats y reacciones.
- **Z-Index Strategy**:
    - Arena: Capa base.
    - Reacciones Flotantes: `z-[1000]` (máxima visibilidad).
    - Chat Button: `z-[100]` (esquina inferior derecha).
    - Chat Window: `z-[100]` (dentro del mismo contenedor del botón).

### 🛠️ Puntos Críticos / "Gotchas"
- **Canvas en Backend**: Requiere `libpng`, `jpeg`, etc., instalados en el sistema si se despliega en un entorno Linux crudo.
- **Caso de Nickname**: El campo `fingerprint` en el modelo `Comment` debe tener `select: true` (o quitar `select: false`) si se va a usar para comparaciones directas en queries de Mongoose sin `.select('+fingerprint')`.
- **RegEx de Nickname**: Se usa `^...$` con flag `i` para evitar colisiones de mayúsculas/minúsculas.

## 🔗 Endpoints de Interés
- `GET /api/battle/:id`: Datos de la batalla + voto del usuario actual.
- `POST /api/battle/:id/vote`: Registrar voto.
- `GET /api/battles/:id/comments`: Historial de chat.
- `POST /api/battles/:id/comments`: Enviar mensaje.
- `POST /api/battles/:id/reactions`: Registrar reacción.
- `GET /api/battle/:id/meme`: Generar imagen de meme.
