const multer = require("multer");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
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
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const ext = MIME_TYPE_MAP[file.mimetype];

    // Save as name-timestamp.ext
    cb(null, `${name}-${Date.now()}.${ext}`);
  },
});

module.exports = multer({ storage }).single("image");
