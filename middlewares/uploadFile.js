const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create the necessary directories if they don't exist
const imagesDir = path.join("uploads", "images");
const filesDir = path.join("uploads", "files");
const profileDir = path.join("uploads", "profile");

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true });
}

if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

// Storage configuration for general files (images and documents)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, imagesDir);
    } else {
      cb(null, filesDir);
    }
  },
  filename: function (req, file, cb) {
    const sanitizeFilename = (originalName) => {
      return originalName.replace(/[^a-z0-9.-]/gi, "").toLowerCase();
    };

    const originalName = file.originalname;
    const sanitizedName = sanitizeFilename(originalName);
    cb(null, `${Date.now()}-${sanitizedName}`);
  },
});

// File filter to allow only images and application types (documents)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("application/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type, only images and documents are allowed!"),
      false
    );
  }
};

// General file upload configuration (images and documents)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB limit
  },
});

// Storage configuration for profile images
const storageProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`);
  },
});

// Profile image upload configuration
const uploadProfile = multer({ storage: storageProfile });

// Export both upload configurations
module.exports = {
  upload,
  uploadProfile,
};
