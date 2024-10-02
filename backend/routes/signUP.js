const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const route = express.Router();
const User = require('../models/Signup');

const JWT_SECRET = process.env.JWT_SECRET;


// Middleware to Check JWT Token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied. No Token Provided.' });

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

// Sign Up Route
route.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        // Generate JWT Token
        const token = jwt.sign({ email: newUser.email, id: newUser._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// **Sign In Route**
route.post('/signin', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Compare the provided password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      // Generate JWT Token
      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: '1h',
      });
  
      // Send the token and user details as the response
      res.status(200).json({ message: 'Sign in successful', token });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
// Protected Route Example (Replace `/protected` with your routes)
route.get('/protected', authenticateToken, (req, res) => {
    res.send('This is a protected route!');
});

module.exports = route;
