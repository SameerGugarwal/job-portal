const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// ── STUDENT ONLY ──────────────────────────────────────────────
router.post("/", requireAuth, requireRole("student"), applicationController.applyToJob);
router.get("/me", requireAuth, requireRole("student"), applicationController.getMyApplications);

// ── RECRUITER ONLY ────────────────────────────────────────────
router.get("/job/:jobId", requireAuth, requireRole("recruiter"), applicationController.getApplicantsForJob);
router.patch("/:id/status", requireAuth, requireRole("recruiter"), applicationController.updateStatus);

module.exports = router;
