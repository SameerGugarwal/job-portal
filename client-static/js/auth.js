/* ── auth.js — Login & Register form handling ───────────────── */

$(document).ready(function () {
  // If already logged in, redirect away from auth pages
  if (isLoggedIn()) {
    var user = getUser();
    window.location.href = user.role === "recruiter" ? "recruiter-dashboard.html" : "jobs.html";
    return;
  }

  /* ========== LOGIN FORM ========== */
  $("#login-form").on("submit", function (e) {
    e.preventDefault();

    // Clear previous errors
    $(".is-invalid").removeClass("is-invalid");

    var email = $("#login-email").val().trim();
    var password = $("#login-password").val().trim();

    // --- Validation ---
    var valid = true;

    if (!email) {
      $("#login-email").addClass("is-invalid");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $("#login-email").addClass("is-invalid");
      $("#login-email-feedback").text("Enter a valid email address.");
      valid = false;
    }

    if (!password) {
      $("#login-password").addClass("is-invalid");
      valid = false;
    }

    if (!valid) return;

    // --- AJAX call ---
    var $btn = $("#login-btn");
    $btn.prop("disabled", true).text("Logging in...");

    $.ajax({
      url: API + "/auth/login",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ email: email, password: password }),
      success: function (data) {
        saveUser(data.user);
        showAlert("Login successful! Welcome back, " + data.user.name, "success");

        // Redirect based on role
        setTimeout(function () {
          if (data.user.role === "recruiter") {
            window.location.href = "recruiter-dashboard.html";
          } else {
            window.location.href = "jobs.html";
          }
        }, 800);
      },
      error: function (xhr) {
        var msg = xhr.responseJSON ? xhr.responseJSON.message : "Login failed. Try again.";
        showAlert(msg, "danger");
        $btn.prop("disabled", false).text("Login");
      },
    });
  });

  /* ========== REGISTER FORM ========== */
  $("#register-form").on("submit", function (e) {
    e.preventDefault();

    // Clear previous errors
    $(".is-invalid").removeClass("is-invalid");

    var name = $("#reg-name").val().trim();
    var email = $("#reg-email").val().trim();
    var password = $("#reg-password").val().trim();
    var confirmPassword = $("#reg-confirm-password").val().trim();
    var role = $("input[name='role']:checked").val();

    // --- Validation ---
    var valid = true;

    if (!name || name.length < 2) {
      $("#reg-name").addClass("is-invalid");
      valid = false;
    }

    if (!email) {
      $("#reg-email").addClass("is-invalid");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $("#reg-email").addClass("is-invalid");
      $("#reg-email-feedback").text("Enter a valid email address.");
      valid = false;
    }

    if (!password || password.length < 6) {
      $("#reg-password").addClass("is-invalid");
      valid = false;
    }

    if (password !== confirmPassword) {
      $("#reg-confirm-password").addClass("is-invalid");
      valid = false;
    }

    if (!role) {
      showAlert("Please select a role.", "warning");
      valid = false;
    }

    if (!valid) return;

    // --- AJAX call ---
    var $btn = $("#register-btn");
    $btn.prop("disabled", true).text("Registering...");

    $.ajax({
      url: API + "/auth/register",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ name: name, email: email, password: password, role: role }),
      success: function (data) {
        saveUser(data.user);
        showAlert("Registered successfully! Welcome, " + data.user.name, "success");

        setTimeout(function () {
          if (data.user.role === "recruiter") {
            window.location.href = "recruiter-dashboard.html";
          } else {
            window.location.href = "jobs.html";
          }
        }, 800);
      },
      error: function (xhr) {
        var msg = xhr.responseJSON ? xhr.responseJSON.message : "Registration failed. Try again.";
        showAlert(msg, "danger");
        $btn.prop("disabled", false).text("Register");
      },
    });
  });

  // --- Toggle password visibility (jQuery effect) ---
  $(".toggle-password").on("click", function () {
    var input = $($(this).data("target"));
    var icon = $(this).find("i");

    if (input.attr("type") === "password") {
      input.attr("type", "text");
      icon.removeClass("bi-eye").addClass("bi-eye-slash");
    } else {
      input.attr("type", "password");
      icon.removeClass("bi-eye-slash").addClass("bi-eye");
    }
  });
});
