const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 *  Create the user schema, The user schema is an object that includes all the fields in the
 * database. for example each obkect is like a database column. followin
 */

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = User = mongoose.model("users", UserSchema);
