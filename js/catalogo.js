
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
    }
];

const contenedorCatalogo = document.querySelector("#catalogo");
const cantidadProductos = document.querySelector("#cantidadProductos");

function mostrarProductos(lista) {
    
    contenedorCatalogo.innerHTML = "";
   
    cantidadProductos.textContent = lista.length;
   
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

document.addEventListener('DOMContentLoaded', () => {
    mostrarProductos(productos);
});