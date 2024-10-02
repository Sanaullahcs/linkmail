require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./db');
const https = require('https');
const { Server } = require('http');
const fs = require('fs');
const path = require('path');

const app = express();

// Database connection
connection();

// Use CORS middleware
app.use(cors());
app.use(bodyParser.json());

let server;
if (process.env.BUILD_TYPE === 'production') {
  const options = {
    key: fs.readFileSync(path.join(__dirname, 'certificates/backend.emailscraper.key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certificates/backend.emailscraper.pem'))
  };

  server = https.createServer(options, app);
} else {
  server = new Server(app);
}

// User Sign Up Route
const signUpRoute = require('./routes/signUP');
app.use('/', signUpRoute);
// Search Email Route
const searchEmailRoute = require('./routes/searchEmail');
app.use('/', searchEmailRoute);

// Send Emails Route
const sendEmailRoute = require('./routes/sendEmail');
app.use('/', sendEmailRoute);

// Fetch Emails History Route
const getEmailHistoryRoute = require('./routes/getEmailHistory');
app.use('/', getEmailHistoryRoute);

// Fetch states route
const getStatesRoute = require('./routes/fetchStates');
app.use('/', getStatesRoute);

// Fetch the Linkedin User Posts
const getPostsRoute = require('./routes/fetchPosts');
app.use('/', getPostsRoute);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on https://linkedmailbackend.tabsgi.com`);
});
