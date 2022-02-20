//Model User Mongoose   

const mongoose = require('mongoose');

const { Schema } = mongoose;

const RoomSchema = new Schema({
  name: { type: String, unique: true },
  user: { type: Array },
  created: { type: Date,default: new Date() },
});

// Compile model from schema
const Room = mongoose.model('Room', RoomSchema);
module.exports = Room;