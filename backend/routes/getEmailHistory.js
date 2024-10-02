const route = require('express').Router();
const Email = require('../models/Email');

// Endpoint to fetch email history
route.get('/emailHistory', async (req, res) => {

  // res.header("Access-Control-Allow-Origin", "https://linkedmail.tabsgi.com");
  // res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  // res.header("Access-Control-Allow-Credentials", "true");
  
    try {
      // Fetch all emails, sorted by sentAt descending
      const emails = await Email.find().sort({ sentAt: -1 });
      res.status(200).json({ emails });
    } catch (error) {
      console.error('Error fetching email history:', error);
      res.status(500).json({ message: 'Failed to fetch email history.', error });
    }
  });

  module.exports = route;