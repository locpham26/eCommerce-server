const express = require("express");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const router = express.Router();
const { User, validateUser } = require("../models/user");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", [auth, admin], async (req, res) => {
  const users = await User.find();
  res.send(users);
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-header", token)
    .send(_.pick(user, ["id", "name", "email"]));
});

router.patch("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.score += req.body.score;
    if (800 > user.score >= 300) {
      user.rank = "golden";
    }
    if (1600 > user.score >= 800) {
      user.rank = "platinum";
    }
    if (user.score >= 1600) {
      user.rank = "diamond";
    }
  }
  await user.save();
});

module.exports = router;
