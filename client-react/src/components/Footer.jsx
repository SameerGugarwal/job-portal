/* ── Footer — 5 column modern layout ─────────────────────────── */

import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-12">
            <div className="footer-brand">
              <span className="brand-mark">
                <i className="bi bi-briefcase-fill"></i>
              </span>
              <span>JobPortal</span>
            </div>
            <p className="footer-tagline">
              Connecting talented students with forward-thinking recruiters.
              Your dream career starts here.
            </p>
            <div className="social-links">
              <a href="#!" aria-label="Twitter"><i className="bi bi-twitter-x"></i></a>
              <a href="#!" aria-label="LinkedIn"><i className="bi bi-linkedin"></i></a>
              <a href="#!" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              <a href="#!" aria-label="GitHub"><i className="bi bi-github"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <h6>For Students</h6>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/applications">My Applications</Link>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <h6>For Recruiters</h6>
            <Link to="/register">Post a Job</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/login">Sign In</Link>
          </div>

          <div className="col-lg-2 col-md-4 col-6">
            <h6>Company</h6>
            <a href="#!">About Us</a>
            <a href="#!">Careers</a>
            <a href="#!">Privacy</a>
          </div>

          <div className="col-lg-2 col-md-12 col-6">
            <h6>Contact</h6>
            <a href="#!"><i className="bi bi-envelope me-1"></i> hello@jobportal.dev</a>
            <a href="#!"><i className="bi bi-geo-alt me-1"></i> Bangalore, India</a>
          </div>
        </div>

        <div className="copyright">
          <p className="mb-0">© {year} JobPortal — React SPA. Built for the Web Tech project.</p>
        </div>
      </div>
    </footer>
  );
}
