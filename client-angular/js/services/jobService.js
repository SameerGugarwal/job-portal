/* ── JobService — CRUD for jobs ──────────────────────────────── */

app.factory("JobService", function ($http) {
  var API = "/api/jobs";

  return {
    // Get all jobs with optional filters
    getAll: function (filters) {
      return $http.get(API, { params: filters || {} })
        .then(function (res) { return res.data.jobs; });
    },

    // Get single job by ID
    getById: function (id) {
      return $http.get(API + "/" + id)
        .then(function (res) { return res.data.job; });
    },

    // Get recruiter's own jobs
    getMyJobs: function () {
      return $http.get(API + "/recruiter/mine")
        .then(function (res) { return res.data.jobs; });
    },

    // Create a new job (recruiter only)
    create: function (jobData) {
      return $http.post(API, jobData)
        .then(function (res) { return res.data; });
    },

    // Delete a job (recruiter only)
    remove: function (id) {
      return $http.delete(API + "/" + id)
        .then(function (res) { return res.data; });
    },
  };
});
