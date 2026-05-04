const multer = require("multer");

// Memory storage — no filesystem dependency (works on Render, Vercel, etc.)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const mimeOk = allowed.test(file.mimetype);
  if (mimeOk) return cb(null, true);
  cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed"));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter,
});

module.exports = upload;
