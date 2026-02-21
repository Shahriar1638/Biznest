const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const router = express.Router();

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Unauthorized request' })
  }
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized request' })
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

      const Joi = require('joi');
      const signupSchema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        photoURL: Joi.string().uri().allow('', null),
        role: Joi.object({
          type: Joi.string().valid('customer', 'seller', 'admin').required(),
          details: Joi.object().unknown(true)
        }).required()
      }).unknown(true);

      const { error } = signupSchema.validate(userinfo);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      // console.log(userinfo);
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

      //generate id for user
      const userType = userinfo.role.type;
      let generatedID = '';

      if (userType === 'customer') {
        // Get the count of existing customers and generate next customerID
        const customerCount = await userCollection.countDocuments({ "role.type": "customer" });
        const nextCustomerNumber = customerCount + 1;
        generatedID = `CUS${nextCustomerNumber.toString().padStart(3, '0')}`;
        userinfo.role.details.customerID = generatedID;

        // Set default values if not provided
        if (!userinfo.role.details.points) userinfo.role.details.points = 0;
        if (!userinfo.role.details.wishlist) userinfo.role.details.wishlist = [];

      } else if (userType === 'seller') {
        // Get the count of existing sellers and generate next sellerID
        const sellerCount = await userCollection.countDocuments({ "role.type": "seller" });
        const nextSellerNumber = sellerCount + 1;
        generatedID = `SEL${nextSellerNumber.toString().padStart(3, '0')}`;
        userinfo.role.details.sellerID = generatedID;

        // Set default values if not provided
        if (!userinfo.role.details.revenue) userinfo.role.details.revenue = 0;
        if (!userinfo.role.details.numOfApproved) userinfo.role.details.numOfApproved = 0;
        if (!userinfo.role.details.numOfReject) userinfo.role.details.numOfReject = 0;

      } else if (userType === 'admin') {
        // Get the count of existing admins and generate next adminID
        const adminCount = await userCollection.countDocuments({ "role.type": "admin" });
        const nextAdminNumber = adminCount + 1;
        generatedID = `ADM${nextAdminNumber.toString().padStart(3, '0')}`;
        userinfo.role.details.adminID = generatedID;

        // Set default values if not provided
        if (!userinfo.role.details.salary) userinfo.role.details.salary = 0;
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

      const Joi = require('joi');
      const loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
      });

      const { error } = loginSchema.validate(authinfo);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      // console.log(authinfo);
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

  // ----------------------------------------------> Admin Registration Endpoint <------------------------------
  router.post('/adminregister', async (req, res) => {
    try {
      const userinfo = req.body;
      console.log('Admin registration data received:', userinfo);
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

      // Generate admin ID
      const adminCount = await userCollection.countDocuments({ "role.type": "admin" });
      const nextAdminNumber = adminCount + 1;
      const generatedID = `ADM${nextAdminNumber.toString().padStart(3, '0')}`;
      userinfo.role.details.adminID = generatedID;

      // Set default values if not provided
      if (!userinfo.role.details.salary) userinfo.role.details.salary = 0;

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user object
      const newAdmin = userinfo;
      newAdmin.password = hashedPassword;

      // Insert admin into database
      const result = await userCollection.insertOne(newAdmin);

      // Return success response (excluding password)
      const { password: _, ...adminResponse } = newAdmin;
      res.status(201).json({
        success: true,
        message: 'Admin registered successfully',
        admin: adminResponse,
        result
      });

    } catch (error) {
      console.error('Admin registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // ----------------------------------------------> Verify Token Endpoint <------------------------------
  router.get('/verify-token', verifyToken, async (req, res) => {
    try {
      // If we reach here, token is valid (verifyToken middleware passed)
      const userId = req.decoded._id;
      // console.log('Decoded user ID from token:', userId);
      // Optionally, get fresh user data from database
      const user = await userCollection.findOne({ _id: new ObjectId(userId) });
      // console.log(user);
      if (!user) {
        return res.status(404).json({
          valid: false,
          message: 'User not found'
        });
      }

      // Return success with user data
      res.status(200).json({
        valid: true,
        message: 'Token is valid',
        user
      });

    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({
        valid: false,
        message: 'Internal server error'
      });
    }
  });

  // Export the verifyToken middleware along with the router
  router.verifyToken = verifyToken;

  return router;
};