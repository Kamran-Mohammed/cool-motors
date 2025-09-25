const os = require("os");
const path = require("path");
const multer = require("multer");
const AppError = require("./appError"); // Adjust path if needed

// const storage = multer.memoryStorage();
const storage = multer.diskStorage({
  destination: os.tmpdir(), // system temp dir
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage }).array("images", 20);

const handleMulterErrors = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return next(
          new AppError(
            "You cannot upload more than 20 images per vehicle.",
            400
          )
        );
      }
      return next(new AppError(err.message, 400));
    } else if (err) {
      // An unknown error occurred when uploading
      return next(new AppError("Image upload failed. Please try again.", 400));
    }
    next();
  });
};

module.exports = handleMulterErrors;
