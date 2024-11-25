const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user'); 
const {generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken} = require('../authentication.js')
//const cookieParser = require('cookie-parser');
//const app = express();
//app.use(cookieParser());
//require('dotenv').config({path: "../.env"});
let userObj = null;
mongoose.connect(process.env.MONGODB_URI);

router.post('/register', async (req, res) => {
    console.log('CSRF token received from register post request:', req.body._csrf)
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
      
      // Log in user
      const token = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Set the token as an HTTP-only cookie
      res.cookie("jwt", token, {
        httpOnly: true, // Prevents JavaScript access to cookies
        //secure: false,   // Use secure cookies (only HTTPS) in production
        secure: true,
        sameSite: "strict", // Helps prevent CSRF attacks
        maxAge: 20000    // Cookie expiration set to 20 seconds
      });

      // Ideally the refresh token should be stored in long-term storage such as a database
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,  // Prevents JavaScript access to cookies
        //secure: false,   // Use secure cookies (only HTTPS) in production
        secure: true,
        sameSite: "strict", // Helps prevent CSRF attacks
        maxAge: 60000    // Cookie expiration set to 1 min
      });
      
      


      userObj = { username: user.username, email: user.email }

      res.redirect("/")
      //console.log(res.json())
      //console.log("reached line 40")
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
});

router.post('/login', async (req, res) => {
  console.log('CSRF token received from post request:', req.body._csrf)
  const {username, password} = req.body;
  try {
    let user = await User.findOne({ username })
    if (!user) {
      req.flash('error', 'Invalid username or password');
      //res.status(401).json({ msg: 'Username does not exist.' });
      return res.redirect("/login")
    }
    else if (await bcrypt.compare(req.body.password, user.password)){
      //login logic
      const token = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      console.log("tokens created through login:", token, refreshToken)
      req.session.user = { username: user.username, email: user.email };
      console.log(req.session)


      // Set the token as an HTTP-only cookie
      res.cookie("jwt", token, {
        httpOnly: true, // Prevents JavaScript access to cookies
        //secure: false,   // Use secure cookies (only HTTPS) in production
        secure: true,
        sameSite: "strict", // Helps prevent CSRF attacks
        maxAge: 600000    // Cookie expiration set to 10 mins
      });

      // Ideally the refresh token should be stored in long-term storage such as a database
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,  // Prevents JavaScript access to cookies
        //secure: false,   // Use secure cookies (only HTTPS) in production
        secure: true,
        sameSite: "strict", // Helps prevent CSRF attacks
        maxAge: 1200000    // Cookie expiration set to 20 min
      });
      
      


      userObj = { username: user.username, email: user.email }
      //res.status(201).json(userObj);
      return res.redirect("/")

      // If they came from another page, probably need to redirect them to that page again.
      // Otherwise, redirect them to the home page by default.

    }


    else {
        req.flash('error', 'Invalid username or password');
        //res.status(401).json({ msg: 'Incorrect Password.' });
        return res.redirect("/login")
    }
  } catch (err) {
    console.error(err.message);
    req.flash('error', 'Invalid username or password');
    //res.status(500).send('Server error');
    return res.redirect("/login")
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


/*router.post('/logout', async (req, res) => {
  console.log("CSRF Token received from logout post request:", req.body._csrf)
  try {
    res.clearCookie("jwt", {
      httpOnly: true, // Prevents JavaScript access to cookies
    
      sameSite: "strict", // Helps prevent CSRF attacks
        // Cookie expiration set to 20 seconds
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,  // Prevents JavaScript access to cookies
      sameSite: "strict", // Helps prevent CSRF attacks
    });
    req.session.destroy((err)=>{
      console.log("Error destryoing the session",err);
      return res.status(500).send("Logout Error")
    })
    userObj = null;
    res.redirect("/")
    
    console.log("logged out!")
  } catch (error) {
    res.status(500).send('Logout error', error);
    
  }
  




});*/
router.post('/logout', (req, res) => {
  console.log("CSRF Token received from logout post request:", req.body._csrf);

  // Clear cookies first
  res.clearCookie("jwt", {
    httpOnly: true, // Prevents JavaScript access to cookies
    sameSite: "strict", // Helps prevent CSRF attacks
  });
  res.clearCookie("refreshToken", {
    httpOnly: true, // Prevents JavaScript access to cookies
    sameSite: "strict", // Helps prevent CSRF attacks
  });

  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying the session:", err);
      return res.status(500).send("Logout Error"); // Send response only once
    }

    console.log("Session destroyed successfully");
    userObj = null; // Reset the global user object
    res.redirect("/"); // Redirect only after session is destroyed
  });
});

function getUser () {
  console.log("GETUSER:", userObj);
  return userObj;
}

function setUser(newUser) {
  userObj = newUser;
}

router.post('/endRound', async (req, res) => {
  
  
  const { score } = req.body;

  req.session.gameData.totalScore += score;
  req.session.gameData.currentRound += 1;
  console.log("Current Round",req.session.gameData.currentRound)

  if (req.session.gameData.currentRound % req.session.gameData.maxRoundsBeforeSave === 0) {
    try {
      await User.findOneAndUpdate(
        { username: getUser().username },
        { $inc: { points: req.session.gameData.totalScore } } 
      );


      // Reset session score after saving to database
      req.session.gameData.totalScore = 0;
      console.log("User points updated in MongoDB");

    } catch (error) {
      console.error("Error updating points in MongoDB:", error);
      return res.status(500).send("Failed to update points");
    }
  }

  res.send({ message: 'Round data saved to session.' });
});

module.exports = {
  getUser,
  setUser,
  router,
};




