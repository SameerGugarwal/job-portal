const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { getProfile, getStudentProfileById, updateProfile, uploadResume, uploadProfilePic } = require("../controllers/profileController");
const router = express.Router();

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads/resumes");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save to server/uploads/resumes
  },
  filename: function (req, file, cb) {
    // Generate unique filename: userId-timestamp-originalExt
    const userId = req.session?.userId || "unknown";
    const ext = path.extname(file.originalname);
    cb(null, `${userId}-${Date.now()}${ext}`);
  }
});

// Configure multer
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    // Accept only specific file types (pdf, doc, docx)
    const allowedMimeTypes = [
      "application/pdf", 
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, and DOCX are allowed."));
    }
  }
});

// Setup for profile pictures
const picUploadDir = path.join(__dirname, "../../uploads/pictures");
if (!fs.existsSync(picUploadDir)) {
  fs.mkdirSync(picUploadDir, { recursive: true });
}
const picStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, picUploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.session?.userId || "unknown";
    const ext = path.extname(file.originalname);
    cb(null, `pic-${userId}-${Date.now()}${ext}`);
  }
});
const picUpload = multer({
  storage: picStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit for images
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  }
});

// Check if user is authenticated middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Routes
router.get("/", requireAuth, getProfile);
router.get("/student/:id", requireAuth, getStudentProfileById);
router.put("/", requireAuth, updateProfile);

// The 'resume' string here must match the field name used in formData.append('resume', file) on the frontend
router.post("/resume", requireAuth, upload.single("resume"), uploadResume);

router.post("/picture", requireAuth, picUpload.single("profilePic"), uploadProfilePic);

// Error handler for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

module.exports = router;
