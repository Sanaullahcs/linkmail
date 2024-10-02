// emailTransporter.js
const nodemailer = require('nodemailer');

// Setup transporter with nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Use 'smtp.gmail.com' instead of IP
  port: 465, // Use 465 for SSL or 587 for TLS
  secure: true, // Set to true for SSL/TLS
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
