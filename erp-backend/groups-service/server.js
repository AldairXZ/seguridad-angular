const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let groups = [
  { id: 1, nombre: 'Proyecto Alpha', categoria: 'Desarrollo', nivel: 'Alto', autor: 'admin@marher.com', miembros: 5, tickets: 12 },
  { id: 2, nombre: 'Soporte TI', categoria: 'Mantenimiento', nivel: 'Medio', autor: 'pm@marher.com', miembros: 3, tickets: 8 }
];

const validateGroup = (req, res, next) => {
  const { nombre } = req.body;
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    return res.status(400).json({ statusCode: 400, intOpCode: "ERR400", data: [{ message: "Datos inválidos" }] });
  }
  next();
};

app.get('/api/groups', (req, res) => {
  res.json({ statusCode: 200, intOpCode: "SxGR200", data: groups });
});

app.post('/api/groups', validateGroup, (req, res) => {
  const userData = JSON.parse(req.headers['x-user-data'] || '{}');
  const newGroup = {
    id: Date.now(),
    ...req.body,
    autor: userData.email || 'desconocido',
    miembros: 1,
    tickets: 0
  };
  groups.push(newGroup);
  res.status(201).json({ statusCode: 201, intOpCode: "SxGR201", data: [newGroup] });
});

app.put('/api/groups/:id', validateGroup, (req, res) => {
  const index = groups.findIndex(g => g.id === parseInt(req.params.id));
  if (index !== -1) {
    groups[index] = { ...groups[index], ...req.body };
    res.json({ statusCode: 200, intOpCode: "SxGR200", data: [groups[index]] });
  } else {
    res.status(404).json({ statusCode: 404, intOpCode: "ERR404", data: [] });
  }
});

app.delete('/api/groups/:id', (req, res) => {
  groups = groups.filter(g => g.id !== parseInt(req.params.id));
  res.json({ statusCode: 200, intOpCode: "SxGR200", data: [] });
});

app.listen(3003);