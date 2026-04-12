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
  var icons = {
    success: "bi-check-circle-fill",
    danger: "bi-exclamation-circle-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill",
  };
  var icon = icons[type] || "bi-info-circle-fill";

  var id = "alert-" + Date.now();
  var html =
    '<div id="' + id + '" class="alert alert-' + type + ' alert-float alert-dismissible fade show">' +
    '<i class="bi ' + icon + ' me-2"></i>' +
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
$(document).ajaxError(function (event, xhr) {
  if (xhr.status === 401 && isLoggedIn()) {
    clearUser();
    showAlert("Session expired. Please log in again.", "warning");
    setTimeout(function () {
      window.location.href = "login.html";
    }, 1200);
  }

  if (xhr.status === 0) {
    showAlert("Cannot reach server. Make sure the backend is running on port 5002.", "danger");
  }
});

/* ---------- Verify session on page load ---------- */
function verifySession(callback) {
  if (!isLoggedIn()) {
    if (callback) callback(false);
    return;
  }

  $.ajax({
    url: API + "/auth/me",
    method: "GET",
    success: function (data) {
      saveUser(data.user);
      if (callback) callback(true);
    },
    error: function () {
      clearUser();
      renderNavbar();
      if (callback) callback(false);
    },
  });
}

/* ---------- Get initials for avatar ---------- */
function getInitials(name) {
  if (!name || !name.trim()) return "U";
  var parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ---------- Render Navbar ---------- */
function renderNavbar() {
  var user = getUser();
  var nav = "";

  nav += '<nav class="navbar navbar-expand-lg app-navbar">';
  nav += '  <div class="container">';
  nav += '    <a class="navbar-brand" href="index.html">';
  nav += '      <span class="brand-mark"><i class="bi bi-briefcase-fill"></i></span>';
  nav += '      JobPortal';
  nav += '    </a>';
  nav += '    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">';
  nav += '      <span class="navbar-toggler-icon"></span>';
  nav += "    </button>";
  nav += '    <div class="collapse navbar-collapse" id="navbarNav">';
  nav += '      <ul class="navbar-nav me-auto ms-lg-4">';
  nav += '        <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>';
  nav += '        <li class="nav-item"><a class="nav-link" href="jobs.html">Browse Jobs</a></li>';

  if (user && user.role === "student") {
    nav += '        <li class="nav-item"><a class="nav-link" href="student-dashboard.html">My Applications</a></li>';
  }
  if (user && user.role === "recruiter") {
    nav += '        <li class="nav-item"><a class="nav-link" href="recruiter-dashboard.html">Dashboard</a></li>';
  }

  nav += "      </ul>";
  nav += '      <ul class="navbar-nav align-items-lg-center">';

  if (user) {
    nav += '        <li class="nav-item me-2">';
    nav += '          <span class="user-pill">';
    nav += '            <span class="avatar">' + getInitials(user.name) + '</span>';
    nav += '            ' + user.name;
    nav += '          </span>';
    nav += "        </li>";
    nav += '        <li class="nav-item">';
    nav += '          <a class="btn btn-outline-primary btn-sm" href="#" id="logout-btn"><i class="bi bi-box-arrow-right"></i> Logout</a>';
    nav += "        </li>";
  } else {
    nav += '        <li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>';
    nav += '        <li class="nav-item ms-lg-2"><a class="btn btn-primary btn-sm" href="register.html"><i class="bi bi-person-plus"></i> Get Started</a></li>';
  }

  nav += "      </ul>";
  nav += "    </div>";
  nav += "  </div>";
  nav += "</nav>";

  $("#navbar-container").html(nav);

  // Highlight active link
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  $(".navbar.app-navbar .nav-link").each(function () {
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

  // Add scroll shadow to navbar
  $(window).off("scroll.navbar").on("scroll.navbar", function () {
    if ($(window).scrollTop() > 10) {
      $(".navbar.app-navbar").addClass("scrolled");
    } else {
      $(".navbar.app-navbar").removeClass("scrolled");
    }
  });
}

/* ---------- Render Footer ---------- */
function renderFooter() {
  var html = "";
  html += '<footer class="app-footer">';
  html += '  <div class="container">';
  html += '    <div class="row g-4">';

  // Brand column
  html += '      <div class="col-lg-4 col-md-12">';
  html += '        <div class="footer-brand">';
  html += '          <span class="brand-mark"><i class="bi bi-briefcase-fill"></i></span>';
  html += '          JobPortal';
  html += '        </div>';
  html += '        <p class="footer-tagline">Connecting talented students with leading recruiters. Find your dream internship or full-time role today.</p>';
  html += '        <div class="social-links">';
  html += '          <a href="#" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>';
  html += '          <a href="#" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>';
  html += '          <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>';
  html += '          <a href="#" aria-label="GitHub"><i class="bi bi-github"></i></a>';
  html += '        </div>';
  html += '      </div>';

  // For Students
  html += '      <div class="col-lg-2 col-md-4 col-6">';
  html += '        <h6>For Students</h6>';
  html += '        <a href="jobs.html">Browse Jobs</a>';
  html += '        <a href="register.html">Sign Up</a>';
  html += '        <a href="student-dashboard.html">My Applications</a>';
  html += '        <a href="#">Career Tips</a>';
  html += '      </div>';

  // For Recruiters
  html += '      <div class="col-lg-2 col-md-4 col-6">';
  html += '        <h6>For Recruiters</h6>';
  html += '        <a href="register.html">Post a Job</a>';
  html += '        <a href="recruiter-dashboard.html">Dashboard</a>';
  html += '        <a href="#">Pricing</a>';
  html += '        <a href="#">Resources</a>';
  html += '      </div>';

  // Company
  html += '      <div class="col-lg-2 col-md-4 col-6">';
  html += '        <h6>Company</h6>';
  html += '        <a href="#">About Us</a>';
  html += '        <a href="#">Contact</a>';
  html += '        <a href="#">Blog</a>';
  html += '        <a href="#">Privacy Policy</a>';
  html += '      </div>';

  // Connect
  html += '      <div class="col-lg-2 col-md-12 col-6">';
  html += '        <h6>Get in Touch</h6>';
  html += '        <a href="mailto:hello@jobportal.com"><i class="bi bi-envelope me-1"></i>hello@jobportal.com</a>';
  html += '        <a href="#"><i class="bi bi-geo-alt me-1"></i>Bangalore, India</a>';
  html += '      </div>';

  html += '    </div>';
  html += '    <div class="copyright">';
  html += '      &copy; 2026 JobPortal. Built for Web Technology Project.';
  html += '    </div>';
  html += '  </div>';
  html += "</footer>";

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

/* ---------- Job type badge ---------- */
function jobTypeBadge(type) {
  var cls = "badge-type-" + (type || "internship");
  var label = type || "internship";
  return '<span class="badge ' + cls + '">' + label + "</span>";
}

/* ---------- HTML escaping for XSS prevention ---------- */
function escapeHtml(text) {
  if (!text) return "";
  var map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(text).replace(/[&<>"']/g, function (s) { return map[s]; });
}

/* ---------- Get company initial for logo placeholder ---------- */
function getCompanyInitial(name) {
  var trimmed = name && name.trim();
  if (!trimmed) return "C";
  return trimmed[0].toUpperCase();
}

/* ---------- Animate counter (for stats) ---------- */
function animateCounter($el, target, duration) {
  duration = duration || 1200;
  var start = 0;
  var startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    var current = Math.floor(ease * target);
    $el.text(current);
    if (progress < 1) requestAnimationFrame(step);
    else $el.text(target);
  }

  requestAnimationFrame(step);
}

/* ---------- Reveal on scroll using IntersectionObserver ---------- */
function setupScrollReveal() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach(function (el) {
    observer.observe(el);
  });
}

/* ---------- Run on every page ---------- */
$(document).ready(function () {
  renderNavbar();
  renderFooter();
  verifySession();
  setupScrollReveal();
});
