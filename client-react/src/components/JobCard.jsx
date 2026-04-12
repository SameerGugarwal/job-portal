/* ── JobCard — company logo + meta + skill chips ─────────────── */

import { Link } from "react-router-dom";

function getCompanyInitial(name) {
  if (!name) return "J";
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : "J";
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

export default function JobCard({ job, index = 0 }) {
  const skills = job.skillsRequired || [];
  const delay = Math.min(index % 5, 5);

  return (
    <div className={"job-card animate-fade-in-up delay-" + delay}>
      <div className="job-card-header">
        <div className="company-logo">{getCompanyInitial(job.companyName)}</div>
        <div className="flex-grow-1 min-w-0">
          <h6 className="job-title">{job.title}</h6>
          <p className="company-name">{job.companyName || "Company"}</p>
        </div>
        <JobTypeBadge type={job.jobType} />
      </div>

      <div className="meta-row">
        <span><i className="bi bi-geo-alt"></i> {job.location || "Remote"}</span>
        <span><i className="bi bi-cash-coin"></i> {job.salaryOrStipend || "—"}</span>
      </div>

      <p className="job-description">
        {job.description?.length > 120
          ? job.description.substring(0, 120) + "…"
          : job.description}
      </p>

      {skills.length > 0 && (
        <div className="skill-chips">
          {skills.slice(0, 4).map((s) => (
            <span key={s} className="skill-chip">{s}</span>
          ))}
          {skills.length > 4 && (
            <span className="skill-chip skill-chip-more">+{skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="job-footer">
        <span className="deadline-text">
          {job.deadline ? (
            <>
              <i className="bi bi-calendar"></i> Due {formatDate(job.deadline)}
            </>
          ) : (
            <>
              <i className="bi bi-clock"></i> Open
            </>
          )}
        </span>
        <Link to={"/jobs/" + job._id} className="btn btn-primary btn-sm">
          View Details <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
}
