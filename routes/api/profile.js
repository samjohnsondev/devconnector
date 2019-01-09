const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//validation

const validateEducationInput = require("../../validation/education");
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
//Load the profile
const Profile = require("../../models/Profile");
const User = require("../../models/User");
/*
*   @route  GET api/profile/test
*   @desc   Tests the profile route  
*   @access Public
*/
router.get("/test", (req, res) => res.json({ msg: "Profile is ok" }));

/*
*   @route  GET api/profile/:user_id
*   @desc   GET the current users profile
*   @access Public 
*/

router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        console.log("in here");

        errors.noprofile = "No profile found";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json({ error: "No Profile found" }));
});

/*
*   @route  GET api/profile/
*   @desc   GET the current users profile
*   @access Private 
*/
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "No profile found";
          res.status(404).json(errors);
        } else {
          res.json(profile);
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

/*
*   @route  GET api/profile/all
*   @desc   GET All the profiles
*   @access public
*/

router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofiles = "No Profiles have been found";
        res.status(404).json(errors);
      } else {
        res.json(profiles);
      }
    })
    .catch(err => res.status(404).json({ profile: "No profiles" }));
});

/*
*   @route  GET api/profile/handle/:handle
*   @desc   GET Profile by handle
*   @access public
*/

router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.profile = "No Profile found";

        res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err => res.status(404).json(err));
});

/*
*   @route  POST api/profile/
*   @desc   POST create a profile
*   @access private 
*/

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      res.status(400).json(errors);
    }

    //Get Fields
    const profileFields = {};

    profileFields.user = req.user.id;

    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;

    //Skills split into an array
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          //This is an update
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          ).then(profile => res.json(profile));
        } else {
          //Create
          //Check id handle exists
          Profile.findOne({ handle: profileFields.handle }).then(profile => {
            if (profile) {
              errors.handle = "That handle exists";
              res.status(404).json(errors);
            }

            //Save the profile
            new Profile(profileFields)
              .save()
              .then(profile => res.json(profile));
          });
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

/*
*   @route  POST api/profile/education
*   @desc   POST add education to the profile
*   @access private 
*/

router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) {
      res.status(404).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };
      profile.education.unshift(newEdu);

      profile.save().then(profile => res.json(profile));
    });
  }
);

/*
*   @route  POST api/profile/experience
*   @desc   POST add experience to the profile
*   @access private 
*/

router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) {
      res.status(404).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      profile.experience.unshift(newExp);

      profile.save().then(profile => res.json(profile));
    });
  }
);

/*
*   @route  DELETE api/profile/experience/:exp_id
*   @desc   DELETE Delete experience from profile
*   @access private 
*/

router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        //SPlice the array
        profile.experience.splice(removeIndex, 1);

        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

/*
*   @route  DELETE api/profile/education/:edu_id
*   @desc   DELETE Delete educaation from profile
*   @access private 
*/

router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get the remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

module.exports = router;
