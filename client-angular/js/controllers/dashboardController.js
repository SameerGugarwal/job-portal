/* ── DashboardController — Recruiter dashboard ──────────────── */

app.controller("DashboardController", function ($scope, $location, AuthService, JobService, ApplicationService) {
  var user = AuthService.getUser();

  // Guard: must be logged in as recruiter
  if (!user) {
    $location.path("/login");
    return;
  }
  if (user.role !== "recruiter") {
    $location.path("/applications");
    return;
  }

  $scope.userName = user.name;
  $scope.jobs = [];
  $scope.loading = true;
  $scope.error = "";

  // Post job form model
  $scope.newJob = {
    title: "",
    description: "",
    skillsRaw: "",
    location: "",
    salaryOrStipend: "",
    jobType: "internship",
    category: "",
    deadline: "",
  };
  $scope.posting = false;
  $scope.showPostForm = false;

  // Applicants modal state
  $scope.applicants = [];
  $scope.applicantsTitle = "";
  $scope.loadingApplicants = false;
  $scope.showApplicants = false;

  // Load recruiter's jobs
  $scope.loadJobs = function () {
    $scope.loading = true;
    JobService.getMyJobs()
      .then(function (jobs) {
        $scope.jobs = jobs;
        $scope.loading = false;
      })
      .catch(function () {
        $scope.error = "Failed to load your jobs.";
        $scope.loading = false;
      });
  };

  // Post a new job
  $scope.postJob = function () {
    if (!$scope.newJob.title || !$scope.newJob.description) {
      $scope.postError = "Title and description are required.";
      return;
    }

    $scope.posting = true;
    $scope.postError = "";

    var skills = $scope.newJob.skillsRaw
      ? $scope.newJob.skillsRaw.split(",").map(function (s) { return s.trim(); })
      : [];

    JobService.create({
      title: $scope.newJob.title,
      description: $scope.newJob.description,
      skillsRequired: skills,
      location: $scope.newJob.location || "Remote",
      salaryOrStipend: $scope.newJob.salaryOrStipend || "Unpaid",
      jobType: $scope.newJob.jobType,
      category: $scope.newJob.category || "General",
      deadline: $scope.newJob.deadline || null,
    })
      .then(function () {
        $scope.posting = false;
        $scope.showPostForm = false;
        // Reset form
        $scope.newJob = { title: "", description: "", skillsRaw: "", location: "", salaryOrStipend: "", jobType: "internship", category: "", deadline: "" };
        $scope.loadJobs();
      })
      .catch(function (err) {
        $scope.postError = err.data ? err.data.message : "Failed to post job.";
        $scope.posting = false;
      });
  };

  // Delete a job
  $scope.deleteJob = function (jobId) {
    if (!confirm("Are you sure you want to delete this job?")) return;

    JobService.remove(jobId)
      .then(function () {
        $scope.jobs = $scope.jobs.filter(function (j) { return j._id !== jobId; });
      })
      .catch(function () {
        alert("Failed to delete job.");
      });
  };

  // View applicants for a job
  $scope.viewApplicants = function (jobId, jobTitle) {
    $scope.applicantsTitle = jobTitle;
    $scope.applicants = [];
    $scope.loadingApplicants = true;
    $scope.showApplicants = true;

    ApplicationService.getApplicantsForJob(jobId)
      .then(function (apps) {
        $scope.applicants = apps;
        $scope.loadingApplicants = false;
      })
      .catch(function () {
        $scope.loadingApplicants = false;
      });
  };

  // Update application status
  $scope.updateStatus = function (app) {
    ApplicationService.updateStatus(app._id, app.status)
      .then(function () {
        // Status updated — AngularJS auto-updates the view via binding
      })
      .catch(function () {
        alert("Failed to update status.");
      });
  };

  // Close applicants panel
  $scope.closeApplicants = function () {
    $scope.showApplicants = false;
  };

  // Status badge class
  $scope.statusClass = function (status) {
    var map = { Applied: "status-applied", Shortlisted: "status-shortlisted", Rejected: "status-rejected", Hired: "status-hired" };
    return map[status] || "";
  };

  // Job type badge class
  $scope.jobTypeClass = function (type) {
    var map = { internship: "bg-info", "full-time": "bg-success", "part-time": "bg-warning" };
    return map[type] || "bg-secondary";
  };

  // Initial load
  $scope.loadJobs();
});
