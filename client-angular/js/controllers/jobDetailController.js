/* ── JobDetailController — Single job + apply ───────────────── */

app.controller("JobDetailController", function ($scope, $routeParams, $rootScope, JobService, ApplicationService) {
  $scope.job = null;
  $scope.loading = true;
  $scope.error = "";
  $scope.coverLetter = "";
  $scope.applying = false;
  $scope.applied = false;

  // Load job details
  JobService.getById($routeParams.id)
    .then(function (job) {
      $scope.job = job;
      $scope.loading = false;
      $scope.isExpired = job.deadline && new Date() > new Date(job.deadline);
    })
    .catch(function () {
      $scope.error = "Job not found.";
      $scope.loading = false;
    });

  // Apply to job
  $scope.applyToJob = function () {
    $scope.applying = true;

    ApplicationService.apply($routeParams.id, $scope.coverLetter)
      .then(function () {
        $scope.applied = true;
        $scope.applying = false;
      })
      .catch(function (err) {
        var msg = err.data ? err.data.message : "Failed to apply.";
        $scope.applyError = msg;
        $scope.applying = false;
      });
  };

  // Helpers
  $scope.jobTypeClass = function (type) {
    var map = { internship: "bg-info", "full-time": "bg-success", "part-time": "bg-warning" };
    return map[type] || "bg-secondary";
  };
});
