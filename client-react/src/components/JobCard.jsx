import { Link } from "react-router-dom";

const typeColors = { internship: "bg-info", "full-time": "bg-success", "part-time": "bg-warning" };

export default function JobCard({ job }) {
  return (
    <div className="card job-card p-3 h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h5 className="mb-0">{job.title}</h5>
        <span className={"badge " + (typeColors[job.jobType] || "bg-secondary")}>{job.jobType}</span>
      </div>
      <p className="text-muted mb-1"><i className="bi bi-building me-1"></i>{job.companyName || "Company"}</p>
      <p className="mb-1"><i className="bi bi-geo-alt me-1"></i>{job.location}</p>
      <p className="mb-1"><i className="bi bi-cash me-1"></i>{job.salaryOrStipend}</p>

      {job.skillsRequired?.length > 0 && (
        <div className="mb-2">
          {job.skillsRequired.map((s) => (
            <span key={s} className="badge bg-light text-dark border me-1 mb-1">{s}</span>
          ))}
        </div>
      )}

      <p className="text-muted small flex-grow-1">{job.description?.substring(0, 120)}...</p>

      {job.deadline && (
        <p className="small text-muted">
          <i className="bi bi-calendar me-1"></i>Deadline: {new Date(job.deadline).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
        </p>
      )}

      <Link to={"/jobs/" + job._id} className="btn btn-outline-primary btn-sm mt-auto">View Details</Link>
    </div>
  );
}
