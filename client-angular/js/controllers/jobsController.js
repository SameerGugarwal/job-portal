/* ── JobsController — Job listing with filters ──────────────── */

app.controller("JobsController", function ($scope, JobService) {
  // Filter model
  $scope.filters = {
    search: "",
    location: "",
    jobType: "",
  };

  $scope.jobs = [];
  $scope.loading = true;
  $scope.error = "";

  // Load jobs (called on init and on filter submit)
  $scope.loadJobs = function () {
    $scope.loading = true;
    $scope.error = "";

    // Build filter params — only include non-empty values
    var params = {};
    if ($scope.filters.search)   params.search   = $scope.filters.search;
    if ($scope.filters.location) params.location  = $scope.filters.location;
    if ($scope.filters.jobType)  params.jobType   = $scope.filters.jobType;

    JobService.getAll(params)
      .then(function (jobs) {
        $scope.jobs = jobs;
        $scope.loading = false;
      })
      .catch(function () {
        $scope.error = "Failed to load jobs. Is the server running?";
        $scope.loading = false;
      });
  };

  // Clear all filters
  $scope.clearFilters = function () {
    $scope.filters = { search: "", location: "", jobType: "" };
    $scope.loadJobs();
  };

  // Helper: badge class for job type
  $scope.jobTypeClass = function (type) {
    var map = { internship: "bg-info", "full-time": "bg-success", "part-time": "bg-warning" };
    return map[type] || "bg-secondary";
  };

  // Initial load
  $scope.loadJobs();
});
