const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const sendEmail = require("../config/mailer");

// ── STUDENT ROUTES ────────────────────────────────────────────

// POST /api/applications
// Student applies to a job
exports.applyToJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    // Check the job exists
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Check deadline hasn't passed
    if (job.deadline && new Date() > new Date(job.deadline)) {
      return res.status(400).json({ message: "Application deadline has passed" });
    }

    // Create application — the unique index on (jobId + studentId) will
    // automatically throw a duplicate error if already applied
    const application = await Application.create({
      jobId,
      studentId: req.session.userId,
      coverLetter: coverLetter || "",
    });

    // Send confirmation email to the student (non-blocking)
    const student = await User.findById(req.session.userId);
    if (student) {
      sendEmail(
        student.email,
        `Application Received — ${job.title}`,
        `<h2>Hi ${student.name},</h2>
         <p>Your application for <strong>${job.title}</strong> has been submitted successfully.</p>
         <p><strong>Company:</strong> ${job.companyName || "N/A"}</p>
         <p><strong>Status:</strong> Applied</p>
         <p>We'll notify you when there's an update. Good luck!</p>
         <br><p>— Job Portal Team</p>`
      );
    }

    return res.status(201).json({ message: "Application submitted", application });
  } catch (err) {
    // Mongoose duplicate key error code
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already applied to this job" });
    }
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/applications/me
// Student views their own applications (with job details populated)
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.session.userId })
      .populate("jobId", "title companyName location jobType")
      .sort({ appliedAt: -1 });

    return res.status(200).json({ applications });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ── RECRUITER ROUTES ──────────────────────────────────────────

// GET /api/applications/job/:jobId
// Recruiter views all applicants for one of their jobs
exports.getApplicantsForJob = async (req, res) => {
  try {
    // First verify this job belongs to the logged-in recruiter
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.recruiterId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to view applicants for this job" });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate("studentId", "name email studentProfile")
      .sort({ appliedAt: -1 });

    return res.status(200).json({ applications });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PATCH /api/applications/:id/status
// Recruiter updates application status (Shortlisted, Rejected, Hired)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Applied", "Shortlisted", "Rejected", "Hired"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const application = await Application.findById(req.params.id).populate("jobId");
    if (!application) return res.status(404).json({ message: "Application not found" });

    // Only the recruiter who owns the job can update status
    if (application.jobId.recruiterId.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this application" });
    }

    application.status = status;
    await application.save();

    // Notify the student about the status change (non-blocking)
    const student = await User.findById(application.studentId);
    if (student) {
      const jobTitle = application.jobId.title || "a job";
      sendEmail(
        student.email,
        `Application Update — ${jobTitle}`,
        `<h2>Hi ${student.name},</h2>
         <p>Your application for <strong>${jobTitle}</strong> has been updated.</p>
         <p><strong>New Status:</strong> ${status}</p>
         ${status === "Shortlisted" ? "<p>Congratulations! The recruiter is interested in your profile.</p>" : ""}
         ${status === "Hired" ? "<p>🎉 Congratulations! You've been hired!</p>" : ""}
         ${status === "Rejected" ? "<p>Unfortunately, the recruiter has decided to move forward with other candidates. Don't give up!</p>" : ""}
         <br><p>— Job Portal Team</p>`
      );
    }

    return res.status(200).json({ message: "Status updated", application });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
