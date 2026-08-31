
const productos = [
    {
        id: 1,
        nombre: "ARNES DE SEGURIDAD MAKAWA MK-0336",
        categoria: "EQUIPO DE PROTECCIÓN PERSONAL",
        precio: 460.0,
        stock: 25,
        disponible: true,
        imagen: "assets/img/16.jpg"
    },
    {
        id: 2,
        nombre: "ALARGUE ENROLLADOR SL-2-5M",
        categoria: "ILUMINACIÓN, ELECTRICIDAD",
        precio: 1250.0,
        stock: 6,
        disponible: true,
        imagen: "assets/img/12.jpg"
    },
    {
        id: 3,
        nombre: "BARRAL DE DUCHA CUADRADA ITALOMIX LH-3328",
        categoria: "GRIFERÍA",
        precio: 910.0,
        stock: 0,
        disponible: false,
        imagen: "assets/img/13.jpg"
    },
    {
        id: 4,
        nombre: "BALDE PARA PINTOR DE 15 LITROS METASUL",
        categoria: "HERRAMIENTAS",
        precio: 700.0,
        stock: 12,
        disponible: true,
        imagen: "assets/img/15.jpg"
    },
    {
        id: 5,
        nombre: "Guantes de trabajo cuero",
        categoria: "EQUIPO DE PROTECCIÓN PERSONAL",
        precio: 590.0,
        stock: 20,
        disponible: true,
        imagen: "assets/img/18.jpg"
    },
    {
        id: 6,
        nombre: "AMOLADORA ANGULAR 115MM 720W",
        categoria: "HERRAMIENTAS",
        precio: 3500.0,
        stock: 9,
        disponible: true,
        imagen: "assets/img/14.jpg"
    },
    {
        id: 7,
        nombre: "IMPERMEABILIZANTE MAYORGOMA 20K BLANCO",
        categoria: "PINTURAS Y ACABADOS",
        precio: 3980.0,
        stock: 15,
        disponible: true,
        imagen: "assets/img/17.jpg"
    },
    {
        id: 8,
        nombre: "DISCO DIAMANTADO 4 1/2″ TURBO UYUSTOOLS DDU115H",
        categoria: "HERRAMIENTAS",
        precio: 740.0,
        stock: 0,
        disponible: false,
        imagen: "assets/img/11.jpg"
    },
    {
        id: 9,
        nombre: "PULIDORA 180 MM 1400 W INGCO",
        categoria: "HERRAMIENTAS",
        precio: 3440.0,
        stock: 3,
        disponible: true,
        imagen: "assets/img/19.jpg"
    },
    {
        id: 10,
        nombre: "TALADRO 13MM C/PERCUTOR 850W INGCO- VELOC.VARIABLE",
        categoria: "HERRAMIENTAS",
        precio: 2300.0,
        stock: 5,
        disponible: true,
        imagen: "assets/img/20.jpg"
    }
];

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

buscador.addEventListener("input", actualizarCatalogo);
filtroCategoria.addEventListener("change", actualizarCatalogo);
btnLimpiar.addEventListener("click", limpiarFiltros);

document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    actualizarCatalogo(); // Muestra todos los productos al inicio
});