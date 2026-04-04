const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    coverLetter: { type: String, default: "" },

    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Rejected", "Hired"],
      default: "Applied",
    },

    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent a student from applying to the same job twice
// This creates a unique compound index on (jobId + studentId)
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
