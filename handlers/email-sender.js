const { emailSenderModule } = require('../modules/email-sender.module');

const emailSenderhandler = async (request, reply) => {
  try {
    const resp = await emailSenderModule(request.body);
    reply.status(200).send(resp);
  } catch (err) {
    reply.code(200).send(err);
  }
};

module.exports = {
  emailSenderhandler
};
