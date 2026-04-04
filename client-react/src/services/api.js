/* ── Centralized API helper ──────────────────────────────────── */

const API = "/api";

async function request(method, path, body) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API + path, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    throw err;
  }

  return data;
}

// Auth
export const authAPI = {
  register: (body) => request("POST", "/auth/register", body),
  login: (body) => request("POST", "/auth/login", body),
  logout: () => request("POST", "/auth/logout"),
  me: () => request("GET", "/auth/me"),
};

// Jobs
export const jobAPI = {
  getAll: (params) => {
    const query = new URLSearchParams(params).toString();
    return request("GET", "/jobs" + (query ? "?" + query : ""));
  },
  getById: (id) => request("GET", "/jobs/" + id),
  getMyJobs: () => request("GET", "/jobs/recruiter/mine"),
  create: (body) => request("POST", "/jobs", body),
  remove: (id) => request("DELETE", "/jobs/" + id),
};

// Applications
export const appAPI = {
  apply: (body) => request("POST", "/applications", body),
  getMyApplications: () => request("GET", "/applications/me"),
  getApplicantsForJob: (jobId) => request("GET", "/applications/job/" + jobId),
  updateStatus: (id, status) => request("PATCH", "/applications/" + id + "/status", { status }),
};
