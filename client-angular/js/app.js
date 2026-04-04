/* ── AngularJS App — Module + Route Config ──────────────────── */

var app = angular.module("jobPortalApp", ["ngRoute"]);

/* ---------- Route Configuration ---------- */
app.config(function ($routeProvider, $locationProvider) {
  $routeProvider
    .when("/", {
      templateUrl: "views/jobs.html",
      controller: "JobsController",
    })
    .when("/jobs/:id", {
      templateUrl: "views/job-detail.html",
      controller: "JobDetailController",
    })
    .when("/login", {
      templateUrl: "views/login.html",
      controller: "LoginController",
    })
    .when("/register", {
      templateUrl: "views/register.html",
      controller: "RegisterController",
    })
    .when("/applications", {
      templateUrl: "views/applications.html",
      controller: "ApplicationsController",
    })
    .when("/dashboard", {
      templateUrl: "views/dashboard.html",
      controller: "DashboardController",
    })
    .otherwise({ redirectTo: "/" });

  // Use hashbang mode (#!/) — works without server-side routing
  $locationProvider.hashPrefix("");
});

/* ---------- Global Run Block ---------- */
app.run(function ($rootScope, AuthService) {
  // Make auth state available to all templates
  $rootScope.currentUser = AuthService.getUser();

  // Verify server session on app start
  AuthService.verifySession().then(function (user) {
    $rootScope.currentUser = user;
  });

  // Update currentUser on route change (in case login/logout happened)
  $rootScope.$on("$routeChangeStart", function () {
    $rootScope.currentUser = AuthService.getUser();
  });
});
