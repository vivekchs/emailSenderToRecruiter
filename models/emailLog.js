const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  jobId: String,
  sentAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailLog', emailLogSchema);
