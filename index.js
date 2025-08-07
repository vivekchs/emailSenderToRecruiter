const multipart = require('@fastify/multipart');
const formbody = require('@fastify/formbody');
const dotenv = require('dotenv');
dotenv.config();

const fastify = require('fastify')({
  logger: true
});
const path = require('path');
const routesRegister = require('./routes/routes-register.json');
const { connectDB } = require('./connector/mongo.connector');

global.rootDir = __dirname;

// Register plugins
fastify.register(multipart);
fastify.register(formbody);

// Register routes dynamically
routesRegister.forEach(routePath => {
  fastify.register(require(path.resolve(__dirname, routePath)));
});

// Handle 403 fallback
fastify.setNotFoundHandler((req, res) => {
  res.code(403).type('application/json').send({
    statusCode: 403,
    status: 403,
    message: 'forbidden'
  });
});

// Start server
(async () => {
  try {
    await connectDB(); // DB before starting server
    await fastify.listen({ port: 3000 });
    fastify.log.info('🚀 Server listening on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
})();
