// js/carrito.js
import { db, auth } from "./config.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import { showMessage } from "../showMessage.js";
// =====================================================
// ESTADO GLOBAL
// =====================================================
let usuarioActual = null;
let carritoActual = [];           // [{ idProducto, cantidad }, ...]
let todosLosProductosCache = {};  // Cache de productos para evitar N+1 consultas

// Elementos del DOM
const contenedorCarrito = document.querySelector("#carrito");
const totalCarrito = document.querySelector("#totalCarrito");
const contadorCarrito = document.querySelector("#contadorCarrito");
const estaEnPaginaCarrito = contenedorCarrito !== null;

// Spinner de carga
const cargandoCarrito = document.querySelector("#cargandoCarrito");

let resolverCarritoListo;

export const carritoListo = new Promise((resolve) => {
    resolverCarritoListo = resolve;
});

// =====================================================
// UTILIDADES
// =====================================================
function formatearPrecio(valor) {
    return `$ ${Number(valor || 0).toLocaleString("es-UY")}`;
}


// Devuelve el stock disponible real (stock base - cantidad en carrito)
export function calcularStockDisponible(producto) {
    const item = carritoActual.find((i) => i.idProducto === producto.id);
    const enCarrito = item ? item.cantidad : 0;
    return (producto.stock || 0) - enCarrito;
}

// =====================================================
// CARGAR EL CARRITO DESDE FIRESTORE
// =====================================================
async function cargarCarritoDesdeFirestore() {
    if (!usuarioActual) {
        carritoActual = [];
        return;
    }

    try {

        // Mostramos el spinner al iniciar
        if (cargandoCarrito) cargandoCarrito.classList.remove("d-none");

        const itemsRef = collection(db, "carrito", usuarioActual.uid, "items");
        const snapshot = await getDocs(itemsRef);

        carritoActual = [];
        snapshot.forEach((doc) => {
            carritoActual.push({
                idProducto: doc.id,
                cantidad: doc.data().cantidad || 1
            });
        });
    } catch (error) {
        console.error("Error al cargar el carrito:", error);
        carritoActual = [];
    }finally {
        // Ocultamos el spinner SIEMPRE (éxito o error)
        if (cargandoCarrito) cargandoCarrito.classList.add("d-none");
    }
}

// =====================================================
// CARGAR PRODUCTOS EN CACHÉ (para el carrito)
// =====================================================
async function cargarProductosEnCache() {
    try {
        const productosRef = collection(db, "producto");
        const snapshot = await getDocs(productosRef);

        todosLosProductosCache = {};
        snapshot.forEach((doc) => {
            todosLosProductosCache[doc.id] = { id: doc.id, ...doc.data() };
        });
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// =====================================================
// AGREGAR AL CARRITO
// =====================================================
async function agregarAlCarrito(idProducto) {

    if (!usuarioActual) {
        // Mostramos un toast visible en cualquier página
        showMessage("Inicia sesión para agregar productos al carrito.", "warning");

        // Esperamos un poco más para que el usuario lea el mensaje
        setTimeout(() => {
            window.location.href = "ingresar.html";
        }, 3000);

        return;
    }


    // Validamos que el producto exista y tenga stock
    const productoRef = doc(db, "producto", idProducto);
    const productoSnap = await getDoc(productoRef);

    if (!productoSnap.exists()) {
        showMessage("El producto no existe.", "warning");
        return;
    }

    const producto = { id: productoSnap.id, ...productoSnap.data() };
    const stockDisponible = calcularStockDisponible(producto);

    if (producto.disponible === false || stockDisponible <= 0) {
        showMessage("No hay más unidades disponibles.", "warning");
        return;
    }

    try {
        const itemRef = doc(db, "carrito", usuarioActual.uid, "items", idProducto);
        const itemSnap = await getDoc(itemRef);

        if (itemSnap.exists()) {
            await updateDoc(itemRef, {
                cantidad: (itemSnap.data().cantidad || 0) + 1
            });
        } else {
            await setDoc(itemRef, { cantidad: 1 });
        }

        // Refrescamos el estado local
        await cargarCarritoDesdeFirestore();
        actualizarContadorCarrito();

        if (estaEnPaginaCarrito) {
            await mostrarCarrito();
        }

        // Avisamos que el carrito cambió
        document.dispatchEvent(new CustomEvent("carritoActualizado"));
        showMessage("Producto agregado al carrito.", "success");

    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        showMessage("No se pudo agregar el producto.", "error");
    }
}

// =====================================================
// AUMENTAR / DISMINUIR / ELIMINAR
// =====================================================
async function aumentarCantidad(idProducto) {
    if (!usuarioActual) return;

    const item = carritoActual.find(i => i.idProducto === idProducto);
    if (!item) return;

    // Cargamos el producto para saber su stock real
    const producto = todosLosProductosCache[idProducto] 
        || (await getDoc(doc(db, "producto", idProducto))).data();

    if (!producto) return;

    const stockDisponible = (producto.stock || 0) - item.cantidad;

    if (stockDisponible <= 0) {
        showMessage("No hay más stock disponible.", "warning");
        return;
    }

    try {
        const itemRef = doc(db, "carrito", usuarioActual.uid, "items", idProducto);
        await updateDoc(itemRef, { cantidad: item.cantidad + 1 });

        await cargarCarritoDesdeFirestore();
        actualizarContadorCarrito();
        await mostrarCarrito();

        document.dispatchEvent(new CustomEvent("carritoActualizado"));

    } catch (error) {
        console.error("Error al aumentar cantidad:", error);
    }
}

async function disminuirCantidad(idProducto) {
    if (!usuarioActual) return;

    const item = carritoActual.find(i => i.idProducto === idProducto);
    if (!item) return;

    try {
        if (item.cantidad > 1) {
            const itemRef = doc(db, "carrito", usuarioActual.uid, "items", idProducto);
            await updateDoc(itemRef, { cantidad: item.cantidad - 1 });
        } else {
            await eliminarDelCarrito(idProducto);
            return;
        }

        await cargarCarritoDesdeFirestore();
        actualizarContadorCarrito();
        await mostrarCarrito();

        document.dispatchEvent(new CustomEvent("carritoActualizado"));
    
    } catch (error) {
        console.error("Error al disminuir cantidad:", error);
    }
}

async function eliminarDelCarrito(idProducto) {
    if (!usuarioActual) return;

    try {
        const itemRef = doc(db, "carrito", usuarioActual.uid, "items", idProducto);
        await deleteDoc(itemRef);

        await cargarCarritoDesdeFirestore();
        actualizarContadorCarrito();
        await mostrarCarrito();

        document.dispatchEvent(new CustomEvent("carritoActualizado"));

    } catch (error) {
        console.error("Error al eliminar del carrito:", error);
    }
}

// =====================================================
// TOTAL Y RENDERIZADO
// =====================================================
function calcularTotal() {
    return carritoActual.reduce((total, item) => {
        const producto = todosLosProductosCache[item.idProducto];
        if (!producto) return total;
        return total + (producto.precio || 0) * item.cantidad;
    }, 0);
}

export function obtenerCarritoActual() {
    return carritoActual;
}

async function mostrarCarrito() {
    if (!estaEnPaginaCarrito) return;

    // Aseguramos que tenemos los productos en caché
    if (Object.keys(todosLosProductosCache).length === 0) {
        await cargarProductosEnCache();
    }

    contenedorCarrito.innerHTML = "";

    if (carritoActual.length === 0) {
        contenedorCarrito.innerHTML = `
            <div class="empty-cart">
                <strong>Tu pedido está vacío</strong>
                <span class="small">Agregá un producto para comenzar.</span>
            </div>
        `;
    } else {
        carritoActual.forEach((item) => {
            const producto = todosLosProductosCache[item.idProducto];
            if (!producto) return;
            
            const precioUnitario = producto.precio || 0;
            const subtotal = precioUnitario * item.cantidad;
            
            contenedorCarrito.innerHTML += `
                <div class="cart-item">
                    <div class="d-flex justify-content-between gap-3 mb-2">
                        <div>
                            <strong class="cart-item-name d-block">${producto.nombre}</strong>
                            <span class="badge rounded-pill text-bg-warning mb-2">P.Un. ${formatearPrecio(precioUnitario)}</span>
                    
                            <span class="small text-secondary">${formatearPrecio(subtotal)}</span>
                        </div>
                        <button class="cart-action ver" data-id="${item.idProducto}" type="button">Ver</button>
                    </div>

                    <div class="d-flex justify-content-between align-items-center gap-2">
                        <div class="quantity-control">
                            <button class="disminuir" data-id="${item.idProducto}" type="button">−</button>
                            <span>${item.cantidad}</span>
                            <button class="aumentar" data-id="${item.idProducto}" type="button">+</button>
                        </div>
                        <button class="cart-action eliminar" data-id="${item.idProducto}" type="button">Eliminar</button>
                    </div>
                </div>
            `;
        });
    }

    if (totalCarrito) totalCarrito.textContent = formatearPrecio(calcularTotal());
    if (contadorCarrito) contadorCarrito.textContent = carritoActual.reduce((suma, i) => suma + i.cantidad, 0);

    conectarEventosCarrito();
}

function conectarEventosCarrito() {
    document.querySelectorAll(".aumentar").forEach((boton) => {
        boton.addEventListener("click", () => aumentarCantidad(boton.dataset.id));
    });

    document.querySelectorAll(".disminuir").forEach((boton) => {
        boton.addEventListener("click", () => disminuirCantidad(boton.dataset.id));
    });

    document.querySelectorAll(".eliminar").forEach((boton) => {
        boton.addEventListener("click", () => eliminarDelCarrito(boton.dataset.id));
    });

    document.querySelectorAll(".ver").forEach((boton) => {
        boton.addEventListener("click", () => {
            window.location.href = `producto.html?id=${boton.dataset.id}`;
        });
    });
}

// =====================================================
// VACIAR / CONFIRMAR
// =====================================================
async function vaciarCarrito() {
    if (!usuarioActual) return;

    try {
        // Eliminamos todos los items
        for (const item of carritoActual) {
            const itemRef = doc(db, "carrito", usuarioActual.uid, "items", item.idProducto);
            await deleteDoc(itemRef);
        }

        carritoActual = [];
        actualizarContadorCarrito();
        await mostrarCarrito();

        document.dispatchEvent(new CustomEvent("carritoActualizado"));

    } catch (error) {
        console.error("Error al vaciar carrito:", error);
    }
}

async function confirmarPedido() {
    if (carritoActual.length === 0) {
        showMessage("Agregá al menos un producto antes de confirmar.", "warning");
        return;
    }

    await vaciarCarrito();
    showMessage("Pedido confirmado correctamente.", "success");
}

// =====================================================
// CONTADOR DEL NAVBAR (todas las páginas)
// =====================================================
function actualizarContadorCarrito() {
    const contador = document.querySelector("#contadorCarrito");
    if (!contador) return;

    const total = carritoActual.reduce((suma, item) => suma + item.cantidad, 0);
    contador.textContent = total;
}

// =====================================================
// LISTENER GLOBAL: AGREGAR AL CARRITO
// =====================================================
document.addEventListener("click", async (e) => {
    const boton = e.target.closest(".botonAgregar");
    if (!boton) return;

    const idProducto = boton.dataset.id;
    if (!idProducto) return;

    await agregarAlCarrito(idProducto);
});

// =====================================================
// BOTONES ESPECÍFICOS DE carrito.html
// =====================================================
const btnIrCarrito = document.querySelector("#btnIrCarrito");
if (btnIrCarrito) {
    btnIrCarrito.addEventListener("click", () => {
        const panel = document.querySelector("#carritoPanel");
        if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
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

// =====================================================
// INICIALIZACIÓN: escuchar cambios de sesión
// =====================================================
onAuthStateChanged(auth, async (user) => {
    usuarioActual = user;

    if (user) {
        await cargarCarritoDesdeFirestore();
    } else {
        carritoActual = [];
    }

    actualizarContadorCarrito();

    // Avisamos que el carrito está listo y que cambió
    document.dispatchEvent(new CustomEvent("carritoActualizado"));
    if (resolverCarritoListo) resolverCarritoListo();

    if (estaEnPaginaCarrito) {
        await mostrarCarrito();
    }
});
