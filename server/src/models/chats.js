//Model User Mongoose   

const mongoose = require('mongoose');

const { Schema } = mongoose;

const ChatSchema = new Schema({
  username: { type: String },
  idUser: { type: String},
  idRoom: { type: String },
  mensaje: { type: String},
  created: { type: Date,default: new Date() },
});

// Compile model from schema
const Room = mongoose.model('Chat', ChatSchema);
module.exports = Room;