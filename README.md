# ferriStore - E-commerce de Herramientas

**Nombre del estudiante:** [Walter Ramón Nores Benítez]

---

## Descripción del E-commerce
**ferriStore** es un proyecto de interfaz de usuario (UI) para un e-commerce de ferretería y herramientas. En su estado actual (Sprint 1), se ha desarrollado una landing page estática y responsiva utilizando HTML, CSS y el framework Bootstrap, dando los primeros pasos en la identidad visual y la estructura de navegación del sitio.

---

## Público Objetivo
El diseño está orientado a:
- **Profesionales y técnicos:** Constructores, electricistas y pintores.
- **Aficionados al bricolaje:** Personas que realizan reparaciones y mejoras en el hogar.

---

## Categorías de Productos
Las categorías ya definidas en el menú de navegación del sitio son:
- Herramientas manuales
- Herramientas eléctricas y a batería
- Materiales de construcción
- Fontanería (plomería) y tuberías
- Electricidad e iluminación
- Pinturas y acabados
- Jardinería y exteriores
- Equipo de protección personal
- Cerrajería y seguridad

---

## Tecnologías Utilizadas
- **HTML5:** Estructura semántica y accesible.
- **CSS3:** Estilos personalizados y diseño responsive.
- **Bootstrap 5:** Framework para el sistema de grillas, componentes (navbar, cards, badges, modales, toasts) y utilidades.
- **Bootstrap Icons:** Iconografía vectorial para una interfaz moderna.
- **JavaScript (Vanilla):** Lógica de aplicación, manipulación del DOM, eventos, métodos de arreglos (`filter`, `find`, `forEach`, `map`, `slice`), `URLSearchParams` para la lectura de parámetros en la URL y `LocalStorage` (próximamente).

---

## Estructura General del Proyecto

```text
ferriStore/
├── index.html               # Página de inicio (landing)
├── catalogo.html            # Catálogo de productos (dinámico)
├── producto.html            # Detalle individual de producto
├── carrito.html             # Página de carrito (en desarrollo)
├── perfil.html              # Página de perfil (en desarrollo)
├── admin.html               # Panel de administración (en desarrollo)
├── css/
│   └── styles.css           # Estilos globales y personalizados
├── js/
│   ├── datos.js             # Almacena los datos de productos
│   ├── base.js              # Lógica base (inicialización, eventos globales)
│   ├── catalogo.js          # Array de productos, renderizado, filtros y búsqueda
│   └── producto.js          # Lógica para mostrar el detalle de un producto
├── assets/
│   ├── img/                 # Imágenes de productos
│   ├── icons/               # Íconos personalizados
│   └── logo/                # Logotipo de la marca
├── README.md                # Documentación del proyecto
└── .gitignore               # Archivos a ignorar en el control de versiones
```
---

## Resumen de agregados y actualizaciones:

**Sprint 1**
- Se define temática del sitio.
- Se construye la estructura de archivos y directorios.
- Se diseña la interfaz navegable y adaptable a distintos dispositivos.

**Sprint 2**
- Se generan los productos desde JavaScript.
- Se permite buscar y filtrar en el catálogo.
- Se muestra el detalle de un producto seleccionado.
- Se permite agregar los productos al carrito, quitar y modificar la cantidad, asi como calcular el total de la compra.
- Se genera persistencia de la compra en LocalStorage.

**Sprint 3**
- Se genera posibilidad de registro de usuario.
- El sistema permite iniciar y cerrar sesión (con usuario y contraseña).
- Se habilita acceso a perfil de usuario y modificar información personal.
- Desde el perfil de usuario se permite cambio de contraseña.
- Desde el perfil de usuario se permite la eliminación del usuario que inició sesión.
- Los productos mostardos en el catálogo provienen de Firestore.
- El detalle de producto se carga desde Firestore.
- Se reconstruye configuración de productos destacados en el documento index.html y posibilidad de agregar al carrito desde este documento.
- Se impide que puedan ser agregados al carrito productos por un usuario anónimo. 
