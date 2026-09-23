// js/destacados.js
import { db } from "./config.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import { calcularStockDisponible, carritoListo } from "./carrito.js";

const HTML_BOTON_AGREGAR = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16">
        <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2"></path>
    </svg>
`;

// =====================================================
// AJUSTAR BOTONES DESTACADOS SEGÚN STOCK
// =====================================================
async function ajustarBotonesDestacados() {
    const botones = document.querySelectorAll(".botonAgregar[data-id]");
    if (botones.length === 0) return;

    try {
        await carritoListo;

        const productosRef = collection(db, "producto");
        const snapshot = await getDocs(productosRef);

        // Mapa de productos: { "p1": {...}, "p2": {...} }
        const productosPorId = {};
        snapshot.forEach((doc) => {
            productosPorId[doc.id] = { id: doc.id, ...doc.data() };
        });

        botones.forEach((boton) => {
            const id = boton.dataset.id;
            const producto = productosPorId[id];

            if (!producto || producto.activo === false) {
                deshabilitarBoton(boton, "No disponible");
                return;
            }

            // Stock disponible: si carrito.js ya está cargado, usa la función
            const stockDisponible = calcularStockDisponible(producto);

            if (producto.disponible === false || stockDisponible <= 0) {
                deshabilitarBoton(boton, "Sin stock");
            } else {
                boton.disabled = false;
                boton.classList.remove("btn-secondary");
                boton.classList.add("btn-warning");
                boton.innerHTML = HTML_BOTON_AGREGAR;
                boton.setAttribute("aria-label", "Agregar al carrito");
            }
        });

    } catch (error) {
        console.error("Error al ajustar botones destacados:", error);
    }
}

function deshabilitarBoton(boton, texto) {
    boton.disabled = true;
    boton.classList.remove("btn-warning");
    boton.classList.add("btn-secondary");
    boton.innerHTML = texto;
    boton.setAttribute("aria-label", texto);
}

// Re-ejecutar cuando el carrito cambie (agregar/eliminar/aumentar/disminuir)
document.addEventListener("carritoActualizado", ajustarBotonesDestacados);

// =====================================================
// INICIALIZACIÓN
// =====================================================
ajustarBotonesDestacados();