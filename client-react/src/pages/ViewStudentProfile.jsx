import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { profileAPI } from "../services/api";
import ProfileSection from "../components/ProfileSection";

function NA() {
  return <span className="text-muted fst-italic">NA</span>;
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export default function ViewStudentProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await profileAPI.getStudentById(id);
        setStudent(data);
      } catch (err) {
        setError(err.message || "Failed to load student profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <Link to="/dashboard" className="btn btn-outline-primary mt-2">← Back to Dashboard</Link>
      </div>
    );
  }

  const sp = student.studentProfile || {};
  const contact = sp.contactInfo || {};
  const prefs = sp.careerPreferences || {};
  const education = Array.isArray(sp.education) ? sp.education : [];
  const skills = Array.isArray(sp.skills) ? sp.skills : [];
  const languages = Array.isArray(sp.languages) ? sp.languages : [];
  const internships = Array.isArray(sp.internships) ? sp.internships : [];
  const projects = Array.isArray(sp.projects) ? sp.projects : [];
  const achievements = Array.isArray(sp.achievements) ? sp.achievements : [];
  const resume = sp.resume || {};

  return (
    <div className="bg-light min-vh-100">
      {/* Header banner */}
      <div className="bg-primary" style={{ height: "160px" }}></div>

      <div className="container" style={{ marginTop: "-80px" }}>
        <Link to="/dashboard" className="btn btn-light btn-sm mb-3 shadow-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to Dashboard
        </Link>

        {/* Top profile card */}
        <div className="card shadow-sm border-0 rounded-4 mb-4 overflow-hidden">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4">
              {/* Avatar */}
              {sp.profilePic ? (
                <img
                  src={sp.profilePic}
                  alt={student.name}
                  className="rounded-circle shadow"
                  style={{ width: "110px", height: "110px", objectFit: "cover", border: "4px solid white" }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center shadow"
                  style={{ width: "110px", height: "110px", fontSize: "2.8rem", flexShrink: 0 }}
                >
                  {student.name?.[0]?.toUpperCase()}
                </div>
              )}

              <div className="text-center text-md-start">
                <h2 className="fw-bold mb-1">{student.name}</h2>
                <p className="text-muted mb-2">
                  <i className="bi bi-envelope me-2"></i>{student.email}
                </p>
                <div className="d-flex flex-wrap gap-3 text-muted small justify-content-center justify-content-md-start">
                  <span><i className="bi bi-geo-alt me-1"></i>{contact.location || <NA />}</span>
                  <span><i className="bi bi-phone me-1"></i>{contact.phone || <NA />}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Left sidebar quick info */}
          <div className="col-lg-4 mb-4">
            {/* Resume Card */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3"><i className="bi bi-file-earmark-text me-2 text-primary"></i>Resume</h5>
                {resume.url ? (
                  <div className="d-flex flex-column align-items-center text-center">
                    <i className="bi bi-file-earmark-pdf fs-1 text-danger mb-2"></i>
                    <p className="mb-2 fw-medium">{resume.filename || "Resume"}</p>
                    <a
                      href={resume.url}
                      download={resume.filename || "resume"}
                      className="btn btn-primary btn-sm w-100"
                    >
                      <i className="bi bi-download me-1"></i> Download Resume
                    </a>
                    <a
                      href={resume.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-secondary btn-sm w-100 mt-2"
                    >
                      <i className="bi bi-eye me-1"></i> View Resume
                    </a>
                  </div>
                ) : (
                  <div className="text-center text-muted py-3">
                    <i className="bi bi-file-earmark-x fs-1 mb-2 d-block"></i>
                    <p className="mb-0">No resume uploaded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Career Preferences Card */}
            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3"><i className="bi bi-bullseye me-2 text-primary"></i>Career Preferences</h5>
                <div className="mb-2">
                  <small className="text-muted text-uppercase fw-bold">Preferred Job Type</small>
                  <div>{prefs.preferredJobType || <NA />}</div>
                </div>
                <div className="mb-2">
                  <small className="text-muted text-uppercase fw-bold">Availability</small>
                  <div>{prefs.availability || <NA />}</div>
                </div>
                {prefs.preferredLocations?.length > 0 && (
                  <div>
                    <small className="text-muted text-uppercase fw-bold">Preferred Locations</small>
                    <div>{prefs.preferredLocations.join(", ")}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3"><i className="bi bi-link-45deg me-2 text-primary"></i>Links</h5>
                <div className="mb-2">
                  <small className="text-muted text-uppercase fw-bold">GitHub</small>
                  <div>{sp.github ? <a href={sp.github} target="_blank" rel="noreferrer">{sp.github}</a> : <NA />}</div>
                </div>
                <div>
                  <small className="text-muted text-uppercase fw-bold">LinkedIn</small>
                  <div>{sp.linkedin ? <a href={sp.linkedin} target="_blank" rel="noreferrer">{sp.linkedin}</a> : <NA />}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right main content */}
          <div className="col-lg-8">
            {/* Profile Summary */}
            <ProfileSection title="Profile Summary">
              <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                {sp.profileSummary || <NA />}
              </p>
            </ProfileSection>

            {/* Key Skills */}
            <ProfileSection title="Key Skills">
              {skills.length > 0 ? (
                <div className="d-flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span key={i} className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-normal">{s}</span>
                  ))}
                </div>
              ) : <NA />}
            </ProfileSection>

            {/* Education */}
            <ProfileSection title="Education">
              {education.length > 0 ? (
                education.map((edu, i) => (
                  <div key={i} className={`mb-3 ${i < education.length - 1 ? 'pb-3 border-bottom' : ''}`}>
                    <h6 className="fw-bold mb-1">{edu.qualification || "Qualification"} {edu.specialization ? `in ${edu.specialization}` : ""}</h6>
                    <div className="text-muted">{edu.institute || <NA />}</div>
                    <div className="text-muted small mt-1">
                      {edu.startYear || "?"} - {edu.endYear || "?"} {edu.score ? `| Score: ${edu.score}` : ""}
                    </div>
                  </div>
                ))
              ) : <NA />}
            </ProfileSection>

            {/* Languages */}
            <ProfileSection title="Languages">
              {languages.length > 0 ? (
                <div className="d-flex flex-wrap gap-3">
                  {languages.map((l, i) => (
                    <div key={i} className="border rounded-3 p-2 px-3">
                      <strong>{l.name || "Language"}</strong>
                      <small className="text-muted ms-2">{l.proficiency || ""}</small>
                    </div>
                  ))}
                </div>
              ) : <NA />}
            </ProfileSection>

            {/* Internships */}
            <ProfileSection title="Internships">
              {internships.length > 0 ? (
                internships.map((intern, i) => (
                  <div key={i} className={`mb-3 ${i < internships.length - 1 ? 'pb-3 border-bottom' : ''}`}>
                    <h6 className="fw-bold mb-0">{intern.role || "Role"}</h6>
                    <div className="text-primary small fw-medium">{intern.companyName || <NA />}</div>
                    <div className="text-muted small">
                      {formatDate(intern.startDate) || "?"} — {formatDate(intern.endDate) || "Present"}
                    </div>
                    {intern.description && <p className="text-muted small mt-1 mb-0">{intern.description}</p>}
                  </div>
                ))
              ) : <NA />}
            </ProfileSection>

            {/* Projects */}
            <ProfileSection title="Projects">
              {projects.length > 0 ? (
                projects.map((proj, i) => (
                  <div key={i} className={`mb-3 ${i < projects.length - 1 ? 'pb-3 border-bottom' : ''}`}>
                    <h6 className="fw-bold mb-1">{proj.title || "Project"}</h6>
                    {proj.techStack?.length > 0 && (
                      <div className="d-flex flex-wrap gap-1 mb-1">
                        {proj.techStack.map((t, j) => (
                          <span key={j} className="badge bg-light text-dark border small">{t}</span>
                        ))}
                      </div>
                    )}
                    {proj.duration && <div className="text-muted small">Duration: {proj.duration}</div>}
                    {proj.description && <p className="text-muted small mt-1 mb-1">{proj.description}</p>}
                    {proj.githubLink && (
                      <a href={proj.githubLink} target="_blank" rel="noreferrer" className="small">
                        <i className="bi bi-github me-1"></i>View on GitHub
                      </a>
                    )}
                  </div>
                ))
              ) : <NA />}
            </ProfileSection>

            {/* Achievements */}
            <ProfileSection title="Achievements">
              {achievements.length > 0 ? (
                <ul className="mb-0">
                  {achievements.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              ) : <NA />}
            </ProfileSection>
          </div>
        </div>
      </div>
    </div>
  );
}
