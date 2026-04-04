/* ── AuthService — handles login, register, logout, session ── */

app.factory("AuthService", function ($http, $q) {
  var API = "/api/auth";

  function saveUser(user) {
    sessionStorage.setItem("user", JSON.stringify(user));
  }

  function getUser() {
    var raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  }

  function clearUser() {
    sessionStorage.removeItem("user");
  }

  return {
    getUser: getUser,

    login: function (email, password) {
      return $http.post(API + "/login", { email: email, password: password })
        .then(function (res) {
          saveUser(res.data.user);
          return res.data.user;
        });
    },

    register: function (data) {
      return $http.post(API + "/register", data)
        .then(function (res) {
          saveUser(res.data.user);
          return res.data.user;
        });
    },

    logout: function () {
      return $http.post(API + "/logout")
        .then(function () {
          clearUser();
        })
        .catch(function () {
          clearUser();
        });
    },

    verifySession: function () {
      var deferred = $q.defer();
      var localUser = getUser();

      if (!localUser) {
        deferred.resolve(null);
        return deferred.promise;
      }

      $http.get(API + "/me")
        .then(function (res) {
          saveUser(res.data.user);
          deferred.resolve(res.data.user);
        })
        .catch(function () {
          clearUser();
          deferred.resolve(null);
        });

      return deferred.promise;
    },
  };
});
