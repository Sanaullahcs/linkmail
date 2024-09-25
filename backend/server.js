
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./db');

const app = express();

// Database connection
connection();

app.use(cors());
app.use(bodyParser.json());

// Search Email Route
const searchEmailRoute = require('./routes/searchEmail');
app.use('/', searchEmailRoute);

// Send Emails Route
const sendEmailRoute = require('./routes/sendEmail');
app.use('/', sendEmailRoute);

// Fetch Emails  History Route
const getEmailHistoryRoute = require('./routes/getEmailHistory');
app.use('/', getEmailHistoryRoute);

// Fetch states route
const getStatesRoute = require('./routes/fetchStates');
app.use('/', getStatesRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
