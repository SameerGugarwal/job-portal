const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    skillsRequired: [{ type: String }], // e.g. ["React", "Node.js"]

    location: { type: String, default: "Remote" },

    salaryOrStipend: { type: String, default: "Unpaid" }, // stored as string e.g. "₹10,000/month"

    jobType: {
      type: String,
      enum: ["internship", "full-time", "part-time"],
      default: "internship",
    },

    category: { type: String, default: "General" }, // e.g. "Engineering", "Marketing"

    deadline: { type: Date }, // application deadline

    // Which recruiter posted this job
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Stored separately so frontend doesn't need to populate recruiter for display
    companyName: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
