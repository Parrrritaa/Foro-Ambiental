import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, query, orderBy, doc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// 🔧 Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAa-ryPSIKuxNLIF9hW05brZbhGXhewirA",
  authDomain: "foroambiental-9cd1d.firebaseapp.com",
  projectId: "foroambiental-9cd1d",
  storageBucket: "foroambiental-9cd1d.appspot.com",
  messagingSenderId: "982048302221",
  appId: "1:982048302221:web:a5c43c2c498dc44e306ec4",
  measurementId: "G-LL5VWNJJFW"
};

// 🚀 Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🎨 Colores posibles para los nombres
const colores = ["#2d572c", "#005f73", "#9c27b0", "#c62828", "#1565c0", "#f57c00", "#388e3c"];
function colorAleatorio() {
  return colores[Math.floor(Math.random() * colores.length)];
}

// 📩 Enviar nueva opinión
const form = document.getElementById("formOpiniones");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const anonimo = document.getElementById("anonimo").checked;
  const opinion = document.getElementById("opinion").value.trim();
  const autor = anonimo || nombre === "" ? "Anónimo" : nombre;

  if (!opinion) return alert("Por favor escribe una opinión.");

  try {
    await addDoc(collection(db, "opiniones"), {
      autor,
      opinion,
      fecha: new Date().toISOString()
    });
    form.reset();
    mostrarOpiniones();
  } catch (err) {
    console.error("Error guardando opinión:", err);
  }
});

// 📜 Mostrar opiniones y sus respuestas
async function mostrarOpiniones() {
  const contenedor = document.getElementById("opiniones");
  contenedor.innerHTML = "<p>Cargando opiniones...</p>";

  const consulta = query(collection(db, "opiniones"), orderBy("fecha", "desc"));
  const snapshot = await getDocs(consulta);

  contenedor.innerHTML = "";
  for (const opinionDoc of snapshot.docs) {
    const data = opinionDoc.data();
    const opinionDiv = document.createElement("div");
    opinionDiv.classList.add("opinion");

    const color = colorAleatorio();
    opinionDiv.innerHTML = `
      <h3 style="color:${color}">${data.autor}</h3>
      <p>${data.opinion}</p>
      <small>${new Date(data.fecha).toLocaleString()}</small>
      <button class="responder-btn">Responder</button>
      <div class="respuestas"></div>
    `;

    // Formulario de respuesta
    const btn = opinionDiv.querySelector(".responder-btn");
    const respuestasDiv = opinionDiv.querySelector(".respuestas");
    btn.addEventListener("click", () => mostrarFormularioRespuesta(opinionDoc.id, respuestasDiv));

    contenedor.appendChild(opinionDiv);

    // Cargar respuestas
    await mostrarRespuestas(opinionDoc.id, respuestasDiv);
  }

  if (snapshot.empty) contenedor.innerHTML = "<p>Aún no hay opiniones publicadas.</p>";
}

// 🧾 Mostrar formulario de respuesta
function mostrarFormularioRespuesta(opinionId, contenedor) {
  contenedor.innerHTML = `
    <form class="formRespuesta">
      <input type="text" placeholder="Tu nombre (opcional)" class="nombre-resp">
      <label><input type="checkbox" class="anonimo-resp"> Anónimo</label>
      <textarea placeholder="Escribe tu respuesta..." required></textarea>
      <button type="submit">Publicar respuesta</button>
    </form>
  `;

  const form = contenedor.querySelector(".formRespuesta");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = form.querySelector(".nombre-resp").value.trim();
    const anonimo = form.querySelector(".anonimo-resp").checked;
    const texto = form.querySelector("textarea").value.trim();
    const autor = anonimo || nombre === "" ? "Anónimo" : nombre;

    if (!texto) return;

    await addDoc(collection(db, "opiniones", opinionId, "respuestas"), {
      autor,
      texto,
      fecha: new Date().toISOString()
    });

    form.reset();
    mostrarRespuestas(opinionId, contenedor);
  });
}

// 💬 Mostrar respuestas
async function mostrarRespuestas(opinionId, contenedor) {
  const respuestasSnap = await getDocs(
    query(collection(db, "opiniones", opinionId, "respuestas"), orderBy("fecha", "asc"))
  );

  const lista = document.createElement("div");
  lista.classList.add("lista-respuestas");
  respuestasSnap.forEach((doc) => {
    const data = doc.data();
    const color = colorAleatorio();
    const div = document.createElement("div");
    div.classList.add("respuesta");
    div.innerHTML = `
      <strong style="color:${color}">${data.autor}</strong>
      <p>${data.texto}</p>
      <small>${new Date(data.fecha).toLocaleString()}</small>
    `;
    lista.appendChild(div);
  });

  contenedor.innerHTML = "";
  contenedor.appendChild(lista);
}

mostrarOpiniones();
