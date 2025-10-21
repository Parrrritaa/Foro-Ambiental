document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formOpiniones");
  const opinionesDiv = document.getElementById("opiniones");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const anonimo = document.getElementById("anonimo").checked;
    const opinion = document.getElementById("opinion").value.trim();

    if (opinion === "") return;

    const autor = anonimo || nombre === "" ? "Anónimo" : nombre;

    const nuevaOpinion = document.createElement("div");
    nuevaOpinion.classList.add("opinion");
    nuevaOpinion.innerHTML = `<strong>${autor}:</strong> <p>${opinion}</p>`;

    opinionesDiv.prepend(nuevaOpinion);

    form.reset();
  });
});
