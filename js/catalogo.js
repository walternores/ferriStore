
const contenedorCatalogo = document.querySelector("#catalogo");
const cantidadProductos = document.querySelector("#cantidadProductos");
const buscador = document.querySelector("#buscador");
const filtroCategoria = document.querySelector("#filtroCategoria");
const btnLimpiar = document.querySelector("#btnLimpiar");
const sinResultados = document.querySelector("#sinResultados");


function cargarCategorias() {
    
    const categorias = [...new Set(productos.map(producto => producto.categoria))];

    categorias.forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria;
        option.textContent = categoria;
        filtroCategoria.appendChild(option);
    });
}

function mostrarProductos(lista) {
    contenedorCatalogo.innerHTML = "";
    cantidadProductos.textContent = lista.length;

    if (lista.length === 0) {
        sinResultados.classList.remove("d-none");
    } else {
        sinResultados.classList.add("d-none");
    }

    lista.forEach(producto => {
        const estado = producto.disponible && producto.stock > 0 
            ? `<span class="badge text-bg-success">Disponible</span>` 
            : `<span class="badge text-bg-secondary">Sin stock</span>`;

        const tarjeta = `
            <div class="col-sm-6 col-lg-4 col-xl-3">
                <div class="card h-100 shadow-sm">
                    <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" style="height: 180px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                            <span class="badge text-bg-light border">${producto.categoria}</span>
                            ${estado}
                        </div>
                        <h5 class="card-title h6">${producto.nombre}</h5>
                        <p class="text-secondary small mb-3">Stock: ${producto.stock} unidades</p>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <strong class="fs-5">$ ${producto.precio.toLocaleString("es-UY")}</strong>
                            <a href="producto.html?id=${producto.id}" class="btn btn-primary btn-sm">Ver más</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedorCatalogo.innerHTML += tarjeta;
    });
}

function actualizarCatalogo() {
    const textoBusqueda = buscador.value.trim().toLowerCase();
    const categoriaSeleccionada = filtroCategoria.value;

    // Filtramos por nombre Y por categoría (si no es "Todas")
    const resultados = productos.filter(producto => {
        const coincideNombre = producto.nombre.toLowerCase().includes(textoBusqueda);
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

// Solo ejecutar si estamos en la página del catálogo
if (contenedorCatalogo) {    
    buscador.addEventListener("input", actualizarCatalogo);
    filtroCategoria.addEventListener("change", actualizarCatalogo);
    btnLimpiar.addEventListener("click", limpiarFiltros);

    document.addEventListener('DOMContentLoaded', () => {
        cargarCategorias();
        actualizarCatalogo(); // Muestra todos los productos al inicio
    });
}