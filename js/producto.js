
const contenedorDetalle = document.querySelector("#detalle");
const mensajeError = document.querySelector("#mensajeError");

const imagen = document.querySelector("#imagenDetalle");
const nombre = document.querySelector("#nombreDetalle");
const categoria = document.querySelector("#categoriaDetalle");
const precio = document.querySelector("#precioDetalle");
const disponible = document.querySelector("#disponibleDetalle");
const stock = document.querySelector("#stockDetalle");
const botonAgregar = document.querySelector(".botonAgregar");

const parametros = new URLSearchParams(window.location.search);
const idProducto = parametros.get("id");

const productoSeleccionado = productos.find(producto => producto.id === idProducto);

function mostrarDetalle(producto) {
    try {
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;
        nombre.textContent = producto.nombre;
        categoria.textContent = producto.categoria;
        precio.textContent = `$${producto.precio.toFixed(2)}`;
        
        const stockDisponible = calcularStockDisponible(producto);
        disponible.textContent = stockDisponible > 0 ? "Disponible" : "Sin stock";
        stock.textContent = `Stock disponible: ${stockDisponible}`;
        
            if (botonAgregar) {
            botonAgregar.dataset.id = producto.id;
            if (stockDisponible <= 0) {
                botonAgregar.disabled = true;
                botonAgregar.textContent = "Sin stock disponible";
            } else {
                botonAgregar.disabled = false;
                botonAgregar.textContent = "Agregar al carrito";
            }
        }
        
    } catch (e) {
        console.error("Error actualizando textos:", e);
    }

    const fichaNombre = document.querySelector("#fichaNombre");
    const fichaCategoria = document.querySelector("#fichaCategoria");
    const fichaStock = document.querySelector("#fichaStock");

    if (fichaNombre) fichaNombre.textContent = producto.nombre;
    if (fichaCategoria) fichaCategoria.textContent = producto.categoria;
    if (fichaStock) fichaStock.textContent =calcularStockDisponible(producto);

    contenedorDetalle.classList.remove("d-none");
    
}

function mostrarError() {
    mensajeError.classList.remove("d-none");
}

if (productoSeleccionado) {
    mostrarDetalle(productoSeleccionado);
    if (botonAgregar) {
        botonAgregar.addEventListener("click", () => {
            // Esperamos un tick para que carrito.js ya haya guardado en localStorage
            setTimeout(() => {
                mostrarDetalle(productoSeleccionado);
            }, 100);
        });
    }
} else {
    mostrarError();
}
