const fastify = require('fastify')({ logger: false });
const axios = require('axios');
const jwt = require('jsonwebtoken');

fastify.register(require('@fastify/cors'), { origin: '*' });

fastify.register(require('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute',
  errorResponseBuilder: function (req, context) {
    return {
      statusCode: 429,
      intOpCode: "ERR429",
      data: [{ message: "Too many requests" }]
    };
  }
});

const SECRET_KEY = "erp_secret_key_2026";

const routesConfig = {
  '/auth/login': { target: 'http://localhost:3001/auth/login', auth: false },
  '/auth/register': { target: 'http://localhost:3001/auth/register', auth: false },
  '/api/users': { target: 'http://localhost:3001/api/users', auth: true, perm: 'users:manage' }
};

fastify.addHook('preHandler', async (request, reply) => {
  if (request.method === 'OPTIONS') return;
  
  const url = request.url.split('?')[0];
  const routeInfo = Object.entries(routesConfig).find(([key]) => url.startsWith(key));

  if (routeInfo && routeInfo[1].auth) {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) throw new Error();
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, SECRET_KEY);
      request.user = decoded;

      if (routeInfo[1].perm && !decoded.permisos.includes(routeInfo[1].perm)) {
        reply.code(403).send({
          statusCode: 403,
          intOpCode: "ERR403",
          data: [{ message: "Forbidden" }]
        });
        return reply;
      }
    } catch (err) {
      reply.code(401).send({
        statusCode: 401,
        intOpCode: "ERR401",
        data: [{ message: "Unauthorized" }]
      });
      return reply;
    }
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
      const response = await axios({
        method: request.method,
        url: `${routeInfo[1].target}`,
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