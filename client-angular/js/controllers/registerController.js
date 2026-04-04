/* ── RegisterController — Registration form ─────────────────── */

app.controller("RegisterController", function ($scope, $rootScope, $location, AuthService) {
  // Redirect if already logged in
  if (AuthService.getUser()) {
    $location.path("/");
    return;
  }

  $scope.name = "";
  $scope.email = "";
  $scope.password = "";
  $scope.confirmPassword = "";
  $scope.role = "student";
  $scope.error = "";
  $scope.submitting = false;

  $scope.register = function () {
    $scope.error = "";

    // Validation
    if (!$scope.name || $scope.name.length < 2) {
      $scope.error = "Name must be at least 2 characters.";
      return;
    }
    if (!$scope.email) {
      $scope.error = "Email is required.";
      return;
    }
    if (!$scope.password || $scope.password.length < 6) {
      $scope.error = "Password must be at least 6 characters.";
      return;
    }
    if ($scope.password !== $scope.confirmPassword) {
      $scope.error = "Passwords do not match.";
      return;
    }

    $scope.submitting = true;

    AuthService.register({
      name: $scope.name,
      email: $scope.email,
      password: $scope.password,
      role: $scope.role,
    })
      .then(function (user) {
        $rootScope.currentUser = user;
        $location.path(user.role === "recruiter" ? "/dashboard" : "/");
      })
      .catch(function (err) {
        $scope.error = err.data ? err.data.message : "Registration failed.";
        $scope.submitting = false;
      });
  };
});
