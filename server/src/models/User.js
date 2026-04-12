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
    // Expanded Student Profile
    studentProfile: {
      contactInfo: {
        phone: { type: String, default: "" },
        location: { type: String, default: "" }
      },
      careerPreferences: {
        preferredJobType: { type: String, default: "" },
        availability: { type: String, default: "" },
        preferredLocations: [{ type: String }] // e.g. "Bangalore", "Remote"
      },
      education: [{
        qualification: String,
        institute: String,
        specialization: String,
        score: String, // String to accommodate CGPA or %
        startYear: String,
        endYear: String,
        passingYear: String,
        currentStatus: String
      }],
      skills: [{ type: String }],
      languages: [{
        name: String,
        proficiency: String
      }],
      internships: [{
        companyName: String,
        role: String,
        startDate: Date,
        endDate: Date,
        description: String
      }],
      projects: [{
        title: String,
        techStack: [{ type: String }],
        description: String,
        githubLink: String,
        duration: String
      }],
      profileSummary: { type: String, default: "" },
      achievements: [{ type: String }],
      resume: {
        filename: { type: String, default: "" },
        url: { type: String, default: "" }
      },
      profilePic: { type: String, default: "" },
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },

    recruiterProfile: {
      companyName: { type: String, default: "" },
      website: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);