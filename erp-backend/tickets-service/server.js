const fastify = require('fastify')({ logger: false });
const { Pool } = require('pg');

const NEON_URL = "postgresql://neondb_owner:npg_7Xt5WvJYkEKP@ep-broad-pond-amc5lzhv-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new Pool({
  connectionString: NEON_URL,
  ssl: { rejectUnauthorized: false }
});

fastify.get('/api/tickets', async (request, reply) => {
  const { groupId } = request.query;
  try {
    let query = 'SELECT * FROM tickets ORDER BY id DESC';
    let values = [];
    
    if (groupId) {
      query = 'SELECT * FROM tickets WHERE "groupId" = $1 ORDER BY id DESC';
      values = [parseInt(groupId)];
    }
    
    const { rows } = await pool.query(query, values);
    return { statusCode: 200, intOpCode: "SxTK200", data: rows };
  } catch (error) {
    return reply.code(500).send({ statusCode: 500, intOpCode: "ERR500", data: [] });
  }
});

fastify.post('/api/tickets', async (request, reply) => {
  const userData = JSON.parse(request.headers['x-user-data'] || '{}');
  const autor = userData.email || 'desconocido';
  const asignadoA = request.body.asignadoA || autor;
  const fechaCreacion = new Date().toISOString().split('T')[0];

  try {
    const { rows } = await pool.query(
      `INSERT INTO tickets ("groupId", titulo, descripcion, "estadoActual", autor, "asignadoA", prioridad, "fechaCreacion", comentarios, "historialCambios") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [request.body.groupId, request.body.titulo, request.body.descripcion || '', request.body.estadoActual, autor, asignadoA, request.body.prioridad, fechaCreacion, request.body.comentarios || '', 'Creado']
    );
    reply.code(201).send({ statusCode: 201, intOpCode: "SxTK201", data: rows });
  } catch (error) {
    reply.code(500).send({ statusCode: 500, data: [{ message: error.message }] });
  }
});

fastify.patch('/api/tickets/:id/status', async (request, reply) => {
  const { id } = request.params;
  const { estadoActual } = request.body;
  const userData = JSON.parse(request.headers['x-user-data'] || '{}');
  
  try {
    const ticketRes = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (ticketRes.rows.length === 0) return reply.code(404).send({ statusCode: 404, data: [] });
    const ticket = ticketRes.rows[0];

    const esAdmin = userData.permisos && userData.permisos['global'] && userData.permisos['global'].includes('tickets:manage');
    const esAsignado = ticket.asignadoA === userData.email;

    if (!esAdmin && !esAsignado) {
      return reply.code(403).send({ statusCode: 403, intOpCode: "ERR403", data: [{ message: "Solo el usuario asignado o un admin puede mover este ticket" }] });
    }

    const nuevoHistorial = ticket.historialCambios + `\n${ticket.estadoActual} -> ${estadoActual}`;
    
    const { rows } = await pool.query(
      `UPDATE tickets SET "estadoActual" = $1, "historialCambios" = $2 WHERE id = $3 RETURNING *`,
      [estadoActual, nuevoHistorial, id]
    );
    return { statusCode: 200, intOpCode: "SxTK200", data: rows };
  } catch (error) {
    return reply.code(500).send({ statusCode: 500, data: [] });
  }
});

fastify.put('/api/tickets/:id', async (request, reply) => {
  const { id } = request.params;
  const userData = JSON.parse(request.headers['x-user-data'] || '{}');
  
  try {
    const ticketRes = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    if (ticketRes.rows.length === 0) return reply.code(404).send({ statusCode: 404, data: [] });
    const ticket = ticketRes.rows[0];

    const esAdmin = userData.permisos && userData.permisos['global'] && userData.permisos['global'].includes('tickets:manage');
    const esAsignado = ticket.asignadoA === userData.email;

    if (!esAdmin && !esAsignado) {
      return reply.code(403).send({ statusCode: 403, intOpCode: "ERR403", data: [{ message: "No tienes permisos" }] });
    }

    const { rows } = await pool.query(
      `UPDATE tickets SET titulo = $1, descripcion = $2, prioridad = $3, "asignadoA" = $4 WHERE id = $5 RETURNING *`,
      [request.body.titulo, request.body.descripcion, request.body.prioridad, request.body.asignadoA, id]
    );
    return { statusCode: 200, intOpCode: "SxTK200", data: rows };
  } catch (error) {
    return reply.code(500).send({ statusCode: 500, data: [] });
  }
});

fastify.delete('/api/tickets/:id', async (request, reply) => {
  const { id } = request.params;
  const userData = JSON.parse(request.headers['x-user-data'] || '{}');
  
  const esAdmin = userData.permisos && userData.permisos['global'] && userData.permisos['global'].includes('tickets:manage');

  if (!esAdmin) {
    return reply.code(403).send({ statusCode: 403, intOpCode: "ERR403", data: [{ message: "Acción reservada para administradores" }] });
  }

  try {
    await pool.query('DELETE FROM tickets WHERE id = $1', [id]);
    return { statusCode: 200, intOpCode: "SxTK200", data: [] };
  } catch (error) {
    return reply.code(500).send({ statusCode: 500, data: [] });
  }
});

fastify.listen({ port: 3002, host: '0.0.0.0' });