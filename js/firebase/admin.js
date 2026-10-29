// js/adminPedidos.js
import { db, auth } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { showMessage } from "../showMessage.js";

// =====================================================
// ELEMENTOS DEL DOM
// =====================================================

// Gestión de productos
const listadoProductos = document.querySelector("#listadoProductos");
const cargandoProductos = document.querySelector("#cargandoProductos");
const contenedorTablaProductos = document.querySelector("#contenedorTablaProductos");
const formProducto = document.querySelector("#formProducto");
const modalElemento = document.getElementById("modalProducto");
const modal = new bootstrap.Modal(modalElemento);

// Gestión de pedidos
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
let modoEdicion = false;

// =====================================================
// VERIFICAR SI EL USUARIO ES ADMIN
// =====================================================
async function verificarAdmin(user) {
    try {
        const userRef = doc(db, "usuario", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().rol === "admin") {
            document.querySelector("#contenidoAdmin").classList.remove("d-none");
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


async function cargarProductos() {
    try {
        cargandoProductos.classList.remove("d-none");
        contenedorTablaProductos.classList.add("d-none");
        listadoProductos.innerHTML = "";

        const q = query(collection(db, "producto"), orderBy("nombre", "asc"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            listadoProductos.innerHTML = `<tr><td colspan="6" class="text-center py-4">No hay productos cargados.</td></tr>`;
        } else {
            snapshot.forEach((docSnap) => {
                const prod = docSnap.data();
                const id = docSnap.id;
                
                // Si el producto está inactivo, lo mostramos con opacidad
                const claseFila = prod.activo === false ? "opacity-50" : "";
                
                const badgeStock = prod.stock > 0 
                    ? `<span class="badge text-bg-success">${prod.stock}</span>` 
                    : `<span class="badge text-bg-danger">0</span>`;

                const imgUrl = prod.imagen || 'assets/img/default.jpg';

                listadoProductos.innerHTML += `
                    <tr class="${claseFila}">
                        <td class="ps-4">
                            <img src="${imgUrl}" alt="${prod.nombre}" style="width: 50px; height: 50px; object-fit: cover;" class="rounded border">
                        </td>
                        <td class="fw-bold">${prod.nombre}</td>
                        <td><span class="badge text-bg-light border">${prod.categoria}</span></td>
                        <td class="text-end">$${Number(prod.precio).toLocaleString("es-UY")}</td>
                        <td class="text-center">${badgeStock}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-outline-primary me-1 btn-editar-prod" data-id="${id}">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-${prod.activo === false ? 'success' : 'danger'} btn-toggle-prod" data-id="${id}" data-activo="${prod.activo}">
                                <i class="bi bi-${prod.activo === false ? 'eye' : 'eye-slash'}"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        cargandoProductos.classList.add("d-none");
        contenedorTablaProductos.classList.remove("d-none");
        conectarBotones();

    } catch (error) {
        console.error("Error al cargar productos:", error);
        cargandoProductos.innerHTML = `<div class="alert alert-danger">Error al cargar productos. Verificá las reglas de Firestore.</div>`;
    }
}

// ==========================================
// LÓGICA DEL MODAL (CREAR)
// ==========================================
document.querySelector("#btnNuevoProducto").addEventListener("click", () => {
    modoEdicion = false;
    formProducto.reset();
    document.querySelector("#productoId").value = "";
    document.querySelector("#modalTituloProducto").textContent = "Nuevo Producto";
    document.querySelector("#prodActivo").checked = true;
    modal.show();
});

// ==========================================
// LÓGICA DEL MODAL (EDITAR Y HABILITAR/DESHABILITAR)
// ==========================================
function conectarBotones() {
    // Botones Editar
    document.querySelectorAll(".btn-editar-prod").forEach((boton) => {
        boton.addEventListener("click", async () => {
            const id = boton.dataset.id;
            const docRef = doc(db, "producto", id);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const prod = docSnap.data();
                modoEdicion = true;
                
                document.querySelector("#productoId").value = id;
                document.querySelector("#prodNombre").value = prod.nombre;
                document.querySelector("#prodPrecio").value = prod.precio;
                document.querySelector("#prodStock").value = prod.stock;
                document.querySelector("#prodImagen").value = prod.imagen || "";
                document.querySelector("#prodDescripcion").value = prod.descripcion || "";
                document.querySelector("#prodActivo").checked = prod.activo !== false;

                const selectCategoria = document.querySelector("#prodCategoria");
                const categoriaGuardada = prod.categoria ? prod.categoria.trim() : "";

                let opcionExiste = Array.from(selectCategoria.options).some(
                (opt) => opt.value.toLowerCase() === categoriaGuardada.toLowerCase()
                );

                if (!opcionExiste && categoriaGuardada !== "") {
                const nuevaOpcion = document.createElement("option");
                nuevaOpcion.value = categoriaGuardada;
                nuevaOpcion.textContent = categoriaGuardada;
                selectCategoria.appendChild(nuevaOpcion);
                }
                selectCategoria.value = categoriaGuardada;

                document.querySelector("#modalTituloProducto").textContent = "Editar Producto";
                modal.show();
            }
        });
    });

    // Botones Habilitar/Deshabilitar (Baja lógica)
    document.querySelectorAll(".btn-toggle-prod").forEach((boton) => {
        boton.addEventListener("click", async () => {
            const id = boton.dataset.id;
            const estaActivo = boton.dataset.activo === "true";
            
            const accion = estaActivo ? "deshabilitar" : "habilitar";
            if (!confirm(`¿Estás seguro de ${accion} este producto del catálogo?`)) return;

            try {
                const docRef = doc(db, "producto", id);
                await updateDoc(docRef, { activo: !estaActivo });
                cargarProductos(); // Recargar la tabla
            } catch (error) {
                console.error("Error al cambiar estado:", error);
            }
        });
    });
}

// ==========================================
// GUARDAR (CREAR O EDITAR)
// ==========================================
document.querySelector("#btnGuardarProducto").addEventListener("click", async () => {
    if (!formProducto.checkValidity()) {
        formProducto.reportValidity();
        return;
    }

    const btnGuardar = document.querySelector("#btnGuardarProducto");
    const id = document.querySelector("#productoId").value;

    // Construimos el objeto con los datos
    const stockVal = Number(document.querySelector("#prodStock").value);
    const datosProducto = {
        nombre: document.querySelector("#prodNombre").value.trim(),
        categoria: document.querySelector("#prodCategoria").value,
        precio: Number(document.querySelector("#prodPrecio").value),
        stock: stockVal,
        imagen: document.querySelector("#prodImagen").value.trim(),
        descripcion: document.querySelector("#prodDescripcion").value.trim(),
        activo: document.querySelector("#prodActivo").checked,
        disponible: stockVal > 0 // Lógica automática
    };

    try {
        btnGuardar.disabled = true;
        btnGuardar.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Guardando...`;

        if (modoEdicion) {
            await updateDoc(doc(db, "producto", id), datosProducto);
        } else {
            await addDoc(collection(db, "producto"), datosProducto);
        }

        modal.hide();
        cargarProductos();
        alert(modoEdicion ? "Producto actualizado." : "Producto creado exitosamente.");

    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error al guardar: " + error.message);
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = "Guardar Producto";
    }
});

// Carga combobox de categoría

async function cargarCategoriasEnSelect() {
    const select = document.querySelector("#prodCategoria");
    
    try {
        const snapshot = await getDocs(collection(db, "categoria"));
        
        select.innerHTML = '<option value="">Seleccione...</option>'; // Limpiamos el HTML
        
        snapshot.forEach((doc) => {
            const cat = doc.data().nombre; 
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
        select.innerHTML = '<option value="">Error al cargar</option>';
    }
}

// =====================================================
// INICIALIZACIÓN CON SESIÓN
// =====================================================
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        cargando.classList.add("d-none");
        sinPermiso.classList.remove("d-none");
        cargandoProductos.classList.add("d-none");
        contenedorTablaProductos.classList.remove("d-none");
        showMessage("No tiene permisos para acceder a esta sección. Será redirigido.", "error");
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 2500);
        return;
    }

    esAdmin = await verificarAdmin(user);

    if (!esAdmin) {
        cargando.classList.add("d-none");
        sinPermiso.classList.remove("d-none");
        cargandoProductos.classList.add("d-none");
        contenedorTablaProductos.classList.remove("d-none");
        showMessage("No tiene permisos para acceder a esta sección. Será redirigido.", "error");
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 2500);
        return;
    }

    // Es admin: cargamos los pedidos
    cargarPedidos();
    cargarProductos();
    cargarCategoriasEnSelect();

});

