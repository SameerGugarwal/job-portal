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

export const appAPI = {
  apply: (body) => request("POST", "/applications", body),
  getMyApplications: () => request("GET", "/applications/me"),
  getApplicantsForJob: (jobId) => request("GET", "/applications/job/" + jobId),
  updateStatus: (id, status) => request("PATCH", "/applications/" + id + "/status", { status }),
};

export const profileAPI = {
  get: () => request("GET", "/profile"),
  getStudentById: (id) => request("GET", "/profile/student/" + id),
  update: (body) => request("PUT", "/profile", body),
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    
    // We cannot use the standard request() here because it sets Content-Type to application/json
    const res = await fetch(API + "/profile/resume", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || "Upload failed");
      err.status = res.status;
      throw err;
    }
    return data;
  },
  uploadProfilePic: async (file) => {
    const formData = new FormData();
    formData.append("profilePic", file);
    
    const res = await fetch(API + "/profile/picture", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || "Upload failed");
      err.status = res.status;
      throw err;
    }
    return data;
  }
};
