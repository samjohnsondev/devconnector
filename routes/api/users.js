const express = require("express");
const router = express.Router();
const gravatar = require("node-gravatar");
const bcrypt = require("npm");
const jwt = require(" jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

//Load the validaion
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//Load in the users model
const User = require("../../models/User");

/*
*   @route  GET api/users/test
*   @desc   Tests the users route  
*   @access Public
*/
router.get("/test", (req, res) => res.json({ msg: "Users is ok" }));

/*
*   @route  POST api/users/register
*   @desc   Register the user 
*   @access Public
*/

router.post("/register", (req, res) => {
  //Validate for errors

  const { errors, isValid } = validateRegisterInput(req.body);
  console.log(errors);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    //Check if a user with this email already exists
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      const avatar = gravatar.get(req.body.email, {
        s: "200",
        r: "pg",
        m: "mm"
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });
      //Encypt the password

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

/*
*   @route  POST api/users/login
*   @desc   returning the token
*   @access Public
*/
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    console.log(errors);
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    //Check if there is a user

    if (!user) {
      return res.status(404).json({ email: "User email not found" });
    }
    // Check password
    bcrypt.compare(password, user.password).then(result => {
      if (result) {
        //user matched
        const payload = {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        };

        jwt.sign(
          payload,
          keys.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            if (err) {
              res.status(404).json({ success: false, error: "token mismatch" });
            }
            res.json({ success: true, token: "Bearer " + token });
          }
        );
      } else {
        return res.status(400).json({ password: "Password not correct" });
      }
    });
  });
});

/*
*   @route  GET api/users/current
*   @desc   returning the current user
*   @access Private
*/

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const currentUser = {
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    };

    res.json(currentUser);
  }
);

module.exports = router;
