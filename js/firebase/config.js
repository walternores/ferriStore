import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyD5dSvrBg84nOC3C5Ko3Qfug4buNRsiYNM",
  authDomain: "myfirstproyecto-932eb.firebaseapp.com",
  databaseURL: "https://myfirstproyecto-932eb-default-rtdb.firebaseio.com",
  projectId: "myfirstproyecto-932eb",
  storageBucket: "myfirstproyecto-932eb.firebasestorage.app",
  messagingSenderId: "22026012138",
  appId: "1:22026012138:web:71319e94cf91641adc5e93"

};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);