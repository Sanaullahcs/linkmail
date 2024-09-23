const sendEmail = require('../middleware/emailTransporter'); 
const route = require('express').Router();
const Email = require('../models/Email');

// Endpoint to send emails
route.post('/sendEmail', async (req, res) => {
    const { subject, body, emailAddresses } = req.body;
    // Call the sendEmail function from emailTransporter.js
    const result = await sendEmail({ subject, body, recipients: emailAddresses });
    // Save the email to the database with sender's info
    const emailRecord = new Email({
        senderEmail: process.env.USER,         
        subject,
        body,
        recipients: emailAddresses,
    });
    await emailRecord.save();
    if (result.success) {
      res.status(200).json({ message: 'Emails sent successfully!' });
    } else {
      res.status(500).json({ message: 'Failed to send emails.', error: result.error });
    }
  });

  module.exports = route;