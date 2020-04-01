const express = require("express");
const multer = require("multer");

const Post = require("./../models/post");

const router = express.Router();

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif"
};

const getImagePath = req => {
  const url = `${req.protocol}://${req.get("host")}`;
  return `${url}/images/${req.file.filename}`;
};

// Store images in the server folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid MIME type");

    // Null if MIME not in array
    if (isValid) {
      error = null;
    }

    cb(error, "server/images");
  },
  filename: (req, file, cb) => {
    // Normalize whitespace and file extensions
    const name = file.originalname
      .toLowerCase()
      .split(" ")
      .join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];

    // Save as name-timestamp.ext
    cb(null, `${name}-${Date.now()}.${ext}`);
  }
});

router.post(
  "/",
  multer({ storage: storage }).single("image"),
  async (req, res, next) => {
    try {
      const post = await new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: getImagePath(req)
      }).save({ new: true });

      res.status(201).json(post);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
);

router.put(
  "/:id",
  multer({ storage: storage }).single("image"),
  async (req, res) => {
    try {
      const newPost = req.body;

      // A new file has been uploaded
      if (req.file) {
        newPost.imagePath = getImagePath(req);
      }

      const post = await Post.findByIdAndUpdate(req.params.id, newPost, {
        new: true
      });
      res.send(post);
    } catch (error) {
      console.log(error);
      res.status(500).send();
    }
  }
);

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
