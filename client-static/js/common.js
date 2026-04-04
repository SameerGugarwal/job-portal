/* ── common.js — Shared utilities for all pages ─────────────── */

// Relative URL — works because static files are served from the same Express server
const API = "/api";

/* ---------- Session helpers (uses sessionStorage) ---------- */
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

function isLoggedIn() {
  return getUser() !== null;
}

/* ---------- Show floating alert ---------- */
function showAlert(message, type) {
  // type: "success", "danger", "warning", "info"
  var id = "alert-" + Date.now();
  var html =
    '<div id="' + id + '" class="alert alert-' + type + ' alert-float alert-dismissible fade show">' +
    message +
    '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
    "</div>";

  $("body").append(html);

  // Auto-remove after 4 seconds with jQuery fadeOut
  setTimeout(function () {
    $("#" + id).fadeOut(400, function () {
      $(this).remove();
    });
  }, 4000);
}

/* ---------- Global AJAX error handler ---------- */
// Catches 401 (session expired) on ANY AJAX call across the app
$(document).ajaxError(function (event, xhr) {
  if (xhr.status === 401 && isLoggedIn()) {
    // Server session expired but client still thinks user is logged in
    clearUser();
    showAlert("Session expired. Please log in again.", "warning");
    setTimeout(function () {
      window.location.href = "login.html";
    }, 1200);
  }

  if (xhr.status === 0) {
    // Network error — server unreachable
    showAlert("Cannot reach server. Make sure the backend is running on port 5002.", "danger");
  }
});

/* ---------- Verify session on page load ---------- */
// Syncs client sessionStorage with actual server session
function verifySession(callback) {
  if (!isLoggedIn()) {
    // No local session — nothing to verify
    if (callback) callback(false);
    return;
  }

  $.ajax({
    url: API + "/auth/me",
    method: "GET",

    success: function (data) {
      // Server session is alive — update local data in case it changed
      saveUser(data.user);
      if (callback) callback(true);
    },
    error: function () {
      // Server session is dead — clear stale local data
      clearUser();
      renderNavbar(); // re-render navbar to show Login/Register
      if (callback) callback(false);
    },
  });
}

/* ---------- Render Navbar ---------- */
function renderNavbar() {
  var user = getUser();
  var nav = "";

  nav += '<nav class="navbar navbar-expand-lg navbar-dark bg-dark">';
  nav += '  <div class="container">';
  nav += '    <a class="navbar-brand" href="index.html">JobPortal</a>';
  nav += '    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">';
  nav += '      <span class="navbar-toggler-icon"></span>';
  nav += "    </button>";
  nav += '    <div class="collapse navbar-collapse" id="navbarNav">';
  nav += '      <ul class="navbar-nav me-auto">';
  nav += '        <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>';
  nav += '        <li class="nav-item"><a class="nav-link" href="jobs.html">Jobs</a></li>';

  if (user && user.role === "student") {
    nav += '        <li class="nav-item"><a class="nav-link" href="student-dashboard.html">My Applications</a></li>';
  }
  if (user && user.role === "recruiter") {
    nav += '        <li class="nav-item"><a class="nav-link" href="recruiter-dashboard.html">Dashboard</a></li>';
  }

  nav += "      </ul>";
  nav += '      <ul class="navbar-nav">';

  if (user) {
    nav += '        <li class="nav-item">';
    nav += '          <span class="nav-link text-light">Hi, ' + user.name + " (" + user.role + ")</span>";
    nav += "        </li>";
    nav += '        <li class="nav-item">';
    nav += '          <a class="nav-link btn btn-outline-light btn-sm ms-2 px-3" href="#" id="logout-btn">Logout</a>';
    nav += "        </li>";
  } else {
    nav += '        <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>';
    nav += '        <li class="nav-item"><a class="nav-link btn btn-primary btn-sm ms-2 px-3 text-white" href="register.html">Register</a></li>';
  }

  nav += "      </ul>";
  nav += "    </div>";
  nav += "  </div>";
  nav += "</nav>";

  $("#navbar-container").html(nav);

  // Highlight active link
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  $(".nav-link").each(function () {
    if ($(this).attr("href") === currentPage) {
      $(this).addClass("active");
    }
  });

  // Logout handler
  $("#logout-btn").on("click", function (e) {
    e.preventDefault();
    $.ajax({
      url: API + "/auth/logout",
      method: "POST",
  
      success: function () {
        clearUser();
        showAlert("Logged out successfully!", "success");
        setTimeout(function () {
          window.location.href = "index.html";
        }, 800);
      },
      error: function () {
        clearUser();
        window.location.href = "index.html";
      },
    });
  });
}

/* ---------- Render Footer ---------- */
function renderFooter() {
  var html =
    "<footer>" +
    '  <div class="container text-center">' +
    "    <p class=\"mb-0\">Job Portal &copy; 2026 &mdash; Web Technology Project</p>" +
    "  </div>" +
    "</footer>";

  $("#footer-container").html(html);
}

/* ---------- Require login — redirect if not logged in ---------- */
function requireLogin() {
  if (!isLoggedIn()) {
    showAlert("Please log in first.", "warning");
    setTimeout(function () {
      window.location.href = "login.html";
    }, 1000);
    return false;
  }
  return true;
}

/* ---------- Format date ---------- */
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  var d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

/* ---------- Status badge helper ---------- */
function statusBadge(status) {
  var cls = "status-" + status.toLowerCase();
  return '<span class="badge ' + cls + '">' + status + "</span>";
}

/* ---------- Job type badge color ---------- */
function jobTypeBadge(type) {
  var colors = {
    internship: "info",
    "full-time": "success",
    "part-time": "warning",
  };
  var color = colors[type] || "secondary";
  return '<span class="badge bg-' + color + '">' + type + "</span>";
}

/* ---------- Run on every page ---------- */
$(document).ready(function () {
  renderNavbar();
  renderFooter();
  // Verify that server session is still alive (syncs client ↔ server)
  verifySession();
});
