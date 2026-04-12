require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const  {MongoStore}  = require("connect-mongo");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

// ── Middleware ────────────────────────────────────────────────
// Allow cross-origin requests (needed for our separate frontend files)
app.use(
  cors({
    origin: true,
    credentials: true, // required so cookies/sessions are sent
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Session setup — stores userId and role on req.session
// Sessions are saved in MongoDB so they survive server restarts
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,  // JS cannot read the cookie (security)
      secure: false,    // false for HTTP (localhost). Set true in production with HTTPS
      sameSite: "lax",  // helps cookies work across Thunder Client / browser
      maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
    },
  })
);

// ── Serve static frontends ───────────────────────────────────
// Serves client-static/ at root and client-angular/ at /angular/
// Same origin = no CORS/cookie issues
app.use(express.static(path.join(__dirname, "../../client-static")));
app.use("/angular", express.static(path.join(__dirname, "../../client-angular")));
app.use("/uploads", express.static(path.join(__dirname, "../../server/uploads")));

// ── Routes ────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);

// ── 404 handler ──────────────────────────────────────────────
// API routes → return JSON error
// Everything else → serve index.html (so direct links to pages work)
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "Route not found" });
  }
  res.sendFile(path.join(__dirname, "../../client-static/index.html"));
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
