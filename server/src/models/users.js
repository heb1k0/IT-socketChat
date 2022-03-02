//Model User Mongoose   

const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, unique: true  },
  email: { type: String, unique: true },
  password: { type: String},
  token: { type: String}
});

// Compile model from schema
const User = mongoose.model('User', UserSchema);
module.exports = User;