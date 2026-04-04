/* ── LoginController — Login form ────────────────────────────── */

app.controller("LoginController", function ($scope, $rootScope, $location, AuthService) {
  // Redirect if already logged in
  if (AuthService.getUser()) {
    var user = AuthService.getUser();
    $location.path(user.role === "recruiter" ? "/dashboard" : "/");
    return;
  }

  $scope.email = "";
  $scope.password = "";
  $scope.error = "";
  $scope.submitting = false;

  $scope.login = function () {
    $scope.error = "";

    // Validation
    if (!$scope.email || !$scope.password) {
      $scope.error = "Email and password are required.";
      return;
    }

    $scope.submitting = true;

    AuthService.login($scope.email, $scope.password)
      .then(function (user) {
        $rootScope.currentUser = user;
        $location.path(user.role === "recruiter" ? "/dashboard" : "/");
      })
      .catch(function (err) {
        $scope.error = err.data ? err.data.message : "Login failed.";
        $scope.submitting = false;
      });
  };
});
