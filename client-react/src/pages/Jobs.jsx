import { useState, useEffect } from "react";
import { jobAPI } from "../services/api";
import JobCard from "../components/JobCard";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    const params = {};
    if (search) params.search = search;
    if (location) params.location = location;
    if (jobType) params.jobType = jobType;

    try {
      const data = await jobAPI.getAll(params);
      setJobs(data.jobs);
    } catch {
      setError("Failed to load jobs. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadJobs();
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    // Reload with empty filters after state updates
    setTimeout(() => loadJobs(), 0);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Browse Jobs</h2>

      {/* Filter Bar */}
      <div className="filter-bar">
        <form className="row g-3 align-items-end" onSubmit={handleFilter}>
          <div className="col-md-4">
            <label className="form-label">Search</label>
            <input type="text" className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Job title or keyword..." />
          </div>
          <div className="col-md-3">
            <label className="form-label">Location</label>
            <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bangalore" />
          </div>
          <div className="col-md-3">
            <label className="form-label">Job Type</label>
            <select className="form-select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
              <option value="">All Types</option>
              <option value="internship">Internship</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
            </select>
          </div>
          <div className="col-md-2 d-flex gap-2">
            <button type="submit" className="btn btn-primary flex-grow-1"><i className="bi bi-search"></i> Search</button>
            <button type="button" className="btn btn-outline-secondary" onClick={clearFilters}><i className="bi bi-x-lg"></i></button>
          </div>
        </form>
      </div>

      {!loading && <p className="text-muted mb-3">{jobs.length} job{jobs.length !== 1 ? "s" : ""} found</p>}

      {loading && (
        <div className="spinner-wrapper"><div className="spinner-border text-primary"></div></div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && jobs.length === 0 && !error && (
        <div className="empty-state">
          <i className="bi bi-search d-block" style={{ fontSize: "3rem" }}></i>
          <p>No jobs match your filters.</p>
        </div>
      )}

      <div className="row g-4">
        {jobs.map((job) => (
          <div key={job._id} className="col-md-6 col-lg-4">
            <JobCard job={job} />
          </div>
        ))}
      </div>
    </div>
  );
}
