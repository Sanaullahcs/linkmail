const axios = require('axios');
const route = require('express').Router();
// Endpoint to search for emails and profile details
route.post('/fetch-posts', async (req, res) => {
   
    const {username} = req.body;
    const options = {
      method: `${process.env.POST_API_METHOD}`,
      url: `${process.env.POST_API_URL}`,
      params: {
        username: `${username}`
      },
      headers: {
        'x-rapidapi-key': `${process.env.POST_API_KEY}`,
        'x-rapidapi-host': `${process.env.POST_API_HOST}`
      }
    };
    
    try {
        const response = await axios.request(options);
        console.log(response.data);
    } catch (error) {
        console.error(error);
    }
})

module.exports = route;