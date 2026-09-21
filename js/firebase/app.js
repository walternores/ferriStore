import { auth, db } from "./config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  const grupoIngresar = document.getElementById("grupIngresar");
  const grupoRegistrarse = document.getElementById("grupoRegistrarse");
  const grupoUsuario =  document.querySelectorAll(".grupoUsuario");
  const nombreUsuario = document.getElementById("nombreUsuario");
 

  if (user) {
    if (grupoIngresar) grupoIngresar.classList.add("d-none");
    if (grupoRegistrarse) grupoRegistrarse.classList.add("d-none");
    grupoUsuario.forEach(el => el.classList.remove("d-none"));

    try {
      const referenciaUsuario = doc(db, "usuario", user.uid);
      const docSnap = await getDoc(referenciaUsuario);

      if (docSnap.exists()) {
        const datosUsuario = docSnap.data();

        if (nombreUsuario) {
          const nombreCompleto = `${datosUsuario.nombre || ""} ${datosUsuario.apellido || ""}`.trim();
          nombreUsuario.textContent = nombreCompleto || user.displayName || user.email.split("@")[0];
        }

        
      } else {
        if (nombreUsuario) {
          nombreUsuario.textContent = user.displayName || user.email.split("@")[0];
        }
      }
    } catch (error) {
      console.error("Error al obtener datos del usuario desde Firestore:", error);
      if (nombreUsuario) {
        nombreUsuario.textContent = user.displayName || user.email.split("@")[0];
      }
    }

  } else {
    if (grupoIngresar) grupoIngresar.classList.remove("d-none");
    if (grupoRegistrarse) grupoRegistrarse.classList.remove("d-none");
    grupoUsuario.forEach(el => el.classList.add("d-none"));
   
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // CERRAR SESIÓN
  const btnCerrarSesion = document.getElementById("btnCerrarSesion");
  
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "index.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
      }
    });
  }

  const formBuscador = document.getElementById("formBuscador");
  const inputBuscador = document.getElementById("inputBuscador");

  if (formBuscador && inputBuscador) {
    formBuscador.addEventListener("submit", (event) => {
      event.preventDefault();

      const texto = inputBuscador.value.trim();

      if (texto) {
        window.location.href = `resultados.html?buscar=${encodeURIComponent(texto)}`;
      }
    });
  }
});