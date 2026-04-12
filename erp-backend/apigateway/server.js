const fastify = require('fastify')({ logger: false });
const axios = require('axios');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./erp_auditoria.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, endpoint TEXT, method TEXT, user TEXT, ip TEXT, status INTEGER, error_stack TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
  db.run("CREATE TABLE IF NOT EXISTS metrics (endpoint TEXT PRIMARY KEY, request_count INTEGER, avg_time REAL)");
});

fastify.register(require('@fastify/cors'), { 
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-data']
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
        if (requiredPerm && !decoded.permisos.includes(requiredPerm)) {
          reply.code(403).send({ statusCode: 403, intOpCode: "ERR403", data: [{ message: "Forbidden" }] });
          return reply;
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

fastify.addHook('onResponse', (request, reply, done) => {
  if (request.method === 'OPTIONS') return done();

  const endpoint = request.url.split('?')[0];
  const method = request.method;
  const user = request.user ? request.user.email : 'unauthenticated';
  const ip = request.ip;
  const status = reply.statusCode;
  const errorStack = request.raw.error_stack || null;
  const responseTime = reply.getResponseTime();

  db.run(`INSERT INTO logs (endpoint, method, user, ip, status, error_stack) VALUES (?, ?, ?, ?, ?, ?)`,
    [endpoint, method, user, ip, status, errorStack]
  );

  db.get(`SELECT request_count, avg_time FROM metrics WHERE endpoint = ?`, [endpoint], (err, row) => {
    if (!row) {
      db.run(`INSERT INTO metrics (endpoint, request_count, avg_time) VALUES (?, 1, ?)`, [endpoint, responseTime]);
    } else {
      const newCount = row.request_count + 1;
      const newAvg = ((row.avg_time * row.request_count) + responseTime) / newCount;
      db.run(`UPDATE metrics SET request_count = ?, avg_time = ? WHERE endpoint = ?`, [newCount, newAvg, endpoint]);
    }
  });

  done();
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

fastify.listen({ port: 3000, host: '0.0.0.0' });