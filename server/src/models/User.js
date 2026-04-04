const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ["student", "recruiter", "admin"],
      default: "student",
    },

    // Optional fields (we’ll use later)
    studentProfile: {
      skills: [{ type: String }],
      education: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      resumeUrl: { type: String, default: "" },
    },

    recruiterProfile: {
      companyName: { type: String, default: "" },
      website: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);