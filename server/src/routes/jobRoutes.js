const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

// ── PUBLIC (no login needed) ──────────────────────────────────
router.get("/", jobController.getAllJobs);

// IMPORTANT: This specific route must come BEFORE /:id
// Otherwise Express will try to match "recruiter/mine" as an :id param
router.get("/recruiter/mine", requireAuth, requireRole("recruiter"), jobController.getMyJobs);

router.get("/:id", jobController.getJobById);

// ── RECRUITER ONLY ────────────────────────────────────────────
router.post("/", requireAuth, requireRole("recruiter"), jobController.createJob);
router.put("/:id", requireAuth, requireRole("recruiter"), jobController.updateJob);
router.delete("/:id", requireAuth, requireRole("recruiter"), jobController.deleteJob);

module.exports = router;
