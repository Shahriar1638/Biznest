const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// Security Middleware
const helmet = require('helmet');
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later.'
});

// Apply the rate limiting middleware to all requests or specific routes
app.use(limiter);

const uri = `${process.env.DB_URI}`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db("BiznestDB").collection("userinfos");
    const productCollection = client.db("BiznestDB").collection("products_collection");
    const cartCollection = client.db("BiznestDB").collection("cart_collection");
    const paymentCollection = client.db("BiznestDB").collection("payments_details");
    const contactCollection = client.db("BiznestDB").collection("contact_messages");

    const Authentications = require('./Paths/Auth')(userCollection);
    const productAPI = require('./Paths/Products')(productCollection);
    const userAPI = require('./Paths/user')(cartCollection, paymentCollection, productCollection, userCollection);
    const sellerAPI = require('./Paths/seller')(productCollection, userCollection);
    const publicAPI = require('./Paths/public')(contactCollection);
    const adminAPI = require('./Paths/admin')(productCollection, userCollection, contactCollection);

    app.use('/products', productAPI);
    app.use('/auth', Authentications);
    app.use('/user', userAPI);
    app.use('/seller', sellerAPI);
    app.use('/public', publicAPI);
    app.use('/admin', adminAPI);

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`Current active port: ${port}`);
})
