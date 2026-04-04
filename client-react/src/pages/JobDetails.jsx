import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { jobAPI, appAPI } from "../services/api";
import useAuth from "../hooks/useAuth";

const typeColors = { internship: "bg-info", "full-time": "bg-success", "part-time": "bg-warning" };

function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
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
    jobAPI.getById(id)
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

  if (loading) return <div className="spinner-wrapper"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="container py-4"><div className="alert alert-danger">{error} <Link to="/">Browse jobs</Link></div></div>;

  return (
    <div className="container py-4" style={{ maxWidth: 800 }}>
      <Link to="/" className="btn btn-outline-secondary btn-sm mb-3"><i className="bi bi-arrow-left me-1"></i>Back to Jobs</Link>

      <div className="card p-4">
        <div className="d-flex justify-content-between align-items-start flex-wrap mb-3">
          <div>
            <h2>{job.title}</h2>
            <p className="text-muted mb-0"><i className="bi bi-building me-1"></i>{job.companyName || "Company"}</p>
          </div>
          <span className={"badge " + (typeColors[job.jobType] || "bg-secondary")}>{job.jobType}</span>
        </div>

        <hr />

        <div className="row mb-3">
          <div className="col-sm-6 mb-2"><strong><i className="bi bi-geo-alt me-1"></i>Location:</strong> {job.location}</div>
          <div className="col-sm-6 mb-2"><strong><i className="bi bi-cash me-1"></i>Stipend/Salary:</strong> {job.salaryOrStipend}</div>
          <div className="col-sm-6 mb-2"><strong><i className="bi bi-tag me-1"></i>Category:</strong> {job.category}</div>
          {job.deadline && (
            <div className="col-sm-6 mb-2">
              <strong><i className="bi bi-calendar me-1"></i>Deadline:</strong> {formatDate(job.deadline)}
              {isExpired && <span className="badge bg-danger ms-1">Expired</span>}
            </div>
          )}
        </div>

        {job.skillsRequired?.length > 0 && (
          <>
            <strong>Skills Required:</strong>
            <div className="mt-1 mb-3">
              {job.skillsRequired.map((s) => <span key={s} className="badge bg-primary me-1 mb-1">{s}</span>)}
            </div>
          </>
        )}

        <strong>Description:</strong>
        <p className="mt-1">{job.description}</p>

        {job.recruiterId && <p className="text-muted small">Posted by: {job.recruiterId.name || "Recruiter"}</p>}
      </div>

      {/* Apply section — students only */}
      {user?.role === "student" && (
        <div className="card p-4 mt-4">
          <h4>Apply for this Job</h4>

          {applied && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle me-2"></i>You have applied. <Link to="/applications">View your applications</Link>
            </div>
          )}

          {isExpired && !applied && <div className="alert alert-warning">The application deadline has passed.</div>}

          {applyError && <div className="alert alert-danger">{applyError}</div>}

          {!applied && !isExpired && (
            <form onSubmit={handleApply}>
              <div className="mb-3">
                <label className="form-label">Cover Letter (optional)</label>
                <textarea className="form-control" rows={4} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell the recruiter why you are a great fit..." />
              </div>
              <button type="submit" className="btn btn-success" disabled={applying}>
                {applying ? <><i className="bi bi-hourglass-split me-1"></i>Submitting...</> : <><i className="bi bi-send me-1"></i>Submit Application</>}
              </button>
            </form>
          )}
        </div>
      )}

      {!user && (
        <div className="card p-4 mt-4 text-center">
          <p className="mb-2">Want to apply?</p>
          <Link to="/login" className="btn btn-primary">Login to Apply</Link>
        </div>
      )}
    </div>
  );
}
