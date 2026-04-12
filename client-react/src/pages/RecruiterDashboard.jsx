/* ── RecruiterDashboard — animated stats, card grid, modal ──── */

import { useState, useEffect, useRef } from "react";
import { Navigate, Link } from "react-router-dom";
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
  if (!name) return "J";
  const trimmed = name.trim();
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

function StatusBadge({ status }) {
  return <span className={"badge status-" + (status || "").toLowerCase()}>{status}</span>;
}

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

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Stat counts across all jobs
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [totalHired, setTotalHired] = useState(0);

  // Post job form (modal)
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const emptyJob = {
    title: "",
    description: "",
    skillsRaw: "",
    location: "",
    salaryOrStipend: "",
    jobType: "internship",
    category: "",
    deadline: "",
  };
  const [newJob, setNewJob] = useState(emptyJob);

  // Applicants modal
  const [applicants, setApplicants] = useState([]);
  const [applicantsTitle, setApplicantsTitle] = useState("");
  const [showApplicants, setShowApplicants] = useState(false);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "recruiter") return <Navigate to="/applications" replace />;

  async function loadJobs() {
    setLoading(true);
    try {
      const data = await jobAPI.getMyJobs();
      setJobs(data.jobs);
      loadStats(data.jobs);
    } catch {
      setError("Failed to load your jobs.");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats(jobList) {
    if (!jobList.length) {
      setTotalApplicants(0);
      setTotalHired(0);
      return;
    }
    try {
      const results = await Promise.all(
        jobList.map((j) => appAPI.getApplicantsForJob(j._id).catch(() => ({ applications: [] })))
      );
      let apps = 0;
      let hired = 0;
      results.forEach((r) => {
        apps += r.applications.length;
        hired += r.applications.filter((a) => a.status === "Hired").length;
      });
      setTotalApplicants(apps);
      setTotalHired(hired);
    } catch {
      // ignore
    }
  }

  const set = (field) => (e) => setNewJob({ ...newJob, [field]: e.target.value });

  async function handlePost(e) {
    e.preventDefault();
    if (!newJob.title || !newJob.description) {
      setPostError("Title and description are required.");
      return;
    }

    setPosting(true);
    setPostError("");

    const skills = newJob.skillsRaw
      ? newJob.skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    try {
      await jobAPI.create({
        title: newJob.title,
        description: newJob.description,
        skillsRequired: skills,
        location: newJob.location || "Remote",
        salaryOrStipend: newJob.salaryOrStipend || "Unpaid",
        jobType: newJob.jobType,
        category: newJob.category || "General",
        deadline: newJob.deadline || null,
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
      const next = jobs.filter((j) => j._id !== jobId);
      setJobs(next);
      loadStats(next);
    } catch {
      alert("Failed to delete.");
    }
  }

  async function viewApplicants(jobId, title) {
    setApplicantsTitle(title);
    setShowApplicants(true);
    setLoadingApplicants(true);
    try {
      const data = await appAPI.getApplicantsForJob(jobId);
      setApplicants(data.applications);
    } catch {
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  }

  async function updateStatus(appId, status) {
    try {
      await appAPI.updateStatus(appId, status);
      setApplicants(applicants.map((a) => (a._id === appId ? { ...a, status } : a)));
      // Refresh hired count
      loadStats(jobs);
    } catch {
      alert("Failed to update status.");
    }
  }

  return (
    <>
      <section className="dashboard-header">
        <div className="container d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2><i className="bi bi-briefcase-fill me-2"></i>Welcome, {user.name}</h2>
            <p>Post openings, view applicants, and manage your hiring pipeline.</p>
          </div>
          <button className="btn btn-light btn-lg" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-circle-fill me-1"></i>Post New Job
          </button>
        </div>
      </section>

      <main className="py-4">
        <div className="container">
          {/* Stats Row */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="stat-card animate-fade-in-up">
                <div className="stat-icon icon-blue"><i className="bi bi-briefcase-fill"></i></div>
                <div>
                  <h3><AnimatedCount target={jobs.length} /></h3>
                  <p>Jobs Posted</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card animate-fade-in-up delay-1">
                <div className="stat-icon icon-green"><i className="bi bi-people-fill"></i></div>
                <div>
                  <h3><AnimatedCount target={totalApplicants} /></h3>
                  <p>Total Applicants</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card animate-fade-in-up delay-2">
                <div className="stat-icon icon-purple"><i className="bi bi-check-circle-fill"></i></div>
                <div>
                  <h3><AnimatedCount target={totalHired} /></h3>
                  <p>Hired</p>
                </div>
              </div>
            </div>
          </div>

          <h4 className="mb-3"><i className="bi bi-clipboard-data me-2 text-primary"></i>Your Job Postings</h4>

          {loading && (
            <div className="spinner-wrapper">
              <div className="spinner-border text-primary"></div>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && jobs.length === 0 && !error && (
            <div className="empty-state">
              <i className="bi bi-briefcase"></i>
              <p>You haven't posted any jobs yet.</p>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <i className="bi bi-plus-circle me-1"></i>Post Your First Job
              </button>
            </div>
          )}

          {/* Job Card Grid */}
          {jobs.length > 0 && (
            <div className="row g-4">
              {jobs.map((job, i) => {
                const skills = job.skillsRequired || [];
                return (
                  <div key={job._id} className="col-md-6 col-xl-4">
                    <div className={"job-card animate-fade-in-up delay-" + Math.min(i % 5, 5)}>
                      <div className="job-card-header">
                        <div className="company-logo">{getCompanyInitial(job.companyName)}</div>
                        <div className="flex-grow-1 min-w-0">
                          <h6 className="job-title">{job.title}</h6>
                          <p className="company-name">{job.location} · {job.salaryOrStipend}</p>
                        </div>
                        <JobTypeBadge type={job.jobType} />
                      </div>

                      <p className="job-description">
                        {job.description?.length > 100 ? job.description.substring(0, 100) + "…" : job.description}
                      </p>
                      {skills.length > 0 && (
                        <div className="skill-chips">
                          {skills.slice(0, 3).map((s) => (
                            <span key={`${job._id}-${s}`} className="skill-chip">{s}</span>
                          ))}
                        </div>
                      )}

                      <div className="job-footer">
                        <span className="deadline-text">
                          {job.deadline ? (
                            <><i className="bi bi-calendar"></i> Due {formatDate(job.deadline)}</>
                          ) : (
                            <><i className="bi bi-clock"></i> Open</>
                          )}
                        </span>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => viewApplicants(job._id, job.title)}
                          >
                            <i className="bi bi-people"></i> Applicants
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(job._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      {/* Post Job Modal */}
      {showForm && (
        <div className="custom-modal-backdrop" onClick={() => setShowForm(false)}>
          <div 
            className="custom-modal modal-lg" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-job-title"
          >
            <div className="custom-modal-header">
              <h5 id="post-job-title"><i className="bi bi-plus-circle-fill me-2 text-primary"></i>Post a New Job</h5>
              <button className="btn-close" onClick={() => setShowForm(false)} aria-label="Close"></button>
            </div>
            <div className="custom-modal-body">
              {postError && <div className="alert alert-danger">{postError}</div>}
              <form onSubmit={handlePost}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Job Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newJob.title}
                      onChange={set("title")}
                      placeholder="e.g. Frontend Developer Intern"
                      required
                    />
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
                    <textarea
                      className="form-control"
                      rows={4}
                      value={newJob.description}
                      onChange={set("description")}
                      placeholder="Describe the role, responsibilities, and requirements..."
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Skills (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newJob.skillsRaw}
                      onChange={set("skillsRaw")}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newJob.location}
                      onChange={set("location")}
                      placeholder="e.g. Bangalore"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Stipend / Salary</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newJob.salaryOrStipend}
                      onChange={set("salaryOrStipend")}
                      placeholder="15,000/month"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newJob.category}
                      onChange={set("category")}
                      placeholder="Engineering"
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Deadline</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newJob.deadline}
                      onChange={set("deadline")}
                    />
                  </div>
                </div>
                <div className="mt-4 d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={posting}>
                    {posting ? (
                      <><i className="bi bi-hourglass-split me-1"></i>Posting…</>
                    ) : (
                      <><i className="bi bi-send-fill me-1"></i>Post Job</>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Applicants Modal */}
      {showApplicants && (
        <div className="custom-modal-backdrop" onClick={() => setShowApplicants(false)}>
          <div className="custom-modal modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-header">
              <h5><i className="bi bi-people-fill me-2 text-primary"></i>Applicants for: {applicantsTitle}</h5>
              <button className="btn-close" onClick={() => setShowApplicants(false)} aria-label="Close"></button>
            </div>
            <div className="custom-modal-body">
              {loadingApplicants && (
                <div className="spinner-wrapper">
                  <div className="spinner-border text-primary"></div>
                </div>
              )}
              {!loadingApplicants && applicants.length === 0 && (
                <div className="empty-state">
                  <i className="bi bi-person-x"></i>
                  <p>No applications yet. Check back later!</p>
                </div>
              )}
              {!loadingApplicants && applicants.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Cover Letter</th>
                        <th>Status</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((app, i) => {
                        const student = app.studentId || {};
                        return (
                          <tr key={app._id}>
                            <td><strong>{i + 1}</strong></td>
                            <td>
                              <Link to={`/student/${student._id}`} className="fw-bold text-primary text-decoration-none">
                                {student.name || "—"}
                              </Link>
                            </td>
                            <td className="text-muted">{student.email || "—"}</td>
                            <td style={{ maxWidth: 280 }}>
                              <small>{app.coverLetter || <em className="text-muted">None</em>}</small>
                            </td>
                            <td><StatusBadge status={app.status} /></td>
                            <td>
                              <select
                                className="form-select form-select-sm"
                                value={app.status}
                                onChange={(e) => updateStatus(app._id, e.target.value)}
                                style={{ width: 140 }}
                              >
                                <option value="Applied">Applied</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Hired">Hired</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
