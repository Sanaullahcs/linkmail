const route = require('express').Router();
const Email = require('../models/Email');

// Endpoint to fetch email history
route.get('/emailHistory', async (req, res) => {
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