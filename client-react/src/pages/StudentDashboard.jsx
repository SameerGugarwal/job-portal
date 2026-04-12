/* ── StudentDashboard — animated stat tiles + modern table ──── */

import { useState, useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { appAPI } from "../services/api";
import useAuth from "../hooks/useAuth";

function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function JobTypeBadge({ type }) {
  if (!type) return <span>—</span>;
  const map = {
    internship: { cls: "badge-internship", label: "Internship" },
    "full-time": { cls: "badge-fulltime", label: "Full-time" },
    "part-time": { cls: "badge-parttime", label: "Part-time" },
  };
  const info = map[type] || { cls: "badge-secondary", label: type };
  return <span className={"badge " + info.cls}>{info.label}</span>;
}

function StatusBadge({ status }) {
  return <span className={"badge status-" + (status || "").toLowerCase()}>{status}</span>;
}

/** Animated counter — ramps from 0 to target over ~800ms */
function AnimatedCount({ target }) {
  const [value, setValue] = useState(0);
  const frame = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const duration = 800;
    const tick = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setValue(Math.round(eased * target));
      if (elapsed < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target]);

  return <>{value}</>;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    appAPI
      .getMyApplications()
      .then((data) => setApps(data.applications))
      .catch(() => setError("Failed to load applications."))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "student") return <Navigate to="/dashboard" replace />;

  const total = apps.length;
  const shortlisted = apps.filter((a) => a.status === "Shortlisted").length;
  const hired = apps.filter((a) => a.status === "Hired").length;

  return (
    <>
      <section className="dashboard-header">
        <div className="container">
          <div>
            <h2><i className="bi bi-mortarboard-fill me-2"></i>Welcome, {user.name}</h2>
            <p>Track your job applications and their current status.</p>
          </div>
        </div>
      </section>

      <main className="py-4">
        <div className="container">
          {/* Stats Row */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="stat-card animate-fade-in-up">
                <div className="stat-icon icon-blue"><i className="bi bi-file-earmark-text-fill"></i></div>
                <div>
                  <h3><AnimatedCount target={total} /></h3>
                  <p>Total Applied</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card animate-fade-in-up delay-1">
                <div className="stat-icon icon-green"><i className="bi bi-star-fill"></i></div>
                <div>
                  <h3><AnimatedCount target={shortlisted} /></h3>
                  <p>Shortlisted</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card animate-fade-in-up delay-2">
                <div className="stat-icon icon-purple"><i className="bi bi-check-circle-fill"></i></div>
                <div>
                  <h3><AnimatedCount target={hired} /></h3>
                  <p>Hired</p>
                </div>
              </div>
            </div>
          </div>

          <h4 className="mb-3"><i className="bi bi-clock-history me-2 text-primary"></i>Your Applications</h4>

          {loading && (
            <div className="spinner-wrapper">
              <div className="spinner-border text-primary"></div>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && apps.length === 0 && !error && (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>You haven't applied to any jobs yet. Start exploring!</p>
              <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
            </div>
          )}

          {apps.length > 0 && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app, i) => {
                    const job = app.jobId || {};
                    return (
                      <tr key={app._id}>
                        <td><strong>{i + 1}</strong></td>
                        <td><strong>{job.title || "—"}</strong></td>
                        <td>{job.companyName || "—"}</td>
                        <td><i className="bi bi-geo-alt text-muted me-1"></i>{job.location || "—"}</td>
                        <td><JobTypeBadge type={job.jobType} /></td>
                        <td><StatusBadge status={app.status} /></td>
                        <td className="text-muted">{formatDate(app.appliedAt || app.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
