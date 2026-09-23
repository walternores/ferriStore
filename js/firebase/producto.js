// js/producto.js
import { db } from "./config.js";
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { calcularStockDisponible, carritoListo  } from "./carrito.js";

// =====================================================
// ELEMENTOS DEL DOM
// =====================================================
const contenedorDetalle = document.querySelector("#detalle");
const mensajeError = document.querySelector("#mensajeError");

const imagen = document.querySelector("#imagenDetalle");
const nombre = document.querySelector("#nombreDetalle");
const categoria = document.querySelector("#categoriaDetalle");
const precio = document.querySelector("#precioDetalle");
const disponible = document.querySelector("#disponibleDetalle");
const stock = document.querySelector("#stockDetalle");

const fichaNombre = document.querySelector("#fichaNombre");
const fichaCategoria = document.querySelector("#fichaCategoria");
const fichaStock = document.querySelector("#fichaStock");

// =====================================================
// LEER EL ID DE LA URL
// =====================================================
const parametros = new URLSearchParams(window.location.search);
const idProducto = parametros.get("id");

// =====================================================
// CARGAR PRODUCTO DESDE FIRESTORE
// =====================================================

// Variable global para recordar el producto cargado
let productoActual = null;

async function cargarProducto() {
    const cargandoDetalle = document.querySelector("#cargandoDetalle");

    if (!idProducto) {
        if (cargandoDetalle) cargandoDetalle.classList.add("d-none");
        mostrarError();
        return;
    }

    try {
        if (cargandoDetalle) cargandoDetalle.classList.remove("d-none");

        // Usamos doc() para traer solo el documento específico (más eficiente)
        const productoRef = doc(db, "producto", idProducto);
        const productoSnap = await getDoc(productoRef);

        if (productoSnap.exists()) {
            // 🔥 Guardamos el producto en la variable global
            productoActual = { id: productoSnap.id, ...productoSnap.data() };
            mostrarDetalle(productoActual);
        } else {
            console.warn("No existe el producto con id:", idProducto);
            mostrarError();
        }

    } catch (error) {
        console.error("Error al cargar el producto:", error);
        mostrarError();
    } finally {
        if (cargandoDetalle) cargandoDetalle.classList.add("d-none");
    }
}

// =====================================================
// MOSTRAR EL DETALLE EN EL DOM
// =====================================================
function mostrarDetalle(producto) {
    try {
        // Re-consultamos el botón cada vez (por si fue reemplazado)
        const botonAgregar = document.querySelector(".botonAgregar");

        imagen.src = producto.imagen || "assets/img/default.jpg";
        imagen.alt = producto.nombre || "Producto";
        nombre.textContent = producto.nombre || "Sin nombre";
        categoria.textContent = producto.categoria || "General";
        precio.textContent = `$${Number(producto.precio || 0).toFixed(2)}`;

        // Stock disponible real
        const stockDisponible = typeof calcularStockDisponible === "function"
            ? calcularStockDisponible(producto)
            : (producto.stock || 0);

        disponible.textContent = (producto.disponible !== false && stockDisponible > 0)
            ? "Disponible"
            : "Sin stock";

        stock.textContent = `Stock disponible: ${stockDisponible}`;

        // Actualizar el botón
        if (botonAgregar) {
            botonAgregar.dataset.id = producto.id;

            if (stockDisponible <= 0) {
                botonAgregar.disabled = true;
                botonAgregar.innerHTML = "Sin stock disponible";
            } else {
                botonAgregar.disabled = false;
                botonAgregar.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16">
                        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"></path>
                    </svg>
                    Agregar al carrito
                `;
            }
        }

        // Ficha técnica (opcional)
        if (fichaNombre) fichaNombre.textContent = producto.nombre || "-";
        if (fichaCategoria) fichaCategoria.textContent = producto.categoria || "-";
        if (fichaStock) fichaStock.textContent = stockDisponible;

        // Mostrar la sección de detalle
        contenedorDetalle.classList.remove("d-none");

    } catch (e) {
        console.error("Error actualizando textos:", e);
    }
}

// =====================================================
// MOSTRAR MENSAJE DE ERROR
// =====================================================
function mostrarError() {
    mensajeError.classList.remove("d-none");
    contenedorDetalle.classList.add("d-none");
}

// =====================================================
// INICIALIZAR
// =====================================================
cargarProducto();

// Actualizar el stock mostrado cuando se hace clic en "Agregar al carrito"
// Usamos un listener global porque el botón puede ser reemplazado
document.addEventListener("click", (e) => {
    if (e.target.closest(".botonAgregar")) {
        setTimeout(() => {
            // Volvemos a cargar el producto para reflejar el nuevo stock
            cargarProducto();
        }, 200);
    }
});



// Escuchar cambios del carrito para actualizar el stock mostrado
document.addEventListener("carritoActualizado", () => {
    if (productoActual) {
        mostrarDetalle(productoActual);
    }
});