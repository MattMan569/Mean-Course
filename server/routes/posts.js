const express = require("express");

const checkAuth = require("./../middleware/check-auth");
const imageUpload = require("./../middleware/image-upload");
const postsController = require("./../controllers/posts");

const router = express.Router();

router.post(
  "/",
  checkAuth,
  imageUpload,
  postsController.createPost
);

router.put(
  "/:id",
  checkAuth,
  imageUpload,
  postsController.updatePost
);

router.get("/", postsController.getPosts);

router.get("/:id", postsController.getPost);

router.delete("/:id", checkAuth, postsController.deletePost);

module.exports = router;
