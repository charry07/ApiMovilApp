require('dotenv').config();
const Routes = require('./src/routes/routes');
const cors = require('@fastify/cors');
const AuthRoutes = require('./src/routes/auth.routes');

const fastify = require('fastify')({
  // logger: true,
});

// Enable CORS
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
});


// mapeo las rutas y despues con el fastify.route las lanzo
Routes.map((route: any) => {
  fastify.route(route);
});

AuthRoutes.map((route: any) => {
  fastify.route(route);
});

// Run the server!
const start = async () => {
  try {
    fastify.listen({ host: process.env.HOST || '0.0.0.0', port: process.env.PORT });
    console.log(` ------> Server listening on port => [${process.env.PORT}]`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
