# Guía de Trabajo con Gemini y Antigravity

Como ingeniero experto, aquí tienes algunas claves para sacar el máximo partido a estas herramientas en tu flujo de trabajo (DevOps, Arquitectura, Dev).

## 1. Contexto y "Cerebro" (`.gemini/antigravity/brain`)
Antigravity mantiene un "cerebro" en tu carpeta de usuario. Los ficheros más importantes que *tú* deberías conocer y usar son:

- **`task.md`**: Es nuestra hoja de ruta viva.
    - *Tip*: Mantenlo actualizado. Si cambias de opinión sobre una tarea, dímelo para que lo actualice. Ayuda a que no pierda el hilo en sesiones largas.
- **`implementation_plan.md`**: El contrato técnico.
    - *Tip*: Antes de que yo escriba una sola línea de código, oblígame a escribirte un plan. Como arquitecto, esto te permite validar la solución (patrones, librerías) antes de la ejecución.

## 2. Configuración y Workflows (`.agent/`)
Puedes automatizar tareas repetitivas.
- **Workflows (`.agent/workflows/*.md`)**:
    - Puedes definir "recetas" o scripts paso a paso.
    - *Ejemplo*: Define un workflow `deploy-prod.md` que contenga los pasos de git, tests y comandos de despliegue. Yo puedo leerlo y ejecutarlo.
    - *Sintaxis*: Markdown simple con pasos numerados.

## 3. Agentes y Herramientas
- **Antigravity (Yo)**: Tu par principal. Tengo acceso a terminal, ficheros, y búsqueda.
- **Browser Subagent**: Puedo lanzar un navegador real para testear la web o buscar documentación actualizada.
    - *Uso*: "Verifica que la home carga y el botón vota correctamente". Yo abriré un navegador y lo comprobaré visualmente.

## 4. Recomendaciones para este Proyecto
Dado que empiezas de cero:

1.  **Iteraciones Cortas**: Pídeme "setup inicial", revisa, luego "feature X". Evita pedir "haz todo el proyecto de golpe".
2.  **Documentación como Código**: Mantén los `.md` de documentación cerca del código (como hemos hecho con `docs/`). Yo los leo para entender el "negocio".
3.  **Comandos de Slash**: Si creas un workflow llamado `test.md`, podrás decirme luego `/test` (metafóricamente) o "ejecuta el workflow de test" y yo sabré qué hacer.

## 5. Próximos pasos sugeridos
- Crear un `workflow` para el setup inicial del entorno (instalación de dependencias).
- Usar el `browser_subagent` cuando tengamos el MVP para hacer un "Smatt test" visual.
