// js/resenas.js
import { db, auth } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// =====================================================
// ESTADO
// =====================================================
let usuarioActual = null;
let puntuacionSeleccionada = 0;

// Elementos del DOM
const seccionResenas = document.querySelector("#seccionResenas");
if (seccionResenas) {
    initResenas();
}

// =====================================================
// INICIALIZACIÓN (solo si estamos en producto.html)
// =====================================================
function initResenas() {
    const parametros = new URLSearchParams(window.location.search);
    const idProducto = parametros.get("id");
    if (!idProducto) return;

    const formResena = document.querySelector("#formResena");
    const avisoLoginResena = document.querySelector("#avisoLoginResena");
    const listaResenas = document.querySelector("#listaResenas");
    const cargandoResenas = document.querySelector("#cargandoResenas");
    const sinResenas = document.querySelector("#sinResenas");
    const promedioPuntuacion = document.querySelector("#promedioPuntuacion");
    const totalResenas = document.querySelector("#totalResenas");
    const estrellas = document.querySelectorAll("#estrellas i");
    const inputPuntuacion = document.querySelector("#puntuacionSeleccionada");
    const textareaComentario = document.querySelector("#comentario");
    const btnEnviar = document.querySelector("#btnEnviarResena");

    // =====================================================
    // ESTADO DE SESIÓN
    // =====================================================
    onAuthStateChanged(auth, (user) => {
        usuarioActual = user;
        if (user) {
            formResena.classList.remove("d-none");
            avisoLoginResena.classList.add("d-none");
        } else {
            formResena.classList.add("d-none");
            avisoLoginResena.classList.remove("d-none");
        }
    });

    // =====================================================
    // ESTRELLAS CLICKEABLES
    // =====================================================
    estrellas.forEach((estrella) => {
        estrella.addEventListener("click", () => {
            const valor = Number(estrella.dataset.valor);
            puntuacionSeleccionada = valor;
            inputPuntuacion.value = valor;
            actualizarEstrellas(valor);
        });

        estrella.addEventListener("mouseenter", () => {
            actualizarEstrellas(Number(estrella.dataset.valor));
        });
    });

    document.querySelector("#estrellas").addEventListener("mouseleave", () => {
        actualizarEstrellas(puntuacionSeleccionada);
    });

    function actualizarEstrellas(valor) {
        estrellas.forEach((e) => {
            const v = Number(e.dataset.valor);
            e.classList.toggle("bi-star-fill", v <= valor);
            e.classList.toggle("bi-star", v > valor);
        });
    }

    // =====================================================
    // ENVIAR RESEÑA
    // =====================================================
    btnEnviar.addEventListener("click", async () => {
        if (!usuarioActual) {
            alert("Tienes que iniciar sesión.");
            return;
        }

        if (puntuacionSeleccionada === 0) {
            alert("Elige una puntuación de 1 a 5 estrellas.");
            return;
        }

        const comentario = textareaComentario.value.trim();
        if (comentario.length < 3) {
            alert("El comentario es muy corto.");
            return;
        }

        btnEnviar.disabled = true;
        btnEnviar.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Publicando...`;

        try {
            const resenasRef = collection(db, "producto", idProducto, "resenias");
            await addDoc(resenasRef, {
                uid: usuarioActual.uid,
                nombre: usuarioActual.displayName || usuarioActual.email.split("@")[0],
                puntuacion: puntuacionSeleccionada,
                comentario: comentario,
                fecha: serverTimestamp()
            });

            // Limpiamos el formulario
            puntuacionSeleccionada = 0;
            inputPuntuacion.value = 0;
            actualizarEstrellas(0);
            textareaComentario.value = "";

            // Recargamos las reseñas
            await cargarResenas();

        } catch (error) {
            console.error("Error al publicar reseña:", error);
            alert("No se pudo publicar la reseña: " + error.message);
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.innerHTML = `<i class="bi bi-send"></i> Publicar reseña`;
        }
    });

    // =====================================================
    // CARGAR RESEÑAS
    // =====================================================
    async function cargarResenas() {
        cargandoResenas.classList.remove("d-none");
        listaResenas.innerHTML = "";
        sinResenas.classList.add("d-none");

        try {
            const resenasRef = collection(db, "producto", idProducto, "resenias");
            const q = query(resenasRef, orderBy("fecha", "desc"));
            const snapshot = await getDocs(q);

            cargandoResenas.classList.add("d-none");

            if (snapshot.empty) {
                sinResenas.classList.remove("d-none");
                promedioPuntuacion.textContent = "0.0";
                totalResenas.textContent = "0";
                return;
            }

            let suma = 0;
            let total = 0;

            snapshot.forEach((doc) => {
                const resena = doc.data();
                suma += resena.puntuacion || 0;
                total++;

                const estrellasHtml = generarEstrellas(resena.puntuacion || 0);
                const fecha = resena.fecha?.toDate
                    ? resena.fecha.toDate().toLocaleDateString("es-UY", { day: "2-digit", month: "long", year: "numeric" })
                    : "Reciente";

                listaResenas.innerHTML += `
                    <div class="border-bottom py-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <strong>${resena.nombre || "Usuario"}</strong>
                                <small class="text-secondary d-block">${fecha}</small>
                            </div>
                            <div class="text-warning">${estrellasHtml}</div>
                        </div>
                        <p class="mb-0">${escapeHtml(resena.comentario || "")}</p>
                    </div>
                `;
            });

            // Promedio
            const promedio = (suma / total).toFixed(1);
            promedioPuntuacion.textContent = promedio;
            totalResenas.textContent = total;

        } catch (error) {
            console.error("Error al cargar reseñas:", error);
            cargandoResenas.classList.add("d-none");
            listaResenas.innerHTML = `
                <div class="alert alert-danger">
                    No se pudieron cargar las reseñas.
                </div>
            `;
        }
    }

    function generarEstrellas(valor) {
        let html = "";
        for (let i = 1; i <= 5; i++) {
            html += i <= valor
                ? '<i class="bi bi-star-fill"></i>'
                : '<i class="bi bi-star"></i>';
        }
        return html;
    }

    function escapeHtml(texto) {
        const div = document.createElement("div");
        div.textContent = texto;
        return div.innerHTML;
    }

    // Cargar al inicio
    cargarResenas();
}