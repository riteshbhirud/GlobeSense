const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  inviteCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // 1 hour expiry
  players: {type: Map, of: Number, default:()=> new Map()}, // Array of player usernames
  active: {type: Boolean,default:false},
  host: {type:String, required: true}
});

module.exports = mongoose.model("Session", sessionSchema);