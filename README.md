# ferriStore - E-commerce de Herramientas

**Nombre del estudiante:** [Walter Ramón Nores Benítez]
---

[Sitio web Ferristore](https://walternores.github.io/ferriStore/)

---
![ferriStore](assets/logo/ferriStore.png)
---

## Descripción del E-commerce
**ferriStore** es una plataforma de comercio electrónico completa y dinámica para la venta de ferretería y herramientas. El proyecto ha evolucionado desde una landing page estática hasta convertirse en una aplicación web integral (Full Stack simulado) que incluye autenticación de usuarios, gestión de carrito, pasarela de pagos, panel de administración y almacenamiento en la nube.

---

## Público Objetivo
El diseño está orientado a:
- **Profesionales y técnicos:** Constructores, electricistas y pintores.
- **Aficionados al bricolaje:** Personas que realizan reparaciones y mejoras en el hogar.

---

## Categorías de Productos
Las categorías se gestionan dinámicamente desde Firestore (colección `categorias`), pero el catálogo abarca:
- Herramientas manuales
- Herramientas eléctricas y a batería
- Materiales de construcción
- Fontanería y tuberías
- Electricidad e iluminación
- Pinturas y acabados
- Jardinería y exteriores
- Equipo de protección personal
- Cerrajería y seguridad

---

## Tecnologías Utilizadas
- **HTML5:** Estructura semántica y accesible.
- **CSS3:** Estilos personalizados y diseño responsive.
- **Bootstrap 5:** Framework para el sistema de grillas, componentes (navbar, cards, modales, tabs, toasts) y utilidades.
- **Bootstrap Icons:** Iconografía vectorial.
- **JavaScript (Vanilla, ES6+):** Lógica de aplicación, manipulación del DOM, métodos de arreglos, transacciones y módulos (`import/export`).
- **Firebase (v12):** 
  - **Authentication:** Registro, inicio de sesión y gestión de usuarios.
  - **Firestore:** Base de datos NoSQL en tiempo real para productos, pedidos, carritos y usuarios.
- **Cloudinary:** Servicio en la nube para el almacenamiento y optimización de imágenes (fotos de perfil y productos).
- **Git y GitHub:** Control de versiones.


---

## Estructura General del Proyecto

```text
ferriStore/
├── index.html               # Página de inicio (landing)
├── catalogo.html            # Catálogo de productos (dinámico desde Firestore)
├── producto.html            # Detalle individual de producto, comentarios y valoraciones
├── carrito.html             # Página de carrito
├── perfil.html              # Página de perfil de usuario
├── admin.html               # Panel de administración (Pedidos y Productos) con Tabs
├── pedidos.html             # Historial de pedidos del usuario
├── registrarse.html         # Registro de usuario
├── ingresar.html            # Inicio de sesión
├── firestore.rules          # Reglas de seguridad de la base de datos
├── css/
│   └── styles.css           # Estilos globales y personalizados
├── js/
│   ├── validacionesRegistro.js  # Valida contraseñas 
│   ├── showMessage.js       # Módulo para mensajes emergentes (toast)
│   ├── firebase/
│   │   ├── config.js        # Configuración de Firebase
│   │   ├── app.js           # Lógica global de sesión (navbar)
│   │   ├── catalogo.js      # Renderizado de catálogo desde Firestore
│   │   ├── producto.js      # Detalle del producto, reseñas y valoraciones
│   │   ├── carrito.js       # Lógica del carrito y transacciones de stock
│   │   ├── pedidos.js       # Historial de pedidos del usuario
│   │   ├── perfil.js        # Actualización de perfil y subida de imagen
│   │   ├── registroUsuario.js # Registro de nuevos usuarios
│   │   ├── resenias.js      # Gestión de comentarios y estrellas
│   │   ├── destacados.js    # Botones de "agregar" en el index
│   │   └── admin.js         # Lógica del panel de administración (pedidos, productos, usuarios)
├── assets/
│   ├── img/                 # Imágenes de productos
│   ├── icons/               # Íconos personalizados
│   └── logo/                # Logotipo de la marca
├── README.md                # Documentación del proyecto
└── .gitignore               # Archivos ignorados

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
- Se genera persistencia de la compra en LocalStorage (migrado luego a Firestore).

**Sprint 3**
- Autenticación: Registro, inicio y cierre de sesión con Firebase Auth.
- El sistema permite iniciar y cerrar sesión (con usuario y contraseña).
- Se habilita acceso a perfil de usuario y modificar información personal.
- Desde el perfil de usuario se permite cambio de contraseña.
- Desde el perfil de usuario se permite la eliminación del usuario que inició sesión.
- Los productos mostardos en el catálogo provienen de Firestore.
- El detalle de producto se carga desde Firestore.
- Se reconstruye configuración de productos destacados en el documento index.html y posibilidad de agregar al carrito desde este documento.
- Se impide que puedan ser agregados al carrito productos por un usuario anónimo, validando disponibilidad y stock.
- Se consigue almacenar en Firestore el pedido al ser confirmado, almacenando una colección de pedidos con la información del usuario, email, fecha, estado del pedido, y el total. Por cada pedido un array donde se almacena cada item agregado (id de producto, cantidad, precio unitario, y subtotal).
- El pedido al ser confirmado (usando transacción) mantiene actualizado el stock en Firebase de acuerdo a los productos adquiridos en los pedidos confirmados.
- El sistema permite realizar comentarios y valoraciones (1-5) del producto a usuarios que inicien sesión. 
 

**Sprint 4**
- Se define un rol para distinguir usuarios, como admin y cliente, lo que permite al primero auditar los pedidos confirmados por los clientes, y establecer su estado (pendiente, enviado, entregado, cancelado) a través de una pagina para esta finalidad.
- Cloudinary (Imágenes): Integración para la subida y actualización de fotos de perfil desde el dispositivo del usuario. El usuario que inicia sesión, en su pagina de perfil puede subir/actualizar su foto de perfil.
- Se crea la colección Categoria para mejorar el diseño, habilitar y deshabilitar productos del catálogo
- Se implementó el módulo de administración de productos dentro del panel de control (`admin.html`), utilizando **pestañas (Tabs)** de Bootstrap para separar la gestión de pedidos de la del catálogo.
- **Creación y Edición unificada:** Un solo modal permite dar de alta nuevos productos o editar los existentes, cargando automáticamente sus datos actuales.
- **Categorías dinámicas:** El selector de categorías se alimenta en tiempo real desde la colección `categorias` de Firestore, evitando tener que modificar el código HTML para agregar nuevas opciones.
- **Baja lógica:** En lugar de borrar el documento de la base de datos, se actualiza el campo `activo` a `false`. Esto oculta el producto del catálogo público, pero conserva su historial.
- **Sincronización automática:** Al guardar un producto, el estado de disponibilidad (`disponible`) se calcula automáticamente en función del stock ingresado (si el stock es 0, se marca como no disponible).

- Roles y Permisos: Implementación de roles (cliente y admin).
- Panel de Administración (admin.html):
    - Gestión de Pedidos (cambios de estado: pendiente, enviado, entregado).
    - Gestión de Productos (CRUD): Creación y edición unificada en un modal, carga de imágenes a Cloudinary, y baja lógica (activo: false).
    - Categorías Dinámicas: El selector de categorías se alimenta desde Firestore.
    - Estadísticas: Dashboard con métricas de ventas, usuarios y stock.
- Seguridad: Implementación de reglas estrictas en firestore.rules para proteger las colecciones según el rol del usuario.
- Protección de rutas: Validación en JavaScript para evitar que usuarios sin permisos accedan a admin.html.

---

## Cuentas precargadas:

- Cuenta cliente: 
  - Usuario: jrios@gmail.com
  - Password: Juliorios1

- Cuenta administrador:
  - Usuario: wnores@gmail.com
  - Password: Walternores1
---