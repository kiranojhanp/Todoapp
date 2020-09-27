const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerInput } = require("../middlewares/validation");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post("/register", (req, res, next) => {
  const { errors, isValid } = registerInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  let { username, email, password, firstName, lastName, role } = req.body;

  User.find({ username })
    .then((user) => {
      if (!user) {
        let err = new Error("User already exists!");
        err.status = 400;
        return next(err);
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return next(err);

        User.create({
          username,
          email,
          password: hash,
          firstName,
          lastName,
          role,
        })
          .then((user) => {
            res.json({ status: "Registration success" });
          })
          .catch(next);
      });
    })
    .catch(next);
});

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  User.findOne({ username }).then((user) => {
    if (!user) {
      let err = new Error("User does not exist!");
      err.status = 400;
      return next(err);
    }

    bcrypt
      .compare(password, user.password)
      .then((isMatched) => {
        if (!isMatched) {
          let err = new Error("Wrong Username or Password Combination");
          err.status = 400;
          return next(err);
        }

        const payload = {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        };

        jwt.sign(
          payload,
          process.env.SECRET,
          { expiresIn: "4hr" },
          (err, token) => {
            if (err) return next(err);
            res.json({ message: "Login Successful", token });
          }
        );
      })
      .catch(next);
  });
});

module.exports = router;
