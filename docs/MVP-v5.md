# ColorBattle MVP-v5: Social & Real-Time 🚀

Esta versión transforma la experiencia estática en una red social viva, permitiendo a los usuarios interactuar en tiempo real mientras compiten.

## 🌟 Nuevas Funcionalidades

### 1. Chat en Vivo (Real-Time Social)
- **Qué es**: Un sistema de chat integrado directamente en la arena de batalla.
- **Identidad**: 
    - Los usuarios pueden elegir un apodo o dejar que el sistema genere uno gracioso basado en su equipo (ej: *WarriorRojo_42*).
    - El sistema reconoce automáticamente al usuario mediante su `fingerprint` única, evitando que otros roben su apodo en la misma batalla.
- **Estética Ultra-Premium**: 
    - Diseño con **Glassmorphism** (fondos translúcidos con desenfoque).
    - **Identidad de Equipo**: Los mensajes muestran el color del bando al que el usuario ha votado (borde brillante y punto de color).
    - Animaciones fluidas de entrada y salida de mensajes.

### 2. Barra de Reacciones Dinámica
- **Qué es**: Una barra vertical lateral que permite lanzar emojis al campo de batalla.
- **Efectos Visuales**: Al reaccionar, el emoji aparece en tamaño gigante y flota desde la parte inferior hasta la superior con efectos de rotación y escala, visible para todos los usuarios en tiempo real.
- **UX Optimizada**: Posicionada lateralmente para no tapar los elementos de votación en dispositivos móviles.

### 3. Animaciones de Impacto (Voto de Empuje)
- **Interactividad Física**: Votar ahora se siente "poderoso". Al elegir una opción, la barra de ese bando realiza un **movimiento de empuje agresivo**, desplazando visualmente al oponente antes de estabilizarse en el porcentaje real de la base de datos.
- **Sonido y Confeti**: Se ha mantenido la integración de sonidos de victoria y lluvia de confeti del color del equipo ganador.

### 4. Optimizaciones de UI Móvil
- **Layout Inteligente**: El chat se ha posicionado en la esquina inferior derecha con un `z-index` superior para ser siempre accesible.
- **Acceso Directo**: Botón flotante minimalista para abrir/cerrar el chat sin interrumpir la visualización de la batalla.

## 🛠️ Detalles Técnicos

### Backend
- **Nuevos Modelos**: `Comment.js` y `Reaction.js` en Mongoose.
- **Sockets**: Integración profunda con `Socket.io` para transmitir mensajes y reacciones instantáneamente a todos los clientes suscritos al `battleId`.
- **Validación de Nickname**: Lógica robusta en `SocialController.js` que utiliza el `fingerprint` para permitir que el mismo usuario reutilice su nombre en múltiples sesiones/mensajes sin conflictos.

### Frontend
- **Socket Client**: Conexión estable con el servidor enviando el `battleId` al unirse.
- **Framer Motion**: Uso extensivo de `AnimatePresence` y componentes `motion` para lograr la sensación premium.
- **Z-Index Management**: Ajuste de capas para asegurar que los emojis flotantes no interfieran con la interacción de los botones pero sean visualmente llamativos.

## 🚀 Instalación y Despliegue (v5)

### Backend
1.  **Variables de Entorno**: Asegurarse de que `MONGODB_URI` y `PORT` estén configurados.
2.  **Servicios**: El servidor ahora gestiona tanto API REST como Websockets.

### Frontend
1.  **VITE_API_URL**: Debe apuntar al servidor backend para las llamadas de API y Sockets.

---

## 🔮 Próximos Pasos (v6)
- **Sistema de Logros**: Medallas por cantidad de votos o reacciones lanzadas.
- **Moderación IA**: Uso de Gemini para filtrar comentarios ofensivos automáticamente.
