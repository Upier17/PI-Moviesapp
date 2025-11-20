import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

await db.query(`
  CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    genre VARCHAR(255),
    year VARCHAR(10),
    poster TEXT,
    description TEXT,
    trailer TEXT
  )
`);


// Insertar datos de ejemplo si la tabla está vacía
const [rows] = await db.query("SELECT COUNT(*) AS count FROM movies");
if (rows[0].count === 0) {
  await db.query(`
    INSERT INTO movies (title, genre, year, poster, description, trailer)
    VALUES
    ('Matrix', 'Ciencia Ficción', '1999', '', 'Película de acción y ciencia ficción', 'https://www.youtube.com/watch?v=vKQi3bBA1y8'),
    ('Inception', 'Suspenso', '2010', '', 'Sueños dentro de sueños', 'https://www.youtube.com/watch?v=YoHD9XEInc0')
  `);
}


// ======== RUTAS CRUD ========

// Obtener todas
app.get("/api/movies", async (req, res) => {
  const [movies] = await db.query("SELECT * FROM movies");
  res.json(movies);
});

// Obtener una
app.get("/api/movies/:id", async (req, res) => {
  const [movie] = await db.query("SELECT * FROM movies WHERE id = ?", [req.params.id]);
  res.json(movie[0]);
});

// Crear
app.post("/api/movies", async (req, res) => {
  const { title, genre, year, poster, description, trailer } = req.body;
  
  const [result] = await db.query(
    `INSERT INTO movies (title, genre, year, poster, description, trailer)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, genre, year, poster, description, trailer]
  );

  res.json({ 
    id: result.insertId,
    title, genre, year, poster, description, trailer 
  });
});

// Editar
app.put("/api/movies/:id", async (req, res) => {
  const { title, genre, year, poster, description, trailer } = req.body;

  await db.query(
    `UPDATE movies
     SET title = ?, genre = ?, year = ?, poster = ?, description = ?, trailer = ?
     WHERE id = ?`,
    [title, genre, year, poster, description, trailer, req.params.id]
  );

  res.json({ id: req.params.id, title, genre, year, poster, description, trailer });
});

// Eliminar
app.delete("/api/movies/:id", async (req, res) => {
  await db.query("DELETE FROM movies WHERE id = ?", [req.params.id]);
  res.json({ message: "Película eliminada" });
});

// Iniciar servidor
app.listen(PORT, () => 
  console.log(`Servidor corriendo en puerto ${PORT}`)
);
