const fastify = require('fastify')({ logger: false });
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const NEON_URL = "postgresql://neondb_owner:npg_7Xt5WvJYkEKP@ep-broad-pond-amc5lzhv-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new Pool({
  connectionString: NEON_URL,
  ssl: { rejectUnauthorized: false }
});

fastify.register(require('@fastify/cors'), { 
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-data', 'x-group-id']
});

fastify.register(require('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: function (req, context) {
    return { statusCode: 429, intOpCode: "ERR429", data: [{ message: "Too many requests" }] };
  }
});

const SECRET_KEY = "erp_secret_key_2026";

const routesConfig = {
  '/auth/login': { target: 'http://localhost:3001/auth/login', auth: false },
  '/auth/register': { target: 'http://localhost:3001/auth/register', auth: false },
  '/api/users': { 
    target: 'http://localhost:3001/api/users', 
    auth: true, 
    perm: { GET: 'users:manage', POST: 'users:manage', PUT: 'users:manage', DELETE: 'users:manage' } 
  },
  '/api/tickets': { 
    target: 'http://localhost:3002/api/tickets', 
    auth: true, 
    perm: { GET: 'tickets:view', POST: 'tickets:add', PUT: 'tickets:move', PATCH: 'tickets:move', DELETE: 'tickets:manage' } 
  },
  '/api/groups': { 
    target: 'http://localhost:3003/api/groups', 
    auth: true, 
    perm: { GET: 'group:view', POST: 'groups:manage', PUT: 'groups:manage', DELETE: 'groups:manage' } 
  }
};

fastify.addHook('preHandler', async (request, reply) => {
  if (request.method === 'OPTIONS') return;
  
  const url = request.url.split('?')[0];
  const routeInfo = Object.entries(routesConfig).find(([key]) => url.startsWith(key));

  if (routeInfo && routeInfo[1].auth) {
    try {
      const authHeader = request.headers.authorization || request.headers.cookie;
      if (!authHeader) throw new Error();
      
      let token = '';
      if (authHeader.includes('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else {
        const match = authHeader.match(/erp_token=([^;]+)/);
        if (match) token = match[1];
        else throw new Error();
      }

      const decoded = jwt.verify(token, SECRET_KEY);
      request.user = decoded;

      if (routeInfo[1].perm) {
        const requiredPerm = routeInfo[1].perm[request.method];
        if (requiredPerm) {
          const groupId = request.headers['x-group-id'];
          const hasGlobal = decoded.permisos['global'] && decoded.permisos['global'].includes(requiredPerm);
          const hasGroup = groupId && decoded.permisos[groupId] && decoded.permisos[groupId].includes(requiredPerm);

          if (!hasGlobal && !hasGroup) {
            reply.code(403).send({ statusCode: 403, intOpCode: "ERR403", data: [{ message: "Forbidden" }] });
            return reply;
          }
        }
      }
    } catch (err) {
      reply.code(401).send({ statusCode: 401, intOpCode: "ERR401", data: [{ message: "Unauthorized" }] });
      return reply;
    }
  }
});

fastify.addHook('onError', (request, reply, error, done) => {
  request.raw.error_stack = error.stack;
  done();
});

fastify.addHook('onResponse', async (request, reply) => {
  if (request.method === 'OPTIONS') return;

  const endpoint = request.url.split('?')[0];
  const method = request.method;
  const user = request.user ? request.user.email : 'unauthenticated';
  const ip = request.ip;
  const status = reply.statusCode;
  const errorStack = request.raw.error_stack || null;
  const responseTime = reply.getResponseTime();

  try {
    await pool.query(
      `INSERT INTO logs (endpoint, method, "user", ip, status, error_stack) VALUES ($1, $2, $3, $4, $5, $6)`,
      [endpoint, method, user, ip, status, errorStack]
    );

    const metricsRes = await pool.query(`SELECT request_count, avg_time FROM metrics WHERE endpoint = $1`, [endpoint]);
    
    if (metricsRes.rows.length === 0) {
      await pool.query(`INSERT INTO metrics (endpoint, request_count, avg_time) VALUES ($1, 1, $2)`, [endpoint, responseTime]);
    } else {
      const row = metricsRes.rows[0];
      const newCount = row.request_count + 1;
      const newAvg = ((row.avg_time * row.request_count) + responseTime) / newCount;
      await pool.query(`UPDATE metrics SET request_count = $1, avg_time = $2 WHERE endpoint = $3`, [newCount, newAvg, endpoint]);
    }
  } catch (dbError) {
    // Si falla el loggeo, no queremos tumbar la petición principal
  }
});

fastify.route({
  method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  url: '/*',
  handler: async (request, reply) => {
    const url = request.url.split('?')[0];
    const routeInfo = Object.entries(routesConfig).find(([key]) => url.startsWith(key));

    if (!routeInfo) {
      return reply.code(404).send({ statusCode: 404, intOpCode: "ERR404", data: null });
    }

    try {
      const targetUrl = `${routeInfo[1].target}${request.url.replace(routeInfo[0], '')}`;
      
      const response = await axios({
        method: request.method,
        url: targetUrl,
        data: request.body,
        headers: { 'x-user-data': JSON.stringify(request.user || {}) }
      });
      return reply.code(response.status).send(response.data);
    } catch (error) {
      const status = error.response?.status || 500;
      const data = error.response?.data || { statusCode: status, intOpCode: "ERR500", data: null };
      return reply.code(status).send(data);
    }
  }
});

fastify.get('/api/health', async (request, reply) => {
  return reply.code(200).send({ 
    statusCode: 200, 
    intOpCode: "SxOK200", 
    data: [{ status: "Up", message: "El API Gateway está funcionando correctamente" }] 
  });
});

fastify.listen({ port: 3000, host: '0.0.0.0' });