// js/adminPedidos.js
import { db, auth } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { showMessage } from "../showMessage.js";

// =====================================================
// ELEMENTOS DEL DOM
// =====================================================
const cargando = document.querySelector("#cargando");
const sinPermiso = document.querySelector("#sinPermiso");
const sinPedidos = document.querySelector("#sinPedidos");
const listadoPedidos = document.querySelector("#listadoPedidos");
const contadorPedidos = document.querySelector("#contadorPedidos");
const buscador = document.querySelector("#buscador");
const filtroEstado = document.querySelector("#filtroEstado");
const btnLimpiar = document.querySelector("#btnLimpiar");

// =====================================================
// ESTADO GLOBAL
// =====================================================
let todosLosPedidos = [];
let esAdmin = false;

// =====================================================
// VERIFICAR SI EL USUARIO ES ADMIN
// =====================================================
async function verificarAdmin(user) {
    try {
        const userRef = doc(db, "usuario", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().rol === "admin") {
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error al verificar admin:", error);
        return false;
    }
}

// =====================================================
// FORMATEAR FECHA Y PRECIO
// =====================================================
function formatearFecha(timestamp) {
    if (!timestamp) return "Sin fecha";
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString("es-UY", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatearPrecio(valor) {
    return `$ ${Number(valor || 0).toLocaleString("es-UY")}`;
}

// =====================================================
// BADGE DE ESTADO
// =====================================================
function badgeEstado(estado) {
    const mapa = {
        pendiente: "text-bg-warning",
        enviado: "text-bg-info",
        entregado: "text-bg-success",
        cancelado: "text-bg-danger"
    };
    const clase = mapa[estado] || "text-bg-secondary";
    return `<span class="badge ${clase} text-capitalize">${estado}</span>`;
}

// =====================================================
// CARGAR PEDIDOS DESDE FIRESTORE
// =====================================================
async function cargarPedidos() {
    cargando.classList.remove("d-none");
    sinPedidos.classList.add("d-none");
    listadoPedidos.classList.add("d-none");

    try {
        const pedidosRef = collection(db, "pedido");
        const q = query(pedidosRef, orderBy("fecha", "desc"));
        const snapshot = await getDocs(q);

        todosLosPedidos = [];
        snapshot.forEach((doc) => {
            todosLosPedidos.push({ id: doc.id, ...doc.data() });
        });

        cargando.classList.add("d-none");
        renderizarPedidos();

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        cargando.classList.add("d-none");
        showMessage("No se pudieron cargar los pedidos.", "error");
    }
}

// =====================================================
// RENDERIZAR PEDIDOS CON FILTROS
// =====================================================
function renderizarPedidos() {
    const textoBusqueda = buscador.value.trim().toLowerCase();
    const estadoSeleccionado = filtroEstado.value;

    // Filtrar
    const pedidosFiltrados = todosLosPedidos.filter((pedido) => {
        const coincideTexto = !textoBusqueda ||
            pedido.id.toLowerCase().includes(textoBusqueda) ||
            (pedido.email || "").toLowerCase().includes(textoBusqueda);

        const coincideEstado = estadoSeleccionado === "todos" ||
            pedido.estado === estadoSeleccionado;

        return coincideTexto && coincideEstado;
    });

    contadorPedidos.textContent = pedidosFiltrados.length;
    listadoPedidos.innerHTML = "";

    if (pedidosFiltrados.length === 0) {
        sinPedidos.classList.remove("d-none");
        listadoPedidos.classList.add("d-none");
        return;
    }

    sinPedidos.classList.add("d-none");
    listadoPedidos.classList.remove("d-none");

    pedidosFiltrados.forEach((pedido, index) => {
        const idCorto = pedido.id.slice(0, 8).toUpperCase();

        // Items del pedido
        const itemsHtml = (pedido.items || []).map((item) => `
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                    <strong class="d-block">${item.nombre}</strong>
                    <small class="text-secondary">${formatearPrecio(item.precio)} × ${item.cantidad}</small>
                </div>
                <span class="fw-bold">${formatearPrecio(item.subtotal)}</span>
            </div>
        `).join("");

        listadoPedidos.innerHTML += `
            <div class="accordion-item border-0 shadow-sm mb-3 rounded overflow-hidden">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#pedido-${index}">
                        <div class="d-flex flex-wrap justify-content-between align-items-center w-100 me-3 gap-2">
                            <div>
                                <strong class="d-block">Pedido #${idCorto}</strong>
                                <small class="text-secondary">${pedido.email || "Sin email"} · ${formatearFecha(pedido.fecha)}</small>
                            </div>
                            <div class="d-flex align-items-center gap-3">
                                ${badgeEstado(pedido.estado || "pendiente")}
                                <strong class="fs-5">${formatearPrecio(pedido.total)}</strong>
                            </div>
                        </div>
                    </button>
                </h2>
                <div id="pedido-${index}" class="accordion-collapse collapse" data-bs-parent="#listadoPedidos">
                    <div class="accordion-body bg-white">

                        <h6 class="text-uppercase text-secondary mb-3">Detalle del pedido</h6>
                        ${itemsHtml}
                        <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                            <strong class="fs-5">Total</strong>
                            <strong class="fs-4 text-warning">${formatearPrecio(pedido.total)}</strong>
                        </div>

                        <hr class="my-4">

                        <h6 class="text-uppercase text-secondary mb-3">Cambiar estado</h6>
                        <div class="d-flex flex-wrap gap-2">
                            <button class="btn btn-warning btn-sm btn-estado" 
                                    data-id="${pedido.id}" data-estado="pendiente">
                                <i class="bi bi-clock"></i> Pendiente
                            </button>
                            <button class="btn btn-info btn-sm btn-estado" 
                                    data-id="${pedido.id}" data-estado="enviado">
                                <i class="bi bi-truck"></i> Enviado
                            </button>
                            <button class="btn btn-success btn-sm btn-estado" 
                                    data-id="${pedido.id}" data-estado="entregado">
                                <i class="bi bi-check-circle"></i> Entregado
                            </button>
                            <button class="btn btn-danger btn-sm btn-estado" 
                                    data-id="${pedido.id}" data-estado="cancelado">
                                <i class="bi bi-x-circle"></i> Cancelado
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        `;
    });

    conectarBotonesEstado();
}

// =====================================================
// CAMBIAR ESTADO DEL PEDIDO
// =====================================================
function conectarBotonesEstado() {
    document.querySelectorAll(".btn-estado").forEach((boton) => {
        boton.addEventListener("click", async () => {
            const pedidoId = boton.dataset.id;
            const nuevoEstado = boton.dataset.estado;

            try {
                boton.disabled = true;
                const pedidoRef = doc(db, "pedido", pedidoId);
                await updateDoc(pedidoRef, { estado: nuevoEstado });

                // Actualizamos en el array local
                const pedido = todosLosPedidos.find((p) => p.id === pedidoId);
                if (pedido) pedido.estado = nuevoEstado;

                showMessage(`Pedido actualizado a "${nuevoEstado}".`, "success");
                renderizarPedidos();

            } catch (error) {
                console.error("Error al cambiar estado:", error);
                showMessage("No se pudo cambiar el estado: " + error.message, "error");
                boton.disabled = false;
            }
        });
    });
}

// =====================================================
// FILTROS
// =====================================================
buscador.addEventListener("input", renderizarPedidos);
filtroEstado.addEventListener("change", renderizarPedidos);

btnLimpiar.addEventListener("click", () => {
    buscador.value = "";
    filtroEstado.value = "todos";
    renderizarPedidos();
});

// =====================================================
// INICIALIZACIÓN CON SESIÓN
// =====================================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        cargando.classList.add("d-none");
        sinPermiso.classList.remove("d-none");
        return;
    }

    esAdmin = await verificarAdmin(user);

    if (!esAdmin) {
        cargando.classList.add("d-none");
        sinPermiso.classList.remove("d-none");
        return;
    }

    // Es admin: cargamos los pedidos
    cargarPedidos();
});