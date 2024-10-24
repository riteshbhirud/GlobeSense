const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user'); 

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


module.exports = router;