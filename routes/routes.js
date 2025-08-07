const { emailSenderhandler } = require('../handlers/email-sender');

async function routes(fastify) {
  fastify.post('/api/send-emails', emailSenderhandler);
}
module.exports = routes;
