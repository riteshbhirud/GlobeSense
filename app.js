
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const mongoose = require("mongoose");

const app = express();
app.use(express.json())
const userRoutes = require('./routes/user'); 

app.use('/api/users', require('./routes/user'));
//Cookie setup



const port = 5550;
const uri = process.env.MONGODB_URI;
console.log("MOGODB URI: ", uri);
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
app.get('/game', (req, res) => {
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
run().catch(console.dir);

