/* ── ApplicationService — apply, view, update status ────────── */

app.factory("ApplicationService", function ($http) {
  var API = "/api/applications";

  return {
    // Student applies to a job
    apply: function (jobId, coverLetter) {
      return $http.post(API, { jobId: jobId, coverLetter: coverLetter || "" })
        .then(function (res) { return res.data; });
    },

    // Student views their own applications
    getMyApplications: function () {
      return $http.get(API + "/me")
        .then(function (res) { return res.data.applications; });
    },

    // Recruiter views applicants for a specific job
    getApplicantsForJob: function (jobId) {
      return $http.get(API + "/job/" + jobId)
        .then(function (res) { return res.data.applications; });
    },

    // Recruiter updates application status
    updateStatus: function (appId, status) {
      return $http.patch(API + "/" + appId + "/status", { status: status })
        .then(function (res) { return res.data; });
    },
  };
});
