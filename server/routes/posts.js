const express = require("express");

const Post = require("./../models/post");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const post = await new Post({
      title: req.body.title,
      content: req.body.content
    }).save({ new: true });

    res.status(201).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.send(post);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      res.send(post);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    res.send(post);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});

module.exports = router;
