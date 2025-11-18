// ====== CONFIGURACIÓN GENERAL ======
const API_URL = "http://localhost:3000/api/movies";

// ====== CARGAR PELÍCULAS ======
document.addEventListener("DOMContentLoaded", loadMovies);

function loadMovies() {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => renderTable(data))
    .catch(err => console.error("Error al cargar:", err));
}

function renderTable(movies) {
  const body = document.getElementById("moviesBody");
  body.innerHTML = "";

  movies.forEach(movie => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${movie.id}</td>
      <td>${movie.title}</td>
      <td>${movie.genre}</td>
      <td>${movie.year}</td>
      <td><button onclick="editMovie(${movie.id})">✏️</button></td>
      <td><button onclick="deleteMovie(${movie.id})">🗑️</button></td>
    `;

    row.addEventListener("click", (e) => {
      if (!e.target.closest("button")) openModal(movie);
    });

    body.appendChild(row);
  });
}

// ====== FORMULARIO ======
function openForm() {
  document.getElementById("formContainer").style.display = "block";
  document.getElementById("formTitle").textContent = "Agregar Película";
  clearForm();
}

function closeForm() {
  document.getElementById("formContainer").style.display = "none";
}

function clearForm() {
  document.getElementById("movie-id").value = "";
  document.getElementById("title").value = "";
  document.getElementById("genre").value = "";
  document.getElementById("year").value = "";
  document.getElementById("poster").value = "";
  document.getElementById("description").value = "";
  document.getElementById("trailer").value = "";
}

// ====== GUARDAR ======
function saveMovie() {
  const id = document.getElementById("movie-id").value;

  const movie = {
    title: document.getElementById("title").value,
    genre: document.getElementById("genre").value,
    year: document.getElementById("year").value,
    poster: document.getElementById("poster").value,
    description: document.getElementById("description").value,
    trailer: document.getElementById("trailer").value
  };

  if (id) {
    updateMovie(id, movie);
  } else {
    createMovie(movie);
  }
}

function createMovie(movie) {
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie)
  })
    .then(() => {
      closeForm();
      loadMovies();
    })
    .catch(err => console.error("Error al crear:", err));
}

function updateMovie(id, movie) {
  fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie)
  })
    .then(() => {
      closeForm();
      loadMovies();
    })
    .catch(err => console.error("Error al editar:", err));
}

// ====== EDITAR ======
function editMovie(id) {
  fetch(`${API_URL}/${id}`)
    .then(res => res.json())
    .then(movie => {
      openForm();
      document.getElementById("formTitle").textContent = "Editar Película";

      document.getElementById("movie-id").value = movie.id;
      document.getElementById("title").value = movie.title;
      document.getElementById("genre").value = movie.genre;
      document.getElementById("year").value = movie.year;
      document.getElementById("poster").value = movie.poster;
      document.getElementById("description").value = movie.description;
      document.getElementById("trailer").value = movie.trailer;
    });
}

// ====== ELIMINAR ======
function deleteMovie(id) {
  if (!confirm("¿Seguro?")) return;

  fetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(() => loadMovies())
    .catch(err => console.error("Error al eliminar:", err));
}

// ====== MODAL ======
function openModal(movie) {
  document.getElementById("modalTitle").textContent = movie.title;
  document.getElementById("modalImage").src = movie.poster;
  document.getElementById("modalDescription").textContent = movie.description;

  const trailerID = movie.trailer.split("v=")[1];
  document.getElementById("modalTrailer").src =
    `https://www.youtube.com/embed/${trailerID}`;

  document.getElementById("movieModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("movieModal").style.display = "none";
  document.getElementById("modalTrailer").src = "";
}
