const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

const NEON_URL = "postgresql://neondb_owner:npg_7Xt5WvJYkEKP@ep-broad-pond-amc5lzhv-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new Pool({
  connectionString: NEON_URL,
  ssl: { rejectUnauthorized: false }
});

const validateGroup = (req, res, next) => {
  const { nombre } = req.body;
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ statusCode: 400, intOpCode: "ERR400", data: [{ message: "Datos inválidos" }] });
  }
  next();
};

app.get('/api/groups', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM groups ORDER BY id ASC');
    res.json({ statusCode: 200, intOpCode: "SxGR200", data: rows });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: [] });
  }
});

app.post('/api/groups', validateGroup, async (req, res) => {
  const userData = JSON.parse(req.headers['x-user-data'] || '{}');
  const autor = userData.email || 'desconocido';

  try {
    const { rows } = await pool.query(
      `INSERT INTO groups (nombre, categoria, nivel, autor, miembros, tickets) 
       VALUES ($1, $2, $3, $4, 1, 0) RETURNING *`,
      [req.body.nombre, req.body.categoria, req.body.nivel, autor]
    );
    res.status(201).json({ statusCode: 201, intOpCode: "SxGR201", data: rows });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: [] });
  }
});

app.put('/api/groups/:id', validateGroup, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE groups SET nombre = $1, categoria = $2, nivel = $3 WHERE id = $4 RETURNING *`,
      [req.body.nombre, req.body.categoria, req.body.nivel, id]
    );
    if (rows.length === 0) return res.status(404).json({ statusCode: 404, data: [] });
    res.json({ statusCode: 200, intOpCode: "SxGR200", data: rows });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: [] });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM groups WHERE id = $1', [id]);
    res.json({ statusCode: 200, intOpCode: "SxGR200", data: [] });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: [] });
  }
});

app.listen(3003);