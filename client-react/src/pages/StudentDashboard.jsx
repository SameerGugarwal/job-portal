import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { appAPI } from "../services/api";
import useAuth from "../hooks/useAuth";

const typeColors = { internship: "bg-info", "full-time": "bg-success", "part-time": "bg-warning" };
const statusColors = { Applied: "status-applied", Shortlisted: "status-shortlisted", Rejected: "status-rejected", Hired: "status-hired" };

function formatDate(d) {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    appAPI.getMyApplications()
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
      <div className="dashboard-header">
        <div className="container">
          <h2><i className="bi bi-mortarboard me-2"></i>Welcome, {user.name}</h2>
          <p className="mb-0">Track your job applications</p>
        </div>
      </div>

      <div className="container">
        {/* Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4"><div className="stat-card"><p className="text-muted mb-1">Total Applied</p><h3>{total}</h3></div></div>
          <div className="col-md-4"><div className="stat-card"><p className="text-muted mb-1">Shortlisted</p><h3 className="text-success">{shortlisted}</h3></div></div>
          <div className="col-md-4"><div className="stat-card"><p className="text-muted mb-1">Hired</p><h3 style={{ color: "#6f42c1" }}>{hired}</h3></div></div>
        </div>

        {loading && <div className="spinner-wrapper"><div className="spinner-border text-primary"></div></div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && apps.length === 0 && !error && (
          <div className="empty-state">
            <i className="bi bi-inbox d-block" style={{ fontSize: "3rem" }}></i>
            <p>You haven't applied to any jobs yet.</p>
            <Link to="/" className="btn btn-primary">Browse Jobs</Link>
          </div>
        )}

        {apps.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr><th>#</th><th>Job Title</th><th>Company</th><th>Location</th><th>Type</th><th>Status</th><th>Applied On</th></tr>
              </thead>
              <tbody>
                {apps.map((app, i) => (
                  <tr key={app._id}>
                    <td>{i + 1}</td>
                    <td>{app.jobId?.title || "—"}</td>
                    <td>{app.jobId?.companyName || "—"}</td>
                    <td>{app.jobId?.location || "—"}</td>
                    <td>{app.jobId?.jobType ? <span className={"badge " + (typeColors[app.jobId.jobType] || "bg-secondary")}>{app.jobId.jobType}</span> : "—"}</td>
                    <td><span className={"badge " + (statusColors[app.status] || "")}>{app.status}</span></td>
                    <td>{formatDate(app.appliedAt || app.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
