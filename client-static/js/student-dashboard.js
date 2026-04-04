/* ── student-dashboard.js — Student's applied jobs ──────────── */

$(document).ready(function () {
  if (!requireLogin()) return;

  var user = getUser();
  if (user.role !== "student") {
    showAlert("This page is for students only.", "warning");
    setTimeout(function () {
      window.location.href = "recruiter-dashboard.html";
    }, 1000);
    return;
  }

  // Set greeting
  $("#student-name").text(user.name);

  loadMyApplications();
});

function loadMyApplications() {
  $("#apps-spinner").show();
  $("#apps-table-wrapper").hide();

  $.ajax({
    url: API + "/applications/me",
    method: "GET",

    success: function (data) {
      $("#apps-spinner").hide();

      var apps = data.applications;

      // Update stats
      var total = apps.length;
      var shortlisted = apps.filter(function (a) { return a.status === "Shortlisted"; }).length;
      var hired = apps.filter(function (a) { return a.status === "Hired"; }).length;

      $("#stat-total").text(total);
      $("#stat-shortlisted").text(shortlisted);
      $("#stat-hired").text(hired);

      if (apps.length === 0) {
        $("#apps-table-wrapper").html(
          '<div class="empty-state">' +
          '  <i class="bi bi-inbox"></i>' +
          "  <p>You haven't applied to any jobs yet.</p>" +
          '  <a href="jobs.html" class="btn btn-primary">Browse Jobs</a>' +
          "</div>"
        ).fadeIn(400);
        return;
      }

      var html = '<div class="table-responsive">';
      html += '<table class="table table-hover align-middle">';
      html += "<thead class=\"table-dark\">";
      html += "  <tr><th>#</th><th>Job Title</th><th>Company</th><th>Location</th><th>Type</th><th>Status</th><th>Applied On</th></tr>";
      html += "</thead><tbody>";

      $.each(apps, function (i, app) {
        var job = app.jobId || {};
        html += "<tr>";
        html += "  <td>" + (i + 1) + "</td>";
        html += "  <td>" + (job.title || "—") + "</td>";
        html += "  <td>" + (job.companyName || "—") + "</td>";
        html += "  <td>" + (job.location || "—") + "</td>";
        html += "  <td>" + (job.jobType ? jobTypeBadge(job.jobType) : "—") + "</td>";
        html += "  <td>" + statusBadge(app.status) + "</td>";
        html += "  <td>" + formatDate(app.appliedAt || app.createdAt) + "</td>";
        html += "</tr>";
      });

      html += "</tbody></table></div>";

      $("#apps-table-wrapper").html(html).hide().fadeIn(600);
    },
    error: function () {
      $("#apps-spinner").hide();
      $("#apps-table-wrapper").html('<p class="text-danger">Failed to load applications.</p>').show();
    },
  });
}
