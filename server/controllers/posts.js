const Post = require("./../models/post");

const getImagePath = (req) => {
  const url = `${req.protocol}://${req.get("host")}`;
  return `${url}/images/${req.file.filename}`;
};

exports.createPost = async (req, res) => {
  try {
    const post = await new Post({
      creator: req.userData.userId,
      title: req.body.title,
      content: req.body.content,
      imagePath: getImagePath(req),
    }).save({ new: true });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

exports.updatePost = async (req, res) => {
  try {
    const newPost = req.body;
    newPost.creator = req.userData.userId;

    // A new file has been uploaded
    if (req.file) {
      newPost.imagePath = getImagePath(req);
    }

    const post = await Post.findOneAndUpdate(
      {
        _id: req.params.id,
        creator: req.userData.userId,
      },
      newPost,
      {
        new: true,
      }
    );

    if (!post) {
      return res.status(401).json();
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

exports.getPosts = async (req, res) => {
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
      Post.countDocuments().exec(),
    ]);

    res.json({ posts, count });
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};

exports.getPost = async (req, res) => {
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
};

exports.deletePost = async (req, res) => {
  try {
    // const post = await Post.findByIdAndDelete(req.params.id);
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      creator: req.userData.userId,
    });

    if (!post) {
      return res.status(401).json();
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
};
