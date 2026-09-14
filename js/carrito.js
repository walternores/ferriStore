let categoriaSeleccionada = "todos";

const contenedorProductos = document.querySelector("#productos");
const contenedorCarrito = document.querySelector("#carrito");
const totalCarrito = document.querySelector("#totalCarrito");
const contadorCarrito = document.querySelector("#contadorCarrito");

const estaEnPaginaCarrito = contenedorCarrito !== null;

function formatearPrecio(valor) {
    return `$ ${valor.toLocaleString("es-UY")}`;
}


function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
}

// Devuelve la cantidad de un producto que ya está en el carrito
function obtenerCantidadEnCarrito(idProducto) {
    const carrito = obtenerCarrito();
    const item = carrito.find((i) => i.idProducto === idProducto);
    return item ? item.cantidad : 0;
}

// Devuelve el stock real disponible (stock base - lo que está en el carrito)
function calcularStockDisponible(producto) {
    return producto.stock - obtenerCantidadEnCarrito(producto.id);
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

document.addEventListener("click", (e) => {
  const boton = e.target.closest(".botonAgregar");

  if (boton) {
    const idProducto = boton.dataset.id;

    try {
      // Intenta guardar en el carrito
      agregarAlCarrito(idProducto);
      actualizarContadorCarrito();

    } catch (error) {
      console.warn("No se pudo renderizar el carrito en esta página:", error);
    }

    // Se ejecuta SÍ O SÍ y redirige a la página del carrito
    window.location.href = "./carrito.html";
  }
});


// Esta función ya está implementada como ejemplo.
function agregarAlCarrito(idProducto) {
    const carrito = obtenerCarrito();
    const producto = productos.find((p) => p.id === idProducto);
    
    if (!producto) {
        console.error("Producto no encontrado:", idProducto);
        return;
    }
    const itemExistente = carrito.find((item) => item.idProducto === idProducto);

    const stockDisponible = calcularStockDisponible(producto);

    if (stockDisponible <= 0) {
        mostrarMensaje("No hay más unidades disponibles.", "warning");
        return;
    }

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ idProducto: idProducto, cantidad: 1 });
    }

    guardarCarrito(carrito);
    // Solo actualizar UI si estamos en carrito.html
    if (estaEnPaginaCarrito) {
        mostrarCarrito();
    }
}


function aumentarCantidad(idProducto) {

    const carrito = obtenerCarrito();
    const item = carrito.find(i => i.idProducto === idProducto);
    const producto = productos.find(p => p.id === idProducto);

    if (!item || !producto) return;

    const stockDisponible = calcularStockDisponible(producto);
    if (stockDisponible > 0) {
        item.cantidad++;

        guardarCarrito(carrito);

    } else {
        mostrarMensaje("No hay más stock disponible.", "warning");
    }

}


function disminuirCantidad(idProducto) {

const carrito = obtenerCarrito();
const item = carrito.find(i => i.idProducto === idProducto);

if (!item) return;

if (item.cantidad > 1) {

    item.cantidad--;

} else {
    eliminarDelCarrito(idProducto);
}

guardarCarrito(carrito);

}


function eliminarDelCarrito(idProducto) {

let carrito = obtenerCarrito();

carrito = carrito.filter(
i => i.idProducto !== idProducto
);

guardarCarrito(carrito);

}

function calcularTotal(carrito) {
    return carrito.reduce((total, item) => {
        const producto = productos.find((p) => p.id === item.idProducto);
        if (!producto) return total;
        return total + producto.precio * item.cantidad;
    }, 0);
}

