const express = require("express");
const multer = require("multer");

const Post = require("./../models/post");
const checkAuth = require("./../middleware/check-auth");

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
  checkAuth,
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
      console.error(error);
      res.status(500).json();
    }
  }
);

router.put(
  "/:id",
  checkAuth,
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
      res.json(post);
    } catch (error) {
      console.error(error);
      res.status(500).json();
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const pageSize = +req.query.pageSize;
    const page = +req.query.page;
    const postQuery = Post.find();

    // Modify the query of pagination options are defined
    if (pageSize && page) {
      postQuery.skip(pageSize * (page - 1)).limit(pageSize);
    }

    const [posts, count] = await Promise.all([
      postQuery.exec(),
      Post.countDocuments().exec()
    ]);

    res.json({ posts, count });
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      res.json(post);
    } else {
      res.status(404).json();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
});

router.delete("/:id", checkAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
});

module.exports = router;
