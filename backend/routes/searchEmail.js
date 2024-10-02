const route = require('express').Router();
const axios = require('axios');
const cheerio = require('cheerio');

// Email extraction helper
function extractEmails(text) {
    const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}/g;
    const emails = text.match(emailRegex) || [];
    return emails.map(email => {
      const atComIndex = email.indexOf('.com') + 4;
      return email.slice(0, atComIndex);
    });
  }
  
  // Function to remove duplicates based on a key (in this case, the email address)
  function removeDuplicateProfiles(profiles) {
    const seenEmails = new Set();
    return profiles.filter(profile => {
      const isDuplicate = seenEmails.has(profile.email);
      seenEmails.add(profile.email);
      return !isDuplicate;
    });
  }
  
  // Sleep function to introduce delay
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Function to scrape a single page
  async function scrapePage(query, page, role, country, stateRegion) {
    const googleSearchUrl = `${process.env.SEARCH_URL}${encodeURIComponent(query)}${process.env.START_PAGE}${page * process.env.PAGE_NO}`;
    console.log(`Fetching URL: ${googleSearchUrl}`);
  
    try {
      const response = await axios.get(googleSearchUrl, {
        headers: {
         'User-Agent': `${process.env.USER_AGENT}`
        }
      });
  
      const $ = cheerio.load(response.data);
      let profiles = [];
  
      // Scraping additional information like email, role, and location from the main div
      $(`${process.env.MAIN_DIV}`).each((index, element) => {
        const text = $(element).text();
        const emails = extractEmails(text);
        const roleMatch = text.match(new RegExp(role, 'i'));
        const countryMatch = text.match(new RegExp(country, 'i'));
        const stateMatch = text.match(new RegExp(stateRegion, 'i'));

        
        if (emails.length > 0) {
          const profileRole = roleMatch ? roleMatch[0] : role;
          const profileLocation = countryMatch ? countryMatch[0] : country;
          const profileState = stateMatch ? stateMatch[0] : stateRegion;
          
          // Now look for the corresponding second div for the name and profile link
          const anchor = $(element).closest('div').find(`${process.env.SECOND_DIV}`);
          const profileLink = anchor.attr('href');
          const name = anchor.text();
          const nameMatch = name.match(/([A-Za-z]+\s[A-Za-z]+)/);
  
          if (profileLink && name) {
            profiles.push({
              email: emails[0],
              name: nameMatch[0],
              profileLink: profileLink,
              role: profileRole.toUpperCase(),
              country: profileLocation.toUpperCase(),
              stateRegion: profileState.toUpperCase()
            });
          } else {
            console.log('Profile not added: Missing name or profile link');
          }
        } else {
          console.log('Profile not added: Missing email');
        }
      });
  
      return profiles;
    } catch (error) {
      console.error('Error fetching Google search results:', error);
      return [];
    }
  }
  
  // Endpoint to search for emails and profile details
  route.post('/searchEmails', async (req, res) => {

    // res.header("Access-Control-Allow-Origin", "https://linkedmail.tabsgi.com");
    // res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    // res.header("Access-Control-Allow-Credentials", "true");
    
    const { role, country, stateRegion, emailExtension } = req.body;
  
    let query = `${process.env.SITE_URL} "${role}" "${country}" "${stateRegion}" email "${process.env.EMAIL_EXTENSION}"`;
    if (emailExtension) {
      query += ` "${emailExtension}"`;
    }
  
    let allProfiles = []; 
  
    let pages = process.env.Pages;
    for (let i = 0; i < pages; i++) {
      console.log(`Scraping page ${i + 1}...`);
  
      const profiles = await scrapePage(query, i, role, country, stateRegion);
      allProfiles = [...allProfiles, ...profiles];
  
      // Introduce a delay of 2 seconds before scraping the next page
      await sleep(3000);
    }
  
    // Remove duplicate profiles based on the email
    const uniqueProfiles = removeDuplicateProfiles(allProfiles);
  
    // Print all profiles to the console
    console.log('Collected Profiles:', uniqueProfiles);
  
    // Send the response to the frontend
    res.json({ profiles: uniqueProfiles });
  });
  

  module.exports = route;