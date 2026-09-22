// js/catalogo.js
import { db } from "./config.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// =====================================================
// ELEMENTOS DEL DOM
// =====================================================
const contenedorCatalogo = document.querySelector("#catalogo");
const cantidadProductos = document.querySelector("#cantidadProductos");
const buscador = document.querySelector("#buscador");
const filtroCategoria = document.querySelector("#filtroCategoria");
const btnLimpiar = document.querySelector("#btnLimpiar");
const sinResultados = document.querySelector("#sinResultados");

// =====================================================
// ESTADO GLOBAL
// =====================================================
let productos = [];  // Ahora se llena desde Firestore

// =====================================================
// CARGAR PRODUCTOS DESDE FIRESTORE
// =====================================================
async function cargarProductosDesdeFirestore() {
    try {
        const productosRef = collection(db, "producto");
        const snapshot = await getDocs(productosRef);

        productos = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Solo mostramos los que tienen activo: true (o sin el campo)
            if (data.activo !== false) {
                productos.push({
                    id: doc.id,        // El ID del documento (ej: "p1", "abc123")
                    ...data
                });
            }
        });

        // Ordenamos alfabéticamente por nombre
        productos.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));

        // Cargar las categorías en el select
        cargarCategorias();

        // Renderizar todo
        actualizarCatalogo();

    } catch (error) {
        console.error("Error al cargar productos:", error);
        contenedorCatalogo.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <strong>Error al cargar el catálogo:</strong> ${error.message}
                </div>
            </div>
        `;
    }
}

// =====================================================
// CARGAR CATEGORÍAS EN EL SELECT
// =====================================================
function cargarCategorias() {
    // Resetear el select (dejamos solo "Todas")
    filtroCategoria.innerHTML = `<option value="Todas">Todas las categorías</option>`;

    const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
    categorias.sort();

    categorias.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria;
        option.textContent = categoria;
        filtroCategoria.appendChild(option);
    });
}

// =====================================================
// MOSTRAR PRODUCTOS EN EL DOM
// =====================================================
function mostrarProductos(lista) {
    contenedorCatalogo.innerHTML = "";
    cantidadProductos.textContent = lista.length;

    if (lista.length === 0) {
        sinResultados.classList.remove("d-none");
    } else {
        sinResultados.classList.add("d-none");
    }

    lista.forEach(producto => {
        // Calculamos el stock real (si carrito.js está cargado)
        const stockDisponible = typeof calcularStockDisponible === "function"
            ? calcularStockDisponible(producto)
            : (producto.stock || 0);

        const estaDisponible = producto.disponible !== false && stockDisponible > 0;

        const estado = estaDisponible
            ? `<span class="badge text-bg-success">Disponible</span>`
            : `<span class="badge text-bg-secondary">Sin stock</span>`;

        contenedorCatalogo.innerHTML += `
            <div class="col-sm-6 col-lg-4 col-xl-3">
                <div class="card h-100 shadow-sm">
                    <img src="${producto.imagen || 'assets/img/default.jpg'}" 
                         class="card-img-top" 
                         alt="${producto.nombre || 'Producto'}" 
                         style="height: 180px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start gap-2 mb-2 flex-wrap">
                            <span class="badge text-bg-light border text-truncate" 
                                  style="max-width: 60%;" 
                                  title="${producto.categoria || ''}">
                                ${producto.categoria || 'General'}
                            </span>
                            ${estado}
                        </div>
                        <h5 class="card-title h6">${producto.nombre || 'Sin nombre'}</h5>
                        <p class="text-secondary small mb-3">Stock disponible: ${stockDisponible} unidades</p>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <strong class="fs-5">$ ${Number(producto.precio || 0).toLocaleString("es-UY")}</strong>
                            <a href="producto.html?id=${producto.id}" class="btn btn-primary btn-sm">Ver más</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

// =====================================================
// FILTROS Y BÚSQUEDA
// =====================================================
function actualizarCatalogo() {
    const textoBusqueda = buscador.value.trim().toLowerCase();
    const categoriaSeleccionada = filtroCategoria.value;

    const resultados = productos.filter(producto => {
        const coincideNombre = (producto.nombre || "").toLowerCase().includes(textoBusqueda);
        const coincideCategoria = categoriaSeleccionada === "Todas" || producto.categoria === categoriaSeleccionada;
        return coincideNombre && coincideCategoria;
    });

    mostrarProductos(resultados);
}

function limpiarFiltros() {
    buscador.value = "";
    filtroCategoria.value = "Todas";
    actualizarCatalogo();
}

// =====================================================
// INICIALIZACIÓN
// =====================================================
if (contenedorCatalogo) {
    buscador.addEventListener("input", actualizarCatalogo);
    filtroCategoria.addEventListener("change", actualizarCatalogo);
    btnLimpiar.addEventListener("click", limpiarFiltros);

    cargarProductosDesdeFirestore();
}