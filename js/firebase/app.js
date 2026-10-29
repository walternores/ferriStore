import { auth, db } from "./config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { showMessage } from "../showMessage.js";

async function actualizarNavbar(user) {
    const soloLogueado = document.querySelectorAll(".solo-logueado");
    const soloAdmin = document.querySelectorAll(".solo-admin");
    const grupoUsuario = document.querySelectorAll(".grupoUsuario");
    const loggedOut = document.querySelectorAll(".logged-out");
    const loggedIn = document.querySelectorAll(".logged-in");

    // Reset: ocultamos todo lo que depende del login
    soloLogueado.forEach((el) => el.classList.add("d-none"));
    soloAdmin.forEach((el) => el.classList.add("d-none"));
    grupoUsuario.forEach((el) => el.classList.add("d-none"));
    loggedIn.forEach((el) => el.classList.add("d-none"));
    loggedOut.forEach((el) => el.classList.remove("d-none"));
 
    if (!user) {
        // Anónimo: solo Inicio y Catálogo
        return;
    }

    // Logueado: mostramos carrito, perfil, mis pedidos
    soloLogueado.forEach((el) => el.classList.remove("d-none"));
    grupoUsuario.forEach((el) => el.classList.remove("d-none"));
    loggedIn.forEach((el) => el.classList.remove("d-none"));
    loggedOut.forEach((el) => el.classList.add("d-none"));

    // Verificamos si es admin
    try {
        const userRef = doc(db, "usuario", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().rol === "admin") {
            soloAdmin.forEach((el) => el.classList.remove("d-none"));
        }

        // Mostrar el nombre del usuario en el botón del dropdown
        const nombreUsuario = document.querySelector("#nombreUsuario");

        
        if (nombreUsuario) {
          
            const nombreCompleto = `${userSnap.data().nombre || ""} ${userSnap.data().apellido || ""}`.trim();
            nombreUsuario.textContent = nombreCompleto || user.displayName || user.email.split("@")[0];
            
        }
    } catch (error) {
        console.error("Error al verificar rol del usuario:", error);
    }
}

// =====================================================
// ESCUCHAR CAMBIOS DE SESIÓN
// =====================================================
onAuthStateChanged(auth, async (user) => {
    await actualizarNavbar(user);

});

// =====================================================
// CERRAR SESIÓN
// =====================================================
const btnCerrarSesion = document.querySelector("#btnCerrarSesion");
if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", async () => {
        try {
            await signOut(auth);
            showMessage("Sesión cerrada correctamente.", "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);
        } catch (error) {
            showMessage("Error al cerrar sesión: " + error.message, "error");
        }
    });
}

