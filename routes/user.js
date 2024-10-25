const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user'); 
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

mongoose.connect("mongodb+srv://globesense0:eLmy07cxM7kqH8Bp@cluster0.dvqwx.mongodb.net/Users?retryWrites=true&w=majority&appName=Cluster0");

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
      const sessionToken = `${username}2`
      res.cookie('session',sessionToken,{
        httpOnly: true,
        secure: true,
        maxAge: 7200000  //2hrs

      });

    

      res.status(201).json({ msg: 'User signed in successfully.' });
    }
    else {
        res.status(401).json({ msg: 'Incorrect Password.' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
})


module.exports = router;