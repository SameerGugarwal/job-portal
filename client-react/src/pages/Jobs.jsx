/* ── Jobs — dashboard header + sidebar filters + card grid ──── */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { jobAPI } from "../services/api";
import JobCard from "../components/JobCard";

export default function Jobs() {
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter state — pre-fill from URL query params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [jobType, setJobType] = useState(searchParams.get("jobType") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");

  const loadJobs = async (filters) => {
    setLoading(true);
    setError("");

    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.location) params.location = filters.location;
    if (filters.jobType) params.jobType = filters.jobType;
    if (filters.category) params.category = filters.category;

    try {
      const data = await jobAPI.getAll(params);
      setJobs(data.jobs);
    } catch {
      setError("Failed to load jobs. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs({ search, location, jobType, category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadJobs({ search, location, jobType, category });
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    setCategory("");
    loadJobs({});
  };

  return (
    <>
      <section className="dashboard-header">
        <div className="container">
          <div>
            <h2><i className="bi bi-search me-2"></i>Browse Opportunities</h2>
            <p>Discover internships and full-time roles from top companies.</p>
          </div>
        </div>
      </section>

      <div className="container py-4">
        <div className="row g-4">
          {/* Sidebar Filters */}
          <aside className="col-lg-3">
            <div className="filter-sidebar">
              <h5><i className="bi bi-funnel-fill"></i>Filters</h5>
              <form onSubmit={handleFilter}>
                <div className="mb-3">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Job title or keyword"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Job Type</label>
                  <select
                    className="form-select"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="internship">Internship</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Engineering"
                  />
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-search me-1"></i>Apply Filters
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={clearFilters}>
                    <i className="bi bi-x-lg me-1"></i>Clear
                  </button>
                </div>
              </form>
            </div>
          </aside>

          {/* Results */}
          <div className="col-lg-9">
            {!loading && (
              <div className="results-header">
                <p className="results-count mb-0">
                  <strong>{jobs.length}</strong> job{jobs.length !== 1 ? "s" : ""} found
                </p>
              </div>
            )}

            {loading && (
              <div className="spinner-wrapper">
                <div className="spinner-border text-primary"></div>
              </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && jobs.length === 0 && !error && (
              <div className="empty-state">
                <i className="bi bi-search"></i>
                <p>No jobs match your filters. Try broadening your search.</p>
              </div>
            )}

            <div className="row g-4">
              {jobs.map((job, i) => (
                <div key={job._id} className="col-md-6 col-xl-4">
                  <JobCard job={job} index={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
