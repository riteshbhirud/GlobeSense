const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user'); 
const {generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken} = require('../authentication.js')
//const cookieParser = require('cookie-parser');
//const app = express();
//app.use(cookieParser());

mongoose.connect(process.env.MONGODB_URI);

router.post('/register', async (req, res) => {
    console.log(User)
    console.log("Form submitted");
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
      let usernameExists = await User.findOne({ username });
      if (user || usernameExists) {
        return res.status(400).json({ msg: 'User already exists' });
      }
  
      // Hash password
      console.log("reached")
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("reached")
  
      // Create new user
      user = new User({
        username,
        email,
        password: hashedPassword,
        points: 0
      });
      console.log("reached line 35")
  
      // Save user
      
      await user.save();
      res.status(201).json({ msg: 'User registered successfully' });
      console.log(res.json())
      console.log("reached line 40")
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
  const {username, password} = req.body;
  try {
    let user = await User.findOne({ username })
    if (!user) {
      res.status(401).json({ msg: 'Username does not exist.' });
    }
    else if (await bcrypt.compare(req.body.password, user.password)){
      //login logic
      const token = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Set the token as an HTTP-only cookie
      res.cookie("jwt", token, {
        httpOnly: true, // Prevents JavaScript access to cookies
        secure: true,   // Use secure cookies (only HTTPS) in production
        sameSite: "strict", // Helps prevent CSRF attacks
        maxAge: 20000    // Cookie expiration set to 20 seconds
      });

      // Ideally the refresh token should be stored in long-term storage such as a database
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,  // Prevents JavaScript access to cookies
        secure: false,   // Use secure cookies (only HTTPS) in production
        sameSite: "lax", // Helps prevent CSRF attacks
        maxAge: 60000    // Cookie expiration set to 1 min
      });
      

    
 
      res.status(201).json({ msg: 'User signed in successfully.' });

      // If they came from another page, probably need to redirect them to that page again.
      // Otherwise, redirect them to the home page by default.

    }
    else {
        res.status(401).json({ msg: 'Incorrect Password.' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
})

/*router.post('/token/refresh', (req, res) => {
  console.log('Origin:', req.headers.origin);  // Logs client origin (protocol, host, port)
  console.log('Host:', req.headers.host);      // Logs full server host (host and port)
  console.log('Referer:', req.headers.referer); // Logs referer (protocol, host, and port of the referring page)
  //console.log("Request Headers:", req.headers.cookie);
  //console.log("REQ",req)
  console.log("INSIDE POST ROUTE")
  console.log("COOKIES INSIDE POST ROUTE:", req.cookies);
    //const refreshToken = req.cookies.hasOwnProperty("refreshToken") ? req.cookies.refreshToken : null;
  const refreshToken = ("refreshToken" in req.cookies) ? req.cookies.refreshToken : null;
  console.log("REFRESH TOKEN INSIDE POST ROUTE:", refreshToken);



  if (!refreshToken) {
    console.log("REFRESH TOKEN IS NULL")
    return res.sendStatus(401);
  }

  const result = verifyRefreshToken(refreshToken);
  console.log

  if (!result.success) {
    return res.status(403).json({ error: result.error });
  }

  const user = result.data;
  const newAccessToken = generateAccessToken(user);
  res.cookie("jwt", newAccessToken, {
    //httpOnly: true, // Prevents JavaScript access to cookies
    secure: false,   // Use secure cookies (only HTTPS) in production
    sameSite: "lax", // Helps prevent CSRF attacks
    maxAge: 20000    // Cookie expiration set to 2 mins
  });
  res.status(201).json({ msg: 'Access token successfully refreshed.' });
});*/


module.exports = router;