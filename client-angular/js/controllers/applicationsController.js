/* ── ApplicationsController — Student's applied jobs ─────────── */

app.controller("ApplicationsController", function ($scope, $location, AuthService, ApplicationService) {
  var user = AuthService.getUser();

  // Guard: must be logged in as student
  if (!user) {
    $location.path("/login");
    return;
  }
  if (user.role !== "student") {
    $location.path("/dashboard");
    return;
  }

  $scope.userName = user.name;
  $scope.applications = [];
  $scope.loading = true;
  $scope.error = "";

  // Stats
  $scope.stats = { total: 0, shortlisted: 0, hired: 0 };

  ApplicationService.getMyApplications()
    .then(function (apps) {
      $scope.applications = apps;
      $scope.loading = false;

      // Calculate stats
      $scope.stats.total = apps.length;
      $scope.stats.shortlisted = apps.filter(function (a) { return a.status === "Shortlisted"; }).length;
      $scope.stats.hired = apps.filter(function (a) { return a.status === "Hired"; }).length;
    })
    .catch(function () {
      $scope.error = "Failed to load applications.";
      $scope.loading = false;
    });

  // Status badge class helper
  $scope.statusClass = function (status) {
    var map = {
      Applied: "status-applied",
      Shortlisted: "status-shortlisted",
      Rejected: "status-rejected",
      Hired: "status-hired",
    };
    return map[status] || "";
  };
});
