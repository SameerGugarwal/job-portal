const Job = require("../models/Job");
const User = require("../models/User");

// ── PUBLIC ROUTES ─────────────────────────────────────────────

// GET /api/jobs
// Returns all jobs. Supports optional query filters: ?location=&jobType=&category=&search=
exports.getAllJobs = async (req, res) => {
  try {
    const { location, jobType, category, search } = req.query;

    // Build a filter object dynamically
    const filter = {};

    if (location) filter.location = { $regex: location, $options: "i" };
    if (jobType) filter.jobType = jobType;
    if (category) filter.category = { $regex: category, $options: "i" };
    if (search) {
      // Search in title or description
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 }); // newest first
    return res.status(200).json({ jobs });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/jobs/:id
// Returns a single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("recruiterId", "name email recruiterProfile");
    if (!job) return res.status(404).json({ message: "Job not found" });
    return res.status(200).json({ job });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── RECRUITER-ONLY ROUTES ─────────────────────────────────────

// GET /api/jobs/recruiter/mine
// Returns all jobs posted by the logged-in recruiter
exports.getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.session.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ jobs });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/jobs
// Recruiter creates a new job
exports.createJob = async (req, res) => {
  try {
    const { title, description, skillsRequired, location, salaryOrStipend, jobType, category, deadline } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "title and description are required" });
    }

    // Get companyName from recruiter's profile
    const recruiter = await User.findById(req.session.userId).select("recruiterProfile name");
    const companyName = recruiter?.recruiterProfile?.companyName || recruiter?.name || "";

    const job = await Job.create({
      title,
      description,
      skillsRequired: skillsRequired || [],
      location: location || "Remote",
      salaryOrStipend: salaryOrStipend || "Unpaid",
      jobType: jobType || "internship",
      category: category || "General",
      deadline: deadline || null,
      recruiterId: req.session.userId,
      companyName,
    });

    return res.status(201).json({ message: "Job created", job });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/jobs/:id
// Recruiter updates their own job
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Only the recruiter who posted it can edit it
    if (job.recruiterId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this job" });
    }

    const allowed = ["title", "description", "skillsRequired", "location", "salaryOrStipend", "jobType", "category", "deadline"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field];
      }
    });

    await job.save();
    return res.status(200).json({ message: "Job updated", job });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/jobs/:id
// Recruiter deletes their own job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.recruiterId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();
    return res.status(200).json({ message: "Job deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
