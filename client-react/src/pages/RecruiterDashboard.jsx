import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { jobAPI, appAPI } from "../services/api";
import useAuth from "../hooks/useAuth";

const typeColors = { internship: "bg-info", "full-time": "bg-success", "part-time": "bg-warning" };
const statusColors = { Applied: "status-applied", Shortlisted: "status-shortlisted", Rejected: "status-rejected", Hired: "status-hired" };

function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Post job form
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const emptyJob = { title: "", description: "", skillsRaw: "", location: "", salaryOrStipend: "", jobType: "internship", category: "", deadline: "" };
  const [newJob, setNewJob] = useState(emptyJob);

  // Applicants
  const [applicants, setApplicants] = useState([]);
  const [applicantsTitle, setApplicantsTitle] = useState("");
  const [showApplicants, setShowApplicants] = useState(false);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => { loadJobs(); }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "recruiter") return <Navigate to="/applications" replace />;

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await jobAPI.getMyJobs();
      setJobs(data.jobs);
    } catch {
      setError("Failed to load your jobs.");
    } finally {
      setLoading(false);
    }
  }

  const set = (field) => (e) => setNewJob({ ...newJob, [field]: e.target.value });

  async function handlePost(e) {
    e.preventDefault();
    if (!newJob.title || !newJob.description) { setPostError("Title and description are required."); return; }

    setPosting(true);
    setPostError("");

    const skills = newJob.skillsRaw ? newJob.skillsRaw.split(",").map((s) => s.trim()) : [];

    try {
      await jobAPI.create({
        title: newJob.title, description: newJob.description, skillsRequired: skills,
        location: newJob.location || "Remote", salaryOrStipend: newJob.salaryOrStipend || "Unpaid",
        jobType: newJob.jobType, category: newJob.category || "General", deadline: newJob.deadline || null,
      });
      setNewJob(emptyJob);
      setShowForm(false);
      loadJobs();
    } catch (err) {
      setPostError(err.message);
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(jobId) {
    if (!confirm("Delete this job?")) return;
    try {
      await jobAPI.remove(jobId);
      setJobs(jobs.filter((j) => j._id !== jobId));
    } catch { alert("Failed to delete."); }
  }

  async function viewApplicants(jobId, title) {
    setApplicantsTitle(title);
    setShowApplicants(true);
    setLoadingApplicants(true);
    try {
      const data = await appAPI.getApplicantsForJob(jobId);
      setApplicants(data.applications);
    } catch { setApplicants([]); }
    finally { setLoadingApplicants(false); }
  }

  async function updateStatus(appId, status) {
    try {
      await appAPI.updateStatus(appId, status);
      setApplicants(applicants.map((a) => a._id === appId ? { ...a, status } : a));
    } catch { alert("Failed to update status."); }
  }

  return (
    <>
      <div className="dashboard-header">
        <div className="container d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h2><i className="bi bi-briefcase me-2"></i>Welcome, {user.name}</h2>
            <p className="mb-0">Manage your job postings and applicants</p>
          </div>
          <button className="btn btn-light mt-2 mt-md-0" onClick={() => setShowForm(!showForm)}>
            <i className="bi bi-plus-circle me-1"></i>Post New Job
          </button>
        </div>
      </div>

      <div className="container">
        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4"><div className="stat-card"><p className="text-muted mb-1">Jobs Posted</p><h3>{jobs.length}</h3></div></div>
        </div>

        {/* Post Job Form */}
        {showForm && (
          <div className="card p-4 mb-4">
            <h5><i className="bi bi-plus-circle me-2"></i>Post a New Job</h5>
            {postError && <div className="alert alert-danger">{postError}</div>}
            <form onSubmit={handlePost}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Job Title *</label>
                  <input type="text" className="form-control" value={newJob.title} onChange={set("title")} placeholder="e.g. Frontend Developer Intern" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Job Type</label>
                  <select className="form-select" value={newJob.jobType} onChange={set("jobType")}>
                    <option value="internship">Internship</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Description *</label>
                  <textarea className="form-control" rows={3} value={newJob.description} onChange={set("description")} placeholder="Describe the role..." />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Skills (comma-separated)</label>
                  <input type="text" className="form-control" value={newJob.skillsRaw} onChange={set("skillsRaw")} placeholder="React, Node.js" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-control" value={newJob.location} onChange={set("location")} placeholder="e.g. Bangalore" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Stipend / Salary</label>
                  <input type="text" className="form-control" value={newJob.salaryOrStipend} onChange={set("salaryOrStipend")} placeholder="15,000/month" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Category</label>
                  <input type="text" className="form-control" value={newJob.category} onChange={set("category")} placeholder="Engineering" />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Deadline</label>
                  <input type="date" className="form-control" value={newJob.deadline} onChange={set("deadline")} />
                </div>
              </div>
              <div className="mt-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={posting}>{posting ? "Posting..." : "Post Job"}</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading && <div className="spinner-wrapper"><div className="spinner-border text-primary"></div></div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && jobs.length === 0 && !error && (
          <div className="empty-state">
            <i className="bi bi-briefcase d-block" style={{ fontSize: "3rem" }}></i>
            <p>No jobs posted yet. Click "Post New Job" to get started.</p>
          </div>
        )}

        {/* Job List */}
        {jobs.length > 0 && <h4 className="mb-3">Your Job Postings</h4>}
        {jobs.map((job) => (
          <div key={job._id} className="card job-card p-3 mb-3">
            <div className="d-flex justify-content-between align-items-start flex-wrap">
              <div>
                <h5 className="mb-1">{job.title}</h5>
                <p className="text-muted mb-1">{job.location} &middot; {job.salaryOrStipend}</p>
              </div>
              <span className={"badge " + (typeColors[job.jobType] || "bg-secondary")}>{job.jobType}</span>
            </div>
            {job.deadline && <p className="small text-muted mb-2">Deadline: {formatDate(job.deadline)}</p>}
            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-outline-primary btn-sm" onClick={() => viewApplicants(job._id, job.title)}>
                <i className="bi bi-people me-1"></i>View Applicants
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(job._id)}>
                <i className="bi bi-trash me-1"></i>Delete
              </button>
            </div>
          </div>
        ))}

        {/* Applicants Panel */}
        {showApplicants && (
          <div className="card p-4 mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Applicants for: {applicantsTitle}</h5>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowApplicants(false)}><i className="bi bi-x-lg"></i> Close</button>
            </div>

            {loadingApplicants && <div className="spinner-wrapper"><div className="spinner-border text-primary"></div></div>}

            {!loadingApplicants && applicants.length === 0 && <p className="text-muted text-center">No applications yet.</p>}

            {!loadingApplicants && applicants.length > 0 && (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Cover Letter</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {applicants.map((app, i) => (
                      <tr key={app._id}>
                        <td>{i + 1}</td>
                        <td>{app.studentId?.name || "—"}</td>
                        <td>{app.studentId?.email || "—"}</td>
                        <td>{app.coverLetter || "—"}</td>
                        <td><span className={"badge " + (statusColors[app.status] || "")}>{app.status}</span></td>
                        <td>
                          <select className="form-select form-select-sm" value={app.status} onChange={(e) => updateStatus(app._id, e.target.value)} style={{ width: 140 }}>
                            <option value="Applied">Applied</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Hired">Hired</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
