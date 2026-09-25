// js/misPedidos.js
import { db, auth } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
    collection,
    query,
    where,
    getDocs,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// =====================================================
// ELEMENTOS DEL DOM
// =====================================================
const cargandoPedidos = document.querySelector("#cargandoPedidos");
const sinPedidos = document.querySelector("#sinPedidos");
const sinSesion = document.querySelector("#sinSesion");
const listadoPedidos = document.querySelector("#listadoPedidos");
const contadorPedidos = document.querySelector("#contadorPedidos");

// =====================================================
// FORMATEAR FECHA
// =====================================================
function formatearFecha(timestamp) {
    if (!timestamp) return "Fecha desconocida";
    // Firestore Timestamp → Date
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return fecha.toLocaleDateString("es-UY", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatearPrecio(valor) {
    return `$ ${Number(valor || 0).toLocaleString("es-UY")}`;
}

// =====================================================
// COLOR DEL BADGE SEGÚN ESTADO
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
async function cargarPedidos(user) {
    cargandoPedidos.classList.remove("d-none");
    sinPedidos.classList.add("d-none");
    listadoPedidos.classList.add("d-none");
    listadoPedidos.innerHTML = "";

    try {
        const pedidosRef = collection(db, "pedido");
        const consulta = query(
            pedidosRef,
            where("uid", "==", user.uid),
            orderBy("fecha", "desc")
        );

        const snapshot = await getDocs(consulta);

        cargandoPedidos.classList.add("d-none");

        if (snapshot.empty) {
            sinPedidos.classList.remove("d-none");
            contadorPedidos.textContent = 0;
            return;
        }

        listadoPedidos.classList.remove("d-none");
        contadorPedidos.textContent = snapshot.size;

        let index = 0;
        snapshot.forEach((doc) => {
            const pedido = doc.data();
            const id = doc.id;
            const idCorto = id.slice(0, 8).toUpperCase();

            // Generar el HTML de los items
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
                                data-bs-target="#pedido-${index}"
                                aria-expanded="false">
                            <div class="d-flex flex-wrap justify-content-between align-items-center w-100 me-3 gap-2">
                                <div>
                                    <strong class="d-block">Pedido #${idCorto}</strong>
                                    <small class="text-secondary">${formatearFecha(pedido.fecha)}</small>
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
                            <h3 class="h6 text-uppercase text-secondary mb-3">Detalle del pedido</h3>
                            ${itemsHtml}
                            <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                <strong class="fs-5">Total</strong>
                                <strong class="fs-4 text-warning">${formatearPrecio(pedido.total)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            index++;
        });

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        cargandoPedidos.classList.add("d-none");
        listadoPedidos.innerHTML = `
            <div class="alert alert-danger">
                <strong>Error al cargar tus pedidos:</strong> ${error.message}
            </div>
        `;
        listadoPedidos.classList.remove("d-none");
    }
}

// =====================================================
// INICIALIZACIÓN: escuchar sesión
// =====================================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        sinSesion.classList.add("d-none");
        cargarPedidos(user);
    } else {
        cargandoPedidos.classList.add("d-none");
        sinPedidos.classList.add("d-none");
        listadoPedidos.classList.add("d-none");
        sinSesion.classList.remove("d-none");
    }
});