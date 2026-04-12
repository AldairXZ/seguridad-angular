const fastify = require('fastify')({ logger: false });

let tickets = [
  { id: 1, groupId: 1, titulo: 'Diseño de Base de Datos', descripcion: 'Crear esquema', estadoActual: 'En progreso', autor: 'admin@marher.com', asignadoA: 'dev@marher.com', prioridad: 'Alta', fechaCreacion: '2026-03-01', fechaLimite: '2026-03-10', comentarios: 'Revisar normalización', historialCambios: 'Pendiente -> En progreso' },
  { id: 2, groupId: 1, titulo: 'Crear Landing Page', descripcion: 'Maquetar página', estadoActual: 'Finalizado', autor: 'dev@marher.com', asignadoA: 'support@marher.com', prioridad: 'Media', fechaCreacion: '2026-03-02', fechaLimite: '2026-03-05', comentarios: 'Aprobado', historialCambios: 'En progreso -> Finalizado' },
  { id: 3, groupId: 2, titulo: 'Reparar Servidor', descripcion: 'Caché saturada', estadoActual: 'Pendiente', autor: 'pm@marher.com', asignadoA: 'dev@marher.com', prioridad: 'Urgente', fechaCreacion: '2026-03-15', fechaLimite: '2026-03-16', comentarios: '', historialCambios: 'Creado' }
];

const ticketSchema = {
  body: {
    type: 'object',
    required: ['titulo', 'estadoActual', 'prioridad', 'groupId'],
    properties: {
      titulo: { type: 'string', minLength: 3 },
      descripcion: { type: 'string' },
      estadoActual: { type: 'string' },
      prioridad: { type: 'string' },
      asignadoA: { type: 'string' },
      groupId: { type: 'number' }
    }
  }
};

fastify.get('/api/tickets', async (request, reply) => {
  const { groupId } = request.query;
  let result = tickets;
  
  if (groupId) {
    result = tickets.filter(t => t.groupId === parseInt(groupId));
  }
  
  return { statusCode: 200, intOpCode: "SxTK200", data: result };
});

fastify.post('/api/tickets', { schema: ticketSchema }, async (request, reply) => {
  const userData = JSON.parse(request.headers['x-user-data'] || '{}');
  const newTicket = {
    id: Date.now(),
    ...request.body,
    autor: userData.email || 'desconocido',
    fechaCreacion: new Date().toISOString().split('T')[0],
    historialCambios: 'Creado'
  };
  tickets.push(newTicket);
  reply.code(201).send({ statusCode: 201, intOpCode: "SxTK201", data: [newTicket] });
});

fastify.patch('/api/tickets/:id/status', async (request, reply) => {
  const { id } = request.params;
  const { estadoActual } = request.body;
  const index = tickets.findIndex(t => t.id === parseInt(id));
  
  if (index === -1) {
    return reply.code(404).send({ statusCode: 404, intOpCode: "ERR404", data: [] });
  }

  tickets[index].historialCambios += `\n${tickets[index].estadoActual} -> ${estadoActual}`;
  tickets[index].estadoActual = estadoActual;
  
  return { statusCode: 200, intOpCode: "SxTK200", data: [tickets[index]] };
});

fastify.listen({ port: 3002, host: '0.0.0.0' });