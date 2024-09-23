// models/Email.js
const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  
  senderEmail: {         
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  recipients: {
    type: [String],
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Email', EmailSchema);
