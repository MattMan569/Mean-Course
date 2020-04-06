const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("./../models/user");

exports.createUser = async (req, res) => {
  try {
    const password = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      email: req.body.email,
      password,
    });

    res.status(201).json(user);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json("That email is already in use");
    }

    console.error(error);
    res.status(500).json();
  }
};

exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return res.status(401).json("Invalid username and password combination");
    }

    const result = await bcrypt.compare(req.body.password, user.password);

    if (!result) {
      return res.status(401).json("Invalid username and password combination");
    }

    const token = jwt.sign({
      email: user.email,
      userId: user._id,
    }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      expiresIn: 3600000,
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};
