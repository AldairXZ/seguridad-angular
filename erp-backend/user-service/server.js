const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "erp_secret_key_2026";

const users = [
  {
    id: 1,
    email: 'admin@marher.com',
    password: 'password',
    nombre: 'Admin Master',
    permisos: [
      'user:view', 'users:manage',
      'group:view', 'groups:manage',
      'tickets:view', 'tickets:add', 'tickets:move', 'tickets:manage'
    ]
  }
];

const validateRegister = (req, res, next) => {
  const { usuario, nombreCompleto, email, direccion, telefono, fechaNacimiento, password } = req.body;
  const errores = [];

  if (!usuario || typeof usuario !== 'string' || usuario.length < 3) errores.push("Usuario inválido");
  if (!nombreCompleto || typeof nombreCompleto !== 'string') errores.push("Nombre requerido");
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) errores.push("Formato de email inválido");
  
  if (!direccion || typeof direccion !== 'string') errores.push("Dirección requerida");
  
  const telRegex = /^[0-9]+$/;
  if (!telefono || !telRegex.test(telefono)) errores.push("Teléfono debe ser numérico");
  
  if (!fechaNacimiento) errores.push("Fecha requerida");
  
  if (!password || typeof password !== 'string' || password.length < 8) errores.push("Contraseña insegura");

  if (errores.length > 0) {
    return res.status(400).json({
      statusCode: 400,
      intOpCode: "ERR400",
      data: [{ message: "Errores de validación", detalles: errores }]
    });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(409).json({
      statusCode: 409,
      intOpCode: "ERR409",
      data: [{ message: "El correo ya está registrado" }]
    });
  }

  next();
};

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = jwt.sign({ id: user.id, email: user.email, permisos: user.permisos }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ statusCode: 200, intOpCode: "SxUS200", data: [{ token, user }] });
  } else {
    res.status(401).json({ statusCode: 401, intOpCode: "ERR401", data: [{ message: "Credenciales invalidas" }] });
  }
});

app.post('/auth/register', validateRegister, (req, res) => {
  const newUser = { 
    id: Date.now(), 
    email: req.body.email,
    password: req.body.password,
    nombre: req.body.nombreCompleto,
    permisos: ['tickets:view'] 
  };
  users.push(newUser);
  res.status(201).json({ statusCode: 201, intOpCode: "SxUS201", data: [newUser] });
});

app.listen(3001);