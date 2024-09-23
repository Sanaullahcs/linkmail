// emailTransporter.js
const nodemailer = require('nodemailer');

// Setup transporter with nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // you can use any email service (e.g., Yahoo, Outlook)
  auth: {
    user: process.env.USER,
    pass: process.env.APP_PASSWORD
  },
});

// Verify transporter connection
transporter.verify(function (error, success) {
    if (error) {
      console.log('Email service not available:', error);
    } else {
      console.log('Email service is ready to send emails');
    }
  });
  
// Middleware to send email
const sendEmail = async ({ subject, body, recipients }) => {
  const mailOptions = {
    from: process.env.PERSONAL_EMAIL, // replace with your email
    to: recipients.join(','), // join all recipients as a comma-separated string
    subject: subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Emails sent successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error sending emails:', error);
    return { success: false, error };
  }
};

module.exports = sendEmail;
