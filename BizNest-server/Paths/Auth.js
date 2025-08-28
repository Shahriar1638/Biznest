const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({message:'Unauthorized request'})
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({message:'Unauthorized request'})
    }
    req.decoded = decoded;
    next();
  });
};

module.exports = (userCollection) => {

// ----------------------------------------------> Signup start point <------------------------------
  router.post('/signup', async (req, res) => {
    try {
      const userinfo = req.body;
      console.log(userinfo);
      const email = userinfo.email;
      const password = userinfo.password;
      
      // Check if user already exists
      const existingUser = await userCollection.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: 'User already exists with this email' 
        });
      }
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create user object
      const newUser = userinfo;
      newUser.password = hashedPassword;
      
      // Insert user into database
      const result = await userCollection.insertOne(newUser);
      
      // Return success response (excluding password)
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        result
      });
      
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
// ----------------------------------------------> Login start point <------------------------------
  router.post('/login', async (req, res) => {
    try {
      const authinfo = req.body;
      console.log(authinfo);
      const { email, password } = authinfo;
      
      // Find user by email
      const user = await userCollection.findOne({ email });
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        user, 
        process.env.JWT_SECRET_TOKEN, 
        { expiresIn: '24h' }
      );
      
      
      // Return success response with entire user object
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user
      });
      
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });
  
  // Export the verifyToken middleware along with the router
  router.verifyToken = verifyToken;
  
  return router;
};