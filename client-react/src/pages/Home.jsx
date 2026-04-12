/* ── Home — landing page with hero, featured jobs, CTA ─────── */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jobAPI } from "../services/api";
import JobCard from "../components/JobCard";

function useCountUp(target, duration = 1400, trigger) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, trigger]);
  return count;
}

function StatCounter({ target, label }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const count = useCountUp(target, 1400, visible);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hero-stat" ref={ref}>
      <span className="number">{count.toLocaleString()}</span>
      <div className="label">{label}</div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    jobAPI.getAll({})
      .then((data) => setFeaturedJobs((data.jobs || []).slice(0, 6)))
      .catch(() => {})
      .finally(() => setJobsLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    navigate("/jobs" + (params.toString() ? "?" + params.toString() : ""));
  };

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="container">
          <h1>
            Find Your <span className="text-accent">Dream Career</span>
            <br />In One Click
          </h1>
          <p className="lead">
            Connecting talented students with top companies. Discover thousands of
            internships and full-time roles tailored to you.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <i className="bi bi-search text-muted"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Job title, skills or keywords"
            />
            <div className="divider d-none d-md-block"></div>
            <i className="bi bi-geo-alt text-muted d-none d-md-inline"></i>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or location"
              className="d-none d-md-block"
            />
            <button type="submit" className="btn btn-primary rounded-pill px-4">
              <i className="bi bi-search me-1"></i>Search
            </button>
          </form>

          <div className="hero-stats">
            <StatCounter target={2400} label="Active Jobs" />
            <StatCounter target={850} label="Companies" />
            <StatCounter target={12500} label="Happy Hires" />
          </div>
        </div>
      </section>

      <main>
        {/* ── How It Works ─────────────────────────────────────── */}
        <section className="section">
          <div className="container">
            <div className="text-center">
              <span className="section-eyebrow">How It Works</span>
              <h2 className="section-title">Land Your Next Role in 3 Steps</h2>
              <p className="section-subtitle">
                From browsing to applying — we've made the entire job search process effortless.
              </p>
            </div>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="feature-card text-center">
                  <div className="icon-wrap mx-auto">
                    <i className="bi bi-person-plus-fill"></i>
                  </div>
                  <h5>1. Create Your Profile</h5>
                  <p>Sign up in seconds as a student or recruiter. Build a profile that showcases your skills.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="feature-card text-center">
                  <div className="icon-wrap mx-auto">
                    <i className="bi bi-search-heart-fill"></i>
                  </div>
                  <h5>2. Discover Opportunities</h5>
                  <p>Browse curated jobs filtered by location, skills, and category. Find roles that match you.</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="feature-card text-center">
                  <div className="icon-wrap mx-auto">
                    <i className="bi bi-rocket-takeoff-fill"></i>
                  </div>
                  <h5>3. Apply &amp; Get Hired</h5>
                  <p>Submit your application instantly with a cover letter. Track your status in real time.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Jobs ─────────────────────────────────────── */}
        <section className="section" style={{ background: "#fff" }}>
          <div className="container">
            <div className="text-center">
              <span className="section-eyebrow">Latest Openings</span>
              <h2 className="section-title">Featured Opportunities</h2>
              <p className="section-subtitle">
                Hand-picked openings from top companies hiring right now.
              </p>
            </div>

            {jobsLoading && (
              <div className="spinner-wrapper">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {!jobsLoading && featuredJobs.length === 0 && (
              <div className="empty-state">
                <i className="bi bi-briefcase"></i>
                <p>No jobs posted yet. Check back soon!</p>
              </div>
            )}

            {!jobsLoading && featuredJobs.length > 0 && (
              <div className="row g-4">
                {featuredJobs.map((job, i) => (
                  <div key={job._id} className="col-md-6 col-lg-4">
                    <JobCard job={job} index={i} />
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-5">
              <Link to="/jobs" className="btn btn-primary btn-lg">
                Browse All Jobs <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Why JobPortal ─────────────────────────────────────── */}
        <section className="section">
          <div className="container">
            <div className="text-center">
              <span className="section-eyebrow">Why JobPortal</span>
              <h2 className="section-title">Built for Modern Job Seekers</h2>
              <p className="section-subtitle">
                We bring together everything you need to start, grow, and accelerate your career.
              </p>
            </div>
            <div className="row g-4">
              {[
                { icon: "bi-lightning-charge-fill", title: "Lightning Fast", desc: "Apply to jobs in just a few clicks. No long forms." },
                { icon: "bi-shield-check", title: "Verified Companies", desc: "All recruiters are reviewed before posting jobs." },
                { icon: "bi-bell-fill", title: "Real-time Updates", desc: "Get email alerts for application status changes." },
                { icon: "bi-graph-up-arrow", title: "Track Progress", desc: "See all your applications in one personal dashboard." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="col-md-6 col-lg-3">
                  <div className="feature-card text-center">
                    <div className="icon-wrap mx-auto">
                      <i className={"bi " + icon}></i>
                    </div>
                    <h5>{title}</h5>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <div className="cta-section">
          <div className="container">
            <h2>Ready to Take the Next Step?</h2>
            <p>
              Join thousands of students who landed their dream roles through JobPortal.
              Your journey starts here.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/register" className="btn btn-light btn-lg">
                <i className="bi bi-person-plus me-1"></i>Create Account
              </Link>
              <Link to="/jobs" className="btn btn-outline-light btn-lg">
                <i className="bi bi-search me-1"></i>Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
