import { auth, db } from "./config.js";
import {
    onAuthStateChanged,
    updateProfile,
    updatePassword,
    deleteUser,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where,
    getDocs,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";



function cargarDatosEnPerfil(datosUsuario, user) {
    const nombre = document.getElementById("perfilNombre");
    if (nombre) nombre.textContent = datosUsuario.nombre || "";

    const apellido = document.getElementById("perfilApellido");
    if (apellido) apellido.textContent = datosUsuario.apellido || "";

    const email = document.getElementById("perfilEmail");
    if (email) email.textContent = datosUsuario.email || user.email || "";

    
    
}

function editarNombre(user, referenciaUsuario) {
    const modalElemento = document.getElementById("modalEditarNombre");
    const inputNombre = document.getElementById("inputNuevoNombre");
    const btnGuardar = document.getElementById("btnGuardarNombre");
    const nombreActual = document.getElementById("perfilNombre").textContent.trim();

    if (!modalElemento || !inputNombre || !btnGuardar) return;

    inputNombre.value = nombreActual;
    inputNombre.classList.remove("is-invalid");

    const modal = new bootstrap.Modal(modalElemento);
    modal.show();

    btnGuardar.onclick = async () => {
        const nombreLimpio = inputNombre.value.trim();

        if (!nombreLimpio) {
            inputNombre.classList.add("is-invalid");
            return;
        }

        btnGuardar.disabled = true;
        btnGuardar.textContent = "Guardando...";

        try {
            await updateDoc(referenciaUsuario, { nombre: nombreLimpio });

            const apellidoActual = document.getElementById("perfilApellido").textContent.trim();
            const nombreCompleto = `${nombreLimpio} ${apellidoActual}`.trim();

            await updateProfile(user, { displayName: nombreCompleto });

            document.getElementById("perfilNombre").textContent = nombreLimpio;

           

            const nombreNavbar = document.getElementById("nombreUsuario");
            if (nombreNavbar) nombreNavbar.textContent = nombreCompleto;

            modal.hide();
            mostrarNotificacion("Nombre actualizado correctamente.", "exito");
        } catch (error) {
            console.error("Error al actualizar el nombre:", error);
            mostrarNotificacion("No se pudo actualizar el nombre.", "error");
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = "Guardar cambios";
        }
    };
}

function editarApellido(user, referenciaUsuario) {
    const modalElemento = document.getElementById("modalEditarApellido");
    const inputApellido = document.getElementById("inputNuevoApellido");
    const btnGuardar = document.getElementById("btnGuardarApellido");
    const apellidoActual = document.getElementById("perfilApellido").textContent.trim();

    if (!modalElemento || !inputApellido || !btnGuardar) return;

    inputApellido.value = apellidoActual;
    inputApellido.classList.remove("is-invalid");

    const modal = new bootstrap.Modal(modalElemento);
    modal.show();

    btnGuardar.onclick = async () => {
        const apellidoLimpio = inputApellido.value.trim();

        if (!apellidoLimpio) {
            inputApellido.classList.add("is-invalid");
            return;
        }

        btnGuardar.disabled = true;
        btnGuardar.textContent = "Guardando...";

        try {
            await updateDoc(referenciaUsuario, { apellido: apellidoLimpio });

            const nombreActual = document.getElementById("perfilNombre").textContent.trim();
            const nombreCompleto = `${nombreActual} ${apellidoLimpio}`.trim();

            await updateProfile(user, { displayName: nombreCompleto });

            document.getElementById("perfilApellido").textContent = apellidoLimpio;

            
            const nombreNavbar = document.getElementById("nombreUsuario");
            if (nombreNavbar) nombreNavbar.textContent = nombreCompleto;

            modal.hide();
            mostrarNotificacion("Apellido actualizado correctamente.", "exito");
        } catch (error) {
            console.error("Error al actualizar el apellido:", error);
            mostrarNotificacion("No se pudo actualizar el apellido.", "error");
        } finally {
            btnGuardar.disabled = false;
            btnGuardar.textContent = "Guardar cambios";
        }
    };
}





function configurarModificarPassword(user) {
    const boton = document.getElementById("btnModificarPassword");

    if (!boton) return;

    boton.addEventListener("click", () => {
        abrirModalReautenticarPassword(user);
    });

    const botonGuardar = document.getElementById("btnGuardarPassword");

    if (!botonGuardar) return;

    botonGuardar.addEventListener("click", async () => {
        const nuevaPassword = document.getElementById("nuevaPassword").value.trim();
        const confirmarPassword = document.getElementById("confirmarPassword").value.trim();
        const mensaje = document.getElementById("mensajePassword");

        mensaje.textContent = "";
        mensaje.className = "small";

        if (nuevaPassword.length < 8) {
            mensaje.textContent = "La contraseña debe tener al menos 8 caracteres.";
            mensaje.classList.add("text-danger");
            return;
        }

        if (nuevaPassword.length > 20) {
            mensaje.textContent = "La contraseña no puede tener más de 20 caracteres.";
            mensaje.classList.add("text-danger");
            return;
        }

        if (!/[A-Z]/.test(nuevaPassword)) {
            mensaje.textContent = "La contraseña debe contener al menos una letra mayúscula.";
            mensaje.classList.add("text-danger");
            return;
        }

        if (!/[0-9]/.test(nuevaPassword)) {
            mensaje.textContent = "La contraseña debe contener al menos un número.";
            mensaje.classList.add("text-danger");
            return;
        }

        if (nuevaPassword !== confirmarPassword) {
            mensaje.textContent = "Las contraseñas no coinciden.";
            mensaje.classList.add("text-danger");
            return;
        }

        botonGuardar.disabled = true;
        botonGuardar.textContent = "Guardando...";

        try {
            await updatePassword(user, nuevaPassword);

            mensaje.textContent = "Contraseña actualizada correctamente.";
            mensaje.classList.add("text-success");

            botonGuardar.textContent = "Listo";

            setTimeout(() => {
                const modalElemento = document.getElementById("modalPassword");
                const modal = bootstrap.Modal.getInstance(modalElemento);

                if (modal) {
                    modal.hide();
                }

                botonGuardar.disabled = false;
                botonGuardar.textContent = "Guardar contraseña";
            }, 1000);

        } catch (error) {
            console.error("Error al modificar la contraseña:", error);

            botonGuardar.disabled = false;
            botonGuardar.textContent = "Guardar contraseña";

            mensaje.textContent = "No se pudo modificar la contraseña.";
            mensaje.classList.add("text-danger");
        }
    });
}

function abrirModalReautenticarPassword(user) {
    const modalElemento = document.getElementById("modalReautenticarPassword");
    const campoPassword = document.getElementById("passwordActualReautenticar");
    const mensaje = document.getElementById("mensajeReautenticarPassword");
    const boton = document.getElementById("btnReautenticarPassword");

    if (!modalElemento || !campoPassword || !mensaje || !boton) {
        return;
    }

    campoPassword.value = "";
    campoPassword.classList.remove("is-invalid");

    mensaje.textContent = "";
    mensaje.className = "small mt-2";

    boton.disabled = false;
    boton.textContent = "Continuar";

    const modal = new bootstrap.Modal(modalElemento);
    modal.show();

    boton.onclick = async () => {
        const passwordActual = campoPassword.value.trim();

        if (!passwordActual) {
            mensaje.textContent = "Ingresá tu contraseña actual.";
            mensaje.className = "small mt-2 text-danger";
            campoPassword.classList.add("is-invalid");
            return;
        }

        boton.disabled = true;
        boton.textContent = "Verificando...";

        mensaje.textContent = "";
        mensaje.className = "small mt-2";

        campoPassword.classList.remove("is-invalid");

        try {
            const credencial = EmailAuthProvider.credential(user.email, passwordActual);

            await reauthenticateWithCredential(user, credencial);

            mensaje.textContent = "Identidad verificada correctamente.";
            mensaje.className = "small mt-2 text-success";
            boton.textContent = "Verificado";

            setTimeout(() => {
                modal.hide();

                const modalPasswordElemento = document.getElementById("modalPassword");
                const modalPassword = new bootstrap.Modal(modalPasswordElemento);

                document.getElementById("nuevaPassword").value = "";
                document.getElementById("confirmarPassword").value = "";

                const mensajePassword = document.getElementById("mensajePassword");
                mensajePassword.textContent = "";
                mensajePassword.className = "small";

                modalPassword.show();
            }, 1000);

        } catch (error) {
            console.error("Error durante la reautenticación:", error);

            boton.disabled = false;
            boton.textContent = "Continuar";

            if (
                error.code === "auth/wrong-password" ||
                error.code === "auth/invalid-credential"
            ) {
                mensaje.textContent = "La contraseña actual es incorrecta.";
                mensaje.className = "small mt-2 text-danger";
                campoPassword.classList.add("is-invalid");
            } else {
                mensaje.textContent = "No se pudo verificar tu identidad. Intentá nuevamente.";
                mensaje.className = "small mt-2 text-danger";
            }
        }
    };
}

document.querySelectorAll(".btn-toggle-password").forEach((boton) => {
    boton.addEventListener("click", () => {
        const idCampo = boton.dataset.target;
        const campo = document.getElementById(idCampo);
        const icono = boton.querySelector("i");

        if (!campo || !icono) return;

        if (campo.type === "password") {
            campo.type = "text";
            icono.classList.remove("bi-eye");
            icono.classList.add("bi-eye-slash");
            boton.setAttribute("aria-label", "Ocultar contraseña");
        } else {
            campo.type = "password";
            icono.classList.remove("bi-eye-slash");
            icono.classList.add("bi-eye");
            boton.setAttribute("aria-label", "Mostrar contraseña");
        }
    });
});




function configurarEliminarCuenta(user, referenciaUsuario) {
    const boton = document.getElementById("btnEliminarCuenta");

    if (!boton) return;

    boton.addEventListener("click", () => {
        const modalElemento = document.getElementById("modalEliminarCuenta");

        if (!modalElemento) return;

        const modal = new bootstrap.Modal(modalElemento);
        modal.show();
    });

    const botonConfirmar = document.getElementById("btnConfirmarEliminarCuenta");
    const botonReautenticar = document.getElementById("btnReautenticarEliminar");
    const inputPassword = document.getElementById("passwordEliminarCuenta");
    const mensajeEliminar = document.getElementById("mensajeEliminarCuenta");

    if (!botonConfirmar || !botonReautenticar || !inputPassword) {
        return;
    }

    botonConfirmar.addEventListener("click", () => {
        inputPassword.value = "";
        inputPassword.classList.remove("is-invalid");

        if (mensajeEliminar) {
            mensajeEliminar.textContent = "";
            mensajeEliminar.className = "small mt-2";
        }

        botonReautenticar.disabled = false;
        botonReautenticar.textContent = "Continuar";

        const modalConfirmacion = document.getElementById("modalEliminarCuenta");

        if (modalConfirmacion) {
            const instancia = bootstrap.Modal.getInstance(modalConfirmacion);
            if (instancia) {
                instancia.hide();
            }
        }

        setTimeout(() => {
            const modalReautenticar = document.getElementById("modalReautenticarEliminar");

            if (modalReautenticar) {
                const modal = new bootstrap.Modal(modalReautenticar);
                modal.show();
            }
        }, 300);
    });

    botonReautenticar.addEventListener("click", async () => {
        const password = inputPassword.value.trim();

        if (!password) {
            if (mensajeEliminar) {
                mensajeEliminar.textContent = "Ingresá tu contraseña actual.";
                mensajeEliminar.className = "small mt-2 text-danger";
            }
            inputPassword.classList.add("is-invalid");
            return;
        }

        botonReautenticar.disabled = true;
        botonReautenticar.textContent = "Verificando...";

        if (mensajeEliminar) {
            mensajeEliminar.textContent = "";
            mensajeEliminar.className = "small mt-2";
        }

        inputPassword.classList.remove("is-invalid");

        try {
            const credencial = EmailAuthProvider.credential(user.email, password);

            await reauthenticateWithCredential(user, credencial);
            
            await deleteDoc(referenciaUsuario);
            await deleteUser(user);

            if (mensajeEliminar) {
                mensajeEliminar.textContent = "Tu cuenta fue eliminada correctamente.";
                mensajeEliminar.className = "small mt-2 text-success";
            }

            botonReautenticar.textContent = "Cuenta eliminada";

            await new Promise(resolve => setTimeout(resolve, 2000));
            window.location.href = "index.html";

        } catch (error) {
            console.error("Error durante la eliminación:", error);

            botonReautenticar.disabled = false;
            botonReautenticar.textContent = "Continuar";

            if (
                error.code === "auth/wrong-password" ||
                error.code === "auth/invalid-credential"
            ) {
                if (mensajeEliminar) {
                    mensajeEliminar.textContent = "La contraseña ingresada no es correcta.";
                    mensajeEliminar.className = "small mt-2 text-danger";
                }
                inputPassword.classList.add("is-invalid");
            } else {
                if (mensajeEliminar) {
                    mensajeEliminar.textContent = "No se pudo eliminar la cuenta. Intentá nuevamente.";
                    mensajeEliminar.className = "small mt-2 text-danger";
                }
            }
        }
    });
}

function configurarBotonesEdicion(user, referenciaUsuario) {
   
    const botones = document.querySelectorAll(".btn-editar");
    botones.forEach((boton) => {
        boton.addEventListener("click", async () => {
            const titulo = boton.getAttribute("title");

            if (titulo === "Editar nombre") {
                await editarNombre(user, referenciaUsuario);
            } else if (titulo === "Editar apellido") {
                await editarApellido(user, referenciaUsuario);
            } 
        });
    });
}

function mostrarNotificacion(mensaje, tipo = "exito") {
    const toastElemento = document.getElementById("toastNotificacion");
    const toastMensaje = document.getElementById("toastMensaje");
    const toastIcono = document.getElementById("toastIcono");

    if (!toastElemento) return;

    if (tipo === "exito") {
        toastElemento.className = "toast align-items-center text-white bg-success border-0 shadow-lg";
        toastIcono.className = "bi bi-check-circle-fill fs-5";
    } else if (tipo === "error") {
        toastElemento.className = "toast align-items-center text-white bg-danger border-0 shadow-lg";
        toastIcono.className = "bi bi-exclamation-triangle-fill fs-5";
    } else if (tipo === "info") {
        toastElemento.className = "toast align-items-center text-white bg-primary border-0 shadow-lg";
        toastIcono.className = "bi bi-info-circle-fill fs-5";
    }

    toastMensaje.textContent = mensaje;

    const toast = new bootstrap.Toast(toastElemento, { delay: 3500 });
    toast.show();
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const referenciaUsuario = doc(db, "usuario", user.uid);
        const docSnap = await getDoc(referenciaUsuario);

        if (docSnap.exists()) {
            const datosUsuario = docSnap.data();

            cargarDatosEnPerfil(datosUsuario, user);
            configurarBotonesEdicion(user, referenciaUsuario);
            configurarModificarPassword(user);
            
            configurarEliminarCuenta(user, referenciaUsuario);
        } else {
            console.warn("No se encontraron datos adicionales en Firestore para este usuario.");
        }
    } else {
        window.location.href = "index.html";
    }
});