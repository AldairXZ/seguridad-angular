const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "erp_secret_key_2026";
const NEON_URL = "postgresql://neondb_owner:npg_7Xt5WvJYkEKP@ep-broad-pond-amc5lzhv-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString: NEON_URL,
  ssl: { rejectUnauthorized: false }
});

const validateRegister = async (req, res, next) => {
  const { nombreCompleto, email, password } = req.body;
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ statusCode: 400, intOpCode: "ERR400", data: [{ message: "Datos inválidos o contraseña insegura" }] });
  }

  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ statusCode: 409, intOpCode: "ERR409", data: [{ message: "El correo ya está registrado" }] });
    }
    next();
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: [{ message: error.message }] });
  }
};

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
    
    if (rows.length > 0) {
      const user = rows[0];
      const token = jwt.sign({ id: user.id, email: user.email, permisos: user.permisos }, SECRET_KEY, { expiresIn: '8h' });
      const { password: pwd, ...userPublic } = user;
      res.json({ statusCode: 200, intOpCode: "SxUS200", data: [{ token, user: userPublic }] });
    } else {
      res.status(401).json({ statusCode: 401, intOpCode: "ERR401", data: [{ message: "Credenciales invalidas" }] });
    }
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: [{ message: error.message }] });
  }
});

app.post('/auth/register', validateRegister, async (req, res) => {
  const { email, password, nombreCompleto } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password, nombre, permisos) VALUES ($1, $2, $3, $4) RETURNING id, email, nombre, permisos`,
      [email, password, nombreCompleto, JSON.stringify({ 'global': [] })]
    );
    res.status(201).json({ statusCode: 201, intOpCode: "SxUS201", data: rows });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: [{ message: error.message }] });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, email, nombre, permisos FROM users ORDER BY id ASC');
    res.json({ statusCode: 200, intOpCode: "SxUS200", data: rows });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: [] });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE users SET nombre = $1, email = $2 WHERE id = $3 RETURNING id, email, nombre, permisos',
      [nombre, email, id]
    );
    if (rows.length === 0) return res.status(404).json({ statusCode: 404, data: [] });
    res.json({ statusCode: 200, intOpCode: "SxUS200", data: rows });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: [] });
  }
});

app.put('/api/users/:id/permissions', async (req, res) => {
  const { id } = req.params;
  const { groupId, permisos } = req.body; 

  try {
    const userRes = await pool.query('SELECT permisos FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) return res.status(404).json({ statusCode: 404, data: [] });

    let updatedPerms = userRes.rows[0].permisos || {};
    updatedPerms[groupId] = permisos;

    const { rows } = await pool.query(
      'UPDATE users SET permisos = $1 WHERE id = $2 RETURNING id, email, nombre, permisos',
      [JSON.stringify(updatedPerms), id]
    );
    res.json({ statusCode: 200, intOpCode: "SxUS200", data: rows });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: [] });
  }
});

app.listen(3001);