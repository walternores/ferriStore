import { auth, db } from "./config.js"; 
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const form = document.getElementById("registerForm");
const passwordInput = document.getElementById("password");
const repetirPasswordInput = document.getElementById("repetirPassword");
const emailInput = document.getElementById("email");
const registerError = document.getElementById("registerError");
const submitBtn = form ? form.querySelector('button[type="submit"]') : null;


let timerOverlay = null;


const regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexDoc = /^[0-9]{6,9}$/;

function validarContrasenia() {
  if (!regexPassword.test(passwordInput.value)) {
    passwordInput.setCustomValidity("Requisitos no cumplidos.");
    passwordInput.classList.add("is-invalid");
    passwordInput.classList.remove("is-valid");
    return false;
  }
  passwordInput.setCustomValidity("");
  passwordInput.classList.remove("is-invalid");
  passwordInput.classList.add("is-valid");
  return true;
}

function validarCoincidenciaContrasenias() {
  if (repetirPasswordInput.value === "" || passwordInput.value !== repetirPasswordInput.value) {
    repetirPasswordInput.setCustomValidity("No coinciden.");
    repetirPasswordInput.classList.add("is-invalid");
    repetirPasswordInput.classList.remove("is-valid");
    return false;
  }
  repetirPasswordInput.setCustomValidity("");
  repetirPasswordInput.classList.remove("is-invalid");
  repetirPasswordInput.classList.add("is-valid");
  return true;
}

function validarEmail() {
  if (!regexEmail.test(emailInput.value.trim())) {
    emailInput.setCustomValidity("Email inválido.");
    return false;
  }
  emailInput.setCustomValidity("");
  return true;
}


if (passwordInput) {
  passwordInput.addEventListener("input", () => {
    validarContrasenia();
    if (repetirPasswordInput.value !== "") validarCoincidenciaContrasenias();
  });
}
if (repetirPasswordInput) repetirPasswordInput.addEventListener("input", validarCoincidenciaContrasenias);
if (emailInput) emailInput.addEventListener("input", validarEmail);


function ocultarError() {
  if (registerError) {
    registerError.textContent = "";
    registerError.classList.add("d-none");
  }
}

function mostrarError(mensaje) {
  if (registerError) {
    registerError.textContent = mensaje || "Ocurrió un error inesperado.";
    registerError.classList.remove("d-none");
  }
}

function deshabilitarBoton(deshabilitar) {
  if (submitBtn) submitBtn.disabled = deshabilitar;
}

function traducirError(codigo) {
  switch (codigo) {
    case "auth/email-already-in-use": return "El correo electrónico ya está registrado.";
    case "auth/invalid-email": return "El correo electrónico no es válido.";
    case "auth/weak-password": return "La contraseña es muy débil.";
    default: return "Ocurrió un error al registrar el usuario.";
  }
}

function mostrarRegistroExitoso(onComplete) {
  const overlay = document.getElementById("successOverlay");
  const cerrarBtn = document.getElementById("cerrarOverlayBtn");

  const cardFormulario = document.querySelector(".register-card") || form;
  if (cardFormulario) {
    cardFormulario.style.visibility = "hidden";
  }

  if (overlay) {
    overlay.classList.remove("d-none");
    overlay.classList.add("position-fixed", "top-0", "start-0", "w-100", "h-100", "bg-white");
    overlay.style.zIndex = "9999";

    const ocultarYRedirigir = () => {
      overlay.classList.add("d-none");
      if (timerOverlay) clearTimeout(timerOverlay);
      if (onComplete) onComplete();
    };

    if (cerrarBtn) cerrarBtn.addEventListener("click", ocultarYRedirigir, { once: true });
    timerOverlay = setTimeout(ocultarYRedirigir, 3000);
  } else if (onComplete) {
    onComplete();
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const esPassValida = validarContrasenia();
    const coinciden = validarCoincidenciaContrasenias();
    const emailValido = validarEmail();
  

    form.classList.add("was-validated");

    if (!form.checkValidity() || !esPassValida || !coinciden || !emailValido ) {
      return;
    }

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = emailInput.value.trim();
    
    const password = passwordInput.value;
   
    
    ocultarError();
    deshabilitarBoton(true);

    try {
      
      const credenciales = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credenciales.user.uid;

      await updateProfile(credenciales.user, {
        displayName: `${nombre} ${apellido}`
      
      });

      await setDoc(doc(db, "usuario", uid), {
        nombre,
        apellido,
        email,
        rol: "cliente",
      });

      mostrarRegistroExitoso(() => {
        window.location.href = "index.html"; 
      });

    } catch (error) {
      console.error("Error al registrar:", error);
      mostrarError(traducirError(error?.code));
      deshabilitarBoton(false);
    }
  });
}