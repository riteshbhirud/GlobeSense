/*const express = require('express');
const router = express.Router();

const User = require('../models/User'); 

router.post('/endRound', async (req, res) => {
  console.log("INSIDE END ROUND!")
  const { score } = req.body;

  req.session.gameData.totalScore += score;
  req.session.gameData.currentRound += 1;

  if (req.session.gameData.currentRound % req.session.gameData.maxRoundsBeforeSave === 0) {
    try {
      await User.findOneAndUpdate(
        { username: req.user.username },
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
*/

