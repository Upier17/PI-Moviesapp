import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Conexión a SQLite (base de datos en memoria si no existe)
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("Error al conectar a la BD:", err);
  else console.log("Base de datos conectada");
});

// Crear tabla si no existe y agregar datos de ejemplo automáticamente
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      genre TEXT,
      year TEXT,
      poster TEXT,
      description TEXT,
      trailer TEXT
    )
  `, (err) => {
    if (err) return console.error(err.message);

    // Insertar datos de ejemplo solo si la tabla está vacía
    db.get("SELECT COUNT(*) as count FROM movies", (err, row) => {
      if (err) return console.error(err.message);

      if (row.count === 0) {
        db.run(`
          INSERT INTO movies (title, genre, year, poster, description, trailer) VALUES
          ('Matrix', 'Ciencia Ficción', '1999', '', 'Película de acción y ciencia ficción', 'https://www.youtube.com/watch?v=vKQi3bBA1y8'),
          ('Inception', 'Suspenso', '2010', '', 'Sueños dentro de sueños', 'https://www.youtube.com/watch?v=YoHD9XEInc0')
        `, (err) => {
          if (err) console.error(err.message);
          else console.log("Datos de ejemplo insertados");
        });
      }
    });
  });
});

// ======== RUTAS CRUD ========

// Obtener todas
app.get("/api/movies", (req, res) => {
  db.all("SELECT * FROM movies", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// Obtener una
app.get("/api/movies/:id", (req, res) => {
  db.get("SELECT * FROM movies WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).send(err.message);
    res.json(row);
  });
});

// Crear
app.post("/api/movies", (req, res) => {
  const { title, genre, year, poster, description, trailer } = req.body;
  db.run(
    `INSERT INTO movies (title, genre, year, poster, description, trailer) VALUES (?, ?, ?, ?, ?, ?)`,
    [title, genre, year, poster, description, trailer],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({
        id: this.lastID,
        title,
        genre,
        year,
        poster,
        description,
        trailer
      });
    }
  );
});

// Editar
app.put("/api/movies/:id", (req, res) => {
  const { title, genre, year, poster, description, trailer } = req.body;
  db.run(
    `UPDATE movies SET title=?, genre=?, year=?, poster=?, description=?, trailer=? WHERE id=?`,
    [title, genre, year, poster, description, trailer, req.params.id],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({
        id: req.params.id,
        title,
        genre,
        year,
        poster,
        description,
        trailer
      });
    }
  );
});

// Eliminar
app.delete("/api/movies/:id", (req, res) => {
  db.run(`DELETE FROM movies WHERE id=?`, [req.params.id], function (err) {
    if (err) return res.status(500).send(err.message);
    res.json({ message: "Película eliminada" });
  });
});

// Iniciar servidor
app.listen(PORT, () =>
  console.log(`Servidor corriendo en puerto ${PORT}`)
);
