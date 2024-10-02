const route = require('express').Router();
const { Country, State } = require('country-state-city'); // Import country-state-city


// API to get the states by country name
route.post('/getStates', (req, res) => {

  // res.header("Access-Control-Allow-Origin", "https://linkedmail.tabsgi.com");
  // res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  // res.header("Access-Control-Allow-Credentials", "true");
  
  const { country } = req.body;

  // Find country code by name
  const countryData = Country.getAllCountries().find(c => c.name.toLowerCase() === country.toLowerCase());

  if (!countryData) {
    return res.status(404).json({ message: 'Country not found' });
  }

  // Get states using the country code
  const states = State.getStatesOfCountry(countryData.isoCode);

  if (states.length === 0) {
    return res.status(404).json({ message: 'No states found for this country' });
  }

  res.json({ states });
});

module.exports = route;
