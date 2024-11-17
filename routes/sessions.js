const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Session = require("../models/Session");
const cookieParser = require('cookie-parser');
const {generateAccessToken, verifyAccessToken, verifyRefreshToken} = require('../authentication.js')


mongoose.connect(process.env.MONGODB_URI);

// Post routes go here


// Generate a random 6-character invite code
const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Create a new session

router.post("/create", async (req, res) => {

  // First check if the user is authenticated by accessing JWT cookies
  if (!req.cookies || Object.keys(req.cookies).length === 0) {
    res.status(403).json({success: false, message: "Not allowed to create game session"})
    return res.redirect('/login')
  }
  let token = req.cookies.hasOwnProperty("jwt") ? req.cookies.jwt : null;
  if (!token || token === "") {
    res.status(403).json({success: false, message: "Not allowed to create game session"})
    return res.redirect('/login')
  }
  const verifyTokenResult = verifyAccessToken(token);

  if (!verifyTokenResult.success) {
    res.status(403).json({ success: false, message: verifyTokenResult.error });
    return res.redirect("/login")
    //return res.status(403).json({ error: verifyTokenResult.error });
  }

  // Append decoded user data to response header (to use in the future for profile page for example)
  req.user = verifyTokenResult.data;


  try {
    const gameId = generateInviteCode();
    const session = new Session({ inviteCode: gameId, host: req.user.username });
    await session.save();
    console.log("Successfully saved session");
    res.status(201).json({ success: true, inviteCode: gameId, host: req.user.username });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create session", error });
  }
});

module.exports = router;
