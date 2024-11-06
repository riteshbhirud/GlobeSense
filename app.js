
const express = require('express');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const mongoose = require("mongoose");
const {generateAccessToken, verifyAccessToken} = require('./authentication.js')
const cookieParser = require('cookie-parser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const app = express();
app.use(express.json())
app.use(cookieParser());
const userRoutes = require('./routes/user'); 

app.use('/api/users', require('./routes/user'));
//Cookie setup

const cors = require('cors');
app.use(cors({
    origin: "http://localhost:5550", // Update with your client’s URL
    credentials: true // Allows cookies to be included
}));

app.use(express.urlencoded({ extended: true }));
const port = 5550;
const uri = process.env.MONGODB_URI;


app.use((req, res, next) => {
  console.log("Global Middleware - Headers:", req.headers.cookie); // Logs raw cookie header
  console.log("Global Middleware - Cookies:", req.cookies);       // Logs parsed cookies
  next();
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/config', (req, res) =>{
  res.json({
    OPENCAGE_API_KEY: process.env.OPENCAGE_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    JAMENDO_CLIENT_ID: process.env.JAMENDO_CLIENT_ID,
    MONGODB_URI: process.env.MONGODB_URI

  });

});


app.set('view engine', 'ejs');
app.use(express.static('public'));

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
  console.log(req.cookies)
  console.log("Request Headers IN APP.JS:", req.headers.cookie);

  token = req.cookies.hasOwnProperty("jwt") ? req.cookies.jwt : null;
  console.log("TOKEN",token)

  if (!token || token === "") {
    console.log("REACHEDIF!!")
    refreshToken = req.cookies.hasOwnProperty("refreshToken") ? req.cookies.refreshToken : null;
    if (!refreshToken) {
      res.sendStatus(401);
      alert('youre fired - trump')
    }

    try {
      token_response = await fetch("http://localhost:5550/api/users/token/refresh", {
        method: "POST",
        headers:{
           "Content-Type": "application/json"
        },
        credentials: "include"
      });
      if(!token_response.ok){
       throw new Error(`Failed to refresh token: ${token_response.statusText}`)
      }

      
      tokenData = await token_response.json()
      

      console.log("TOKEN RESPONSE:", tokenData)
      console.log("UPDATED COOKIES:", req.cookies)
      if (req.cookies.hasOwnProperty("jwt")) {
        next() 
      }
    }
    catch (error) {
      console.log("CATCH403!")
      return res.status(403).json({ error: error });
    }
  }

  const result = verifyAccessToken(token);

  if (!result.success) {
    return res.status(403).json({ error: result.error });
  }

  req.user = result.data;
  next();
  
}

run().catch(console.dir);

