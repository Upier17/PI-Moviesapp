import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración básica
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Conexión a SQLite
const db = new Database(path.join(__dirname, "database.db"));

// Crear tabla si no existe
db.prepare(`
  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    genre TEXT,
    year TEXT,
    poster TEXT,
    description TEXT,
    trailer TEXT
  )
`).run();

// Insertar datos de ejemplo si la tabla está vacía
const rowCount = db.prepare("SELECT COUNT(*) as count FROM movies").get();
if (rowCount.count === 0) {
  db.prepare(`
    INSERT INTO movies (title, genre, year, poster, description, trailer) VALUES
    ('Matrix', 'Ciencia Ficción', '1999', '', 'Película de acción y ciencia ficción', 'https://www.youtube.com/watch?v=vKQi3bBA1y8'),
    ('Inception', 'Suspenso', '2010', '', 'Sueños dentro de sueños', 'https://www.youtube.com/watch?v=YoHD9XEInc0')
  `).run();
}

// ======== RUTAS CRUD ========

// Obtener todas
app.get("/api/movies", (req, res) => {
  const movies = db.prepare("SELECT * FROM movies").all();
  res.json(movies);
});

// Obtener una
app.get("/api/movies/:id", (req, res) => {
  const movie = db.prepare("SELECT * FROM movies WHERE id = ?").get(req.params.id);
  res.json(movie);
});

// Crear
app.post("/api/movies", (req, res) => {
  const { title, genre, year, poster, description, trailer } = req.body;
  const stmt = db.prepare(`
    INSERT INTO movies (title, genre, year, poster, description, trailer)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(title, genre, year, poster, description, trailer);
  res.json({ id: info.lastInsertRowid, title, genre, year, poster, description, trailer });
});

// Editar
app.put("/api/movies/:id", (req, res) => {
  const { title, genre, year, poster, description, trailer } = req.body;
  db.prepare(`
    UPDATE movies
    SET title = ?, genre = ?, year = ?, poster = ?, description = ?, trailer = ?
    WHERE id = ?
  `).run(title, genre, year, poster, description, trailer, req.params.id);
  res.json({ id: req.params.id, title, genre, year, poster, description, trailer });
});

// Eliminar
app.delete("/api/movies/:id", (req, res) => {
  db.prepare("DELETE FROM movies WHERE id = ?").run(req.params.id);
  res.json({ message: "Película eliminada" });
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
