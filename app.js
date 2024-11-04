
//npm install --save-dev @types/express
import dotenv from 'dotenv';
dotenv.config();
//const jwt = require('jsonwebtoken');
import jwt from 'jsonwebtoken';
//const express = require('express');
import express from 'express'
// const { MongoClient, ServerApiVersion } = require('mongodb');
import { MongoClient, ServerApiVersion } from 'mongodb';
// const path = require('path');
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const mongoose = require("mongoose");
import mongoose from "mongoose";



const app = express();
app.use(express.json())
//const userRoutes = require('./routes/user');
import userRoutes from './routes/user.js'; 

app.use('/api/users', userRoutes);
//Cookie setup



const port = process.env.PORT;
const uri = process.env.MONGODB_URI;
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

app.get

('/', (req, res) => {
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
    //let databasesList;
    let databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    // Send a ping to confirm a successful connection
    await client.db("Users").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const testUser = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      points: 0
    };

    const collection = client.db("Users").collection("Users");
    //console.log(collection)
    //const insertResult = await collection.insertOne(testUser);
    //console.log("Inserted user:", insertResult.insertedId);
    
  } catch (err) {
    console.error('Error during insert:', err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

