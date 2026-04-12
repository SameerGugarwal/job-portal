/* ── JobDetails — hero card + detail grid + apply form ──────── */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { jobAPI, appAPI } from "../services/api";
import useAuth from "../hooks/useAuth";

function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getCompanyInitial(name) {
  const trimmed = name?.trim();
  return trimmed ? trimmed[0].toUpperCase() : "J";
}

function JobTypeBadge({ type }) {
  const map = {
    internship: { cls: "badge-internship", label: "Internship" },
    "full-time": { cls: "badge-fulltime", label: "Full-time" },
    "part-time": { cls: "badge-parttime", label: "Part-time" },
  };
  const info = map[type] || { cls: "badge-secondary", label: type || "—" };
  return <span className={"badge " + info.cls}>{info.label}</span>;
}

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    jobAPI
      .getById(id)
      .then((data) => setJob(data.job))
      .catch(() => setError("Job not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const isExpired = job?.deadline && new Date() > new Date(job.deadline);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyError("");

    try {
      await appAPI.apply({ jobId: id, coverLetter });
      setApplied(true);
    } catch (err) {
      setApplyError(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5" style={{ maxWidth: 900 }}>
        <div className="alert alert-danger">
          {error} <Link to="/jobs">Browse jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <Link to="/jobs" className="btn btn-outline-secondary btn-sm mb-3">
        <i className="bi bi-arrow-left me-1"></i>Back to Jobs
      </Link>

      <div className="job-details-card animate-fade-in-up">
        <div className="job-details-header">
          <div className="company-logo-lg">{getCompanyInitial(job.companyName)}</div>
          <div className="flex-grow-1 min-w-0">
            <h2>{job.title}</h2>
            <p className="text-muted mb-0">
              <i className="bi bi-building me-1"></i>
              {job.companyName || "Company"}
            </p>
          </div>
          <JobTypeBadge type={job.jobType} />
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <div className="icon"><i className="bi bi-geo-alt"></i></div>
            <div>
              <p className="label">Location</p>
              <p className="value">{job.location || "—"}</p>
            </div>
          </div>
          <div className="detail-item">
            <div className="icon"><i className="bi bi-cash-coin"></i></div>
            <div>
              <p className="label">Salary / Stipend</p>
              <p className="value">{job.salaryOrStipend || "—"}</p>
            </div>
          </div>
          <div className="detail-item">
            <div className="icon"><i className="bi bi-tag"></i></div>
            <div>
              <p className="label">Category</p>
              <p className="value">{job.category || "General"}</p>
            </div>
          </div>
          <div className="detail-item">
            <div className="icon"><i className="bi bi-calendar"></i></div>
            <div>
              <p className="label">Deadline</p>
              <p className="value">
                {formatDate(job.deadline)}
                {isExpired && <span className="badge bg-danger ms-2">Expired</span>}
              </p>
            </div>
          </div>
        </div>

        {job.skillsRequired?.length > 0 && (
          <div className="mb-4">
            <h5 className="mb-2"><i className="bi bi-stars me-2 text-primary"></i>Skills Required</h5>
            <div>
              {job.skillsRequired.map((s) => (
                <span key={s} className="skill-chip">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <h5 className="mb-2"><i className="bi bi-file-text me-2 text-primary"></i>Description</h5>
          <p style={{ whiteSpace: "pre-line", color: "var(--color-text-muted)" }}>{job.description}</p>
        </div>

        {job.recruiterId && (
          <p className="text-muted small mb-0">
            <i className="bi bi-person me-1"></i>Posted by {job.recruiterId.name || "Recruiter"}
          </p>
        )}
      </div>

      {/* Apply section — students only */}
      {user?.role === "student" && (
        <div className="job-details-card mt-4 animate-fade-in-up delay-1">
          <h4><i className="bi bi-send-fill me-2 text-primary"></i>Apply for this Job</h4>

          {applied && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle me-2"></i>Application submitted successfully.{" "}
              <Link to="/applications">View your applications</Link>
            </div>
          )}

          {isExpired && !applied && (
            <div className="alert alert-warning">
              <i className="bi bi-clock-history me-2"></i>The application deadline has passed.
            </div>
          )}

          {applyError && <div className="alert alert-danger">{applyError}</div>}

          {!applied && !isExpired && (
            <form onSubmit={handleApply}>
              <div className="mb-3">
                <label className="form-label">Cover Letter (optional)</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you're a great fit..."
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={applying}>
                {applying ? (
                  <><i className="bi bi-hourglass-split me-1"></i>Submitting…</>
                ) : (
                  <><i className="bi bi-send me-1"></i>Submit Application</>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {!user && (
        <div className="job-details-card mt-4 text-center">
          <p className="mb-3"><i className="bi bi-lock me-1"></i>Want to apply? Login as a student.</p>
          <Link to="/login" className="btn btn-primary">
            <i className="bi bi-box-arrow-in-right me-1"></i>Login to Apply
          </Link>
        </div>
      )}
    </div>
  );
}
