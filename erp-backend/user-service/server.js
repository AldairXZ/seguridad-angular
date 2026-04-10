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
      'user:view', 'user:add', 'user:edit', 'user:edit:profile', 'user:delete', 'users:manage',
      'group:view', 'group:add', 'group:edit', 'group:delete', 'group:manage',
      'ticket:view', 'ticket:add', 'ticket:edit', 'ticket:delete', 'ticket:edit:state', 'ticket:edit:comment', 'ticket:manage'
    ]
  }
];

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    const token = jwt.sign({ id: user.id, email: user.email, permisos: user.permisos }, SECRET_KEY, { expiresIn: '8h' });
    res.json({
      statusCode: 200,
      intOpCode: "SxUS200",
      data: [{ token, user }]
    });
  } else {
    res.status(401).json({
      statusCode: 401,
      intOpCode: "ERR401",
      data: [{ message: "Credenciales invalidas" }]
    });
  }
});

app.post('/auth/register', (req, res) => {
  const newUser = { id: Date.now(), ...req.body, permisos: ['ticket:view', 'user:edit:profile'] };
  users.push(newUser);
  res.status(201).json({
    statusCode: 201,
    intOpCode: "SxUS201",
    data: [newUser]
  });
});

app.listen(3001);