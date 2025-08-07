const nodemailer = require('nodemailer');
require('dotenv').config();
const config = require('config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.get('sender_email'),
    pass: config.get('sender_app_password')
  }
});

module.exports = transporter;
