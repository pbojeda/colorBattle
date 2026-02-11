# Producto
Producto que muestra de forma sencilla, visual y cómica la preferencia de las personas por un tema determinado. Por ejemplo, número de personas que prefieren el color rojo frente al azul o número de personas que prefieren el Real Madrid frente al Barcelona y al Atlético de Madrid. La gracia radica en que visualmente parezca que se está produciendo una batalla entre las dos opciones. Por ejemplo, si se trata de colores, se puede mostrar una imagen de un color y otra imagen de otro color y que parezca que se están atacando entre sí. 
La finalidad es conseguir un producto viral y para ello hay que conseguir que la gente quiera compartirlo con sus conocidos para que su opción coja fuerza y pueda ganar la/s otra/s opción/es.
El producto será una aplicación web y el usuario (identificado por un identificador único de su dispositivo) sólo podrá hacer un voto por categoría. 


# Flujo de interacción más frecuente
1. El usuario entra en una web
2. Vé una animación en la que se muestra la batalla entre varias opciones (mínimo 2 y máximo 5). La batalla se muestra de forma cómica y divertida, con animaciones y genera ganas de querer participar en ella y que gane su opción.
3. El usuario puede elegir una opción.
4. El usuario puede compartir la batalla en redes sociales.
5. En caso de que se haya equivocado, el usuari podrá cambiar su elección. Para ello, se le mostrará un mensaje que le indicará que puede cambiar su elección en un plazo de 24 horas.
6. En el MVP sólo habrá una categoría, pero en el futuro habrá más categorías y el usuario podrá elegir otra categoría para votar.


# Objetivos principales de este proyecto
- Aplicación web donde los usuarios puedan votar en batallas de opciones.
- Conseguir que se haga viral y que la gente quiera compartirlo con sus conocidos para que su opción coja fuerza y pueda ganar la/s otra/s opción/es.

# Componentes principales
## Aplicación frontend web para usuarios target
Una aplicación web donde los usuarios podrán ver un opciones enfrentadas y qué opción tiene más fuerza y votar en ellas.

## Aplicación backend
Una API Rest que ofrece endpoints a los frontales para que se puedan llevar a cabo las funcionalidades, que en un principio serán:
- GET de opciones votadas en función de una categoría
- POST de un voto a una categoría
- CRUD de categorías

## Base de datos
- En el MVP los datos se guardarán en un fichero JSON por categoría
- Más adelante se guardarán en una base de datos persistente.

# Requisitos funcionales
- página home que muestra los resultados de las opciones más votadas por categoría, a modo de enfrentamiento
- página home que permite votar en una categoría
- página home que permite compartir la batalla en redes sociales
- página home que permite cambiar el voto en un plazo de 24 horas
- Tras el MVP, página home que permite cambiar de categoría

# Requisitos no funcionales
- debe tener un diseño responsive
- debe prestar atención al posicionamiento SEO
- debe tener tiempos de carga lo más cortos posible
- debe ser multiidioma

# UI/UX
- Responsive
- sencilla
- orientada a generar engagement y viralidad

# Tecnologías 
## Backend MVP
- Node.js y express para la API Rest Backend

## Backend tras el MVP
- Base de datos progress sql
- Prisma como manejador de la base de datos
- Jest para test unitarios
- Cypress para test end 2 end

## Frontend
- Pendiente de decidir

## Ambas
- generación de imágenes Docker
- control de versiones con git


# Próximos pasos
1. Investigar sobre el negocio y buscar nuevas funcionalidades, requisitos funcionales y no funcionales
2. Verificar la elección de las tecnologías
3. Generar plan de desarrollo
4. Desarrollar el MVP
5. Desplegar el MVP
6. Monitorizar el MVP
7. Mejorar el MVP