function mostrarCarrito() {
    if (!estaEnPaginaCarrito) return;

    const carrito = obtenerCarrito();
    contenedorCarrito.innerHTML = "";

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `
            <div class="empty-cart">
                <strong>Tu pedido está vacío</strong>
                <span class="small">Agregá un producto para comenzar.</span>
            </div>
        `;
    } else {
        carrito.forEach((item) => {
            const producto = productos.find((p) => p.id === item.idProducto);
            if (!producto) return;
            contenedorCarrito.innerHTML += `
                <div class="cart-item">
                    <div class="d-flex justify-content-between gap-3 mb-2">
                        <div>
                            <strong class="cart-item-name d-block">${producto.nombre}</strong>
                            <span class="small text-secondary">${formatearPrecio(producto.precio * item.cantidad)}</span>
                        </div>
                        <button class="cart-action ver" data-id="${item.idProducto}" type="button">Ver</button>
                    </div>

                    <div class="d-flex justify-content-between align-items-center gap-2">
                        <div class="quantity-control">
                            <button class="disminuir" data-id="${item.idProducto}" type="button" aria-label="Disminuir cantidad">−</button>
                            <span>${item.cantidad}</span>
                            <button class="aumentar" data-id="${item.idProducto}" type="button" aria-label="Aumentar cantidad">+</button>
                        </div>
                        <button class="cart-action eliminar" data-id="${item.idProducto}" type="button">Eliminar</button>
                    </div>
                </div>
            `;
        });
    }

    if (totalCarrito) totalCarrito.textContent = formatearPrecio(calcularTotal(carrito));
    if (contadorCarrito) contadorCarrito.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);

    conectarEventosCarrito();
}

function conectarEventosCarrito() {
    document.querySelectorAll(".aumentar").forEach((boton) => {
        boton.addEventListener("click", () => {
            aumentarCantidad(boton.dataset.id);
            mostrarCarrito();
        });
    });

    document.querySelectorAll(".disminuir").forEach((boton) => {
        boton.addEventListener("click", () => {
            disminuirCantidad(boton.dataset.id);
            mostrarCarrito();
        });
    });

    document.querySelectorAll(".eliminar").forEach((boton) => {
        boton.addEventListener("click", () => {
            eliminarDelCarrito(boton.dataset.id);
            mostrarCarrito();
        });
    });

    document.querySelectorAll(".ver").forEach((boton) => {
        boton.addEventListener("click", () => {
            verProducto(boton.dataset.id);
        });
    });
}


function verProducto(idProducto) {

window.location.href = `producto.html?id=${idProducto}`;

}

function vaciarCarrito() {
    guardarCarrito([]);
    mostrarCarrito();
}

function confirmarPedido() {
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        mostrarMensaje("Agregá al menos un producto antes de confirmar.", "warning");
        return;
    }

    vaciarCarrito();
    mostrarMensaje("Pedido confirmado correctamente.", "success");
}

function mostrarMensaje(texto, tipo) {
    const mensaje = document.querySelector("#mensaje");
    if (mensaje) {
        mensaje.textContent = texto;
        mensaje.className = `alert alert-${tipo} mt-3 mb-0`;
    }
}

const btnIrCarrito = document.querySelector("#btnIrCarrito");
if (btnIrCarrito) {
    btnIrCarrito.addEventListener("click", () => {
        const panel = document.querySelector("#carritoPanel");
        if (panel) {
            panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    });
}

const btnVaciar = document.querySelector("#btnVaciar");
if (btnVaciar) {
    btnVaciar.addEventListener("click", vaciarCarrito);
}

const btnConfirmar = document.querySelector("#btnConfirmar");
if (btnConfirmar) {
    btnConfirmar.addEventListener("click", confirmarPedido);
}


if (estaEnPaginaCarrito) {
    mostrarCarrito();
}

function actualizarContadorCarrito() {
    const contador = document.querySelector("#contadorCarrito");
    if (!contador) return; // Si no hay contador en esta página, no hacemos nada

    const carrito = obtenerCarrito();
    const total = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    contador.textContent = total;
}

actualizarContadorCarrito();

// Si estamos en carrito.html, mostramos todo el carrito
if (estaEnPaginaCarrito) {
    mostrarCarrito();
}