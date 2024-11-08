
const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const mongoose = require("mongoose");
const {generateAccessToken, verifyAccessToken, verifyRefreshToken} = require('./authentication.js')
const cookieParser = require('cookie-parser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
//require("dotenv").config();


const app = express();
app.use(express.json())
app.use(cookieParser());
const userRoutes = require('./routes/user'); 

app.use('/api/users', require('./routes/user'));
//Cookie setup

/*const cors = require('cors');
app.use(cors({
    origin: "http://localhost:5550", // Update with your client’s URL
    credentials: true // Allows cookies to be included
}));

app.use(express.urlencoded({ extended: true }));*/
const port = process.env.PORT || 5550;
const uri = process.env.MONGODB_URI;


/*app.use((req, res, next) => {
  console.log("Global Middleware - Headers:", req.headers.cookie); // Logs raw cookie header
  console.log("Global Middleware - Cookies:", req.cookies);       // Logs parsed cookies
  next();
});*/

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/config', (req, res) =>{
  res.json({
    OPENCAGE_API_KEY: process.env.OPENCAGE_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    JAMENDO_CLIENT_ID: process.env.JAMENDO_CLIENT_ID,
    MONGODB_URI: process.env.MONGODB_URI

  });

});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/test', (req, res) => {
    res.send("Test message");
});

// Example route for another page
app.get('/game', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/airport', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'airportMode.html'));
});

app.get('/mall', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'malls.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signUp.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signIn.html'));
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);


});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

async function authenticateToken(req, res, next) {
  // First check if cookies even exist. Redrect to login page in this case (placeholder for now)
  if (!req.cookies || Object.keys(req.cookies).length === 0) {
    // TODO: Redirect to login page
    console.log("if statement reached")
    console.log('youre fired - trump')
    return res.sendStatus(401);
  }

  // Get the access token stored in cookie storage
  let token = req.cookies.hasOwnProperty("jwt") ? req.cookies.jwt : null;
  console.log("OLD TOKEN:", token)

  if (!token || token === "") {
    // LOGIC FOR MISSING ACCESS TOKEN
    console.log("reached")

    // Get the refresh token stored in cookie storage
    refreshToken = req.cookies.hasOwnProperty("refreshToken") ? req.cookies.refreshToken : null;

    // If refresh token is missing, sign the user out (have placeholder for now)
    // Next time when they log in, both the refresh token and the access token will be renewed.
    if (!refreshToken) {
      // TODO: redirect to login page
      res.sendStatus(401);
    }


    // At this point, there is a refresh token stored in cookie storage.
    // Implement logic to use the refresh token to generate a new access token.

    const refreshTokenResult = verifyRefreshToken(refreshToken) // First, verify the authenticity of the refresh token
    if (!refreshTokenResult.success) {
      console.log("THE REFRESH TOKEN IS INVALID")
      return res.status(403).json({ error: refreshTokenResult.error });
    }
    
    // Get the decoded user data from the valid refresh token and use it to generate a new access token, storing it in cookie storage.
    const user = refreshTokenResult.data;
    token = generateAccessToken(user);
    console.log("NEW TOKEN:", token)
    res.cookie("jwt", token, {
      httpOnly: true, // Prevents JavaScript access to cookies
      secure: true,   // Use secure cookies (only HTTPS) in production
      sameSite: "strict", // Helps prevent CSRF attacks
      maxAge: 20000    // Cookie expiration set to 20 seconds
    });
  }

  // Proceed with verifying authenticity of access token
  const verifyTokenResult = verifyAccessToken(token);

  if (!verifyTokenResult.success) {
    return res.status(403).json({ error: verifyTokenResult.error });
  }

  // Append decoded user data to response header (to use in the future for profile page for example)
  req.user = verifyTokenResult.data;
  // Proceed with route logic
  next();
  
}

run().catch(console.dir);

