const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const app = express();

//Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//DB Connection
const db = require("./config/keys").mongoURL;

//Connect through MongoDB
mongoose
  .connect(db)
  .then(() => console.log("Connected"))
  .catch(err => console.log(err));

app.use(passport.initialize());

require("./config/passport")(passport);

//Use the routes
app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/profile", profile);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Listening on ${port}`));
