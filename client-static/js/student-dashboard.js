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

      // Animate stats
      var total = apps.length;
      var shortlisted = apps.filter(function (a) { return a.status === "Shortlisted"; }).length;
      var hired = apps.filter(function (a) { return a.status === "Hired"; }).length;

      animateCounter($("#stat-total"), total);
      animateCounter($("#stat-shortlisted"), shortlisted);
      animateCounter($("#stat-hired"), hired);

      if (apps.length === 0) {
        $("#apps-table-wrapper").html(
          '<div class="empty-state">' +
          '  <i class="bi bi-inbox"></i>' +
          "  <p>You haven't applied to any jobs yet. Start exploring!</p>" +
          '  <a href="jobs.html" class="btn btn-primary">Browse Jobs</a>' +
          "</div>"
        ).fadeIn(400);
        return;
      }

      var html = '<div class="table-responsive">';
      html += '<table class="table table-hover align-middle mb-0">';
      html += "<thead>";
      html += "  <tr><th>#</th><th>Job Title</th><th>Company</th><th>Location</th><th>Type</th><th>Status</th><th>Applied On</th></tr>";
      html += "</thead><tbody>";

      $.each(apps, function (i, app) {
        var job = app.jobId || {};
        html += "<tr>";
        html += "  <td><strong>" + (i + 1) + "</strong></td>";
        html += "  <td><strong>" + escapeHtml(job.title || "—") + "</strong></td>";
        html += "  <td>" + escapeHtml(job.companyName || "—") + "</td>";
        html += "  <td><i class=\"bi bi-geo-alt text-muted me-1\"></i>" + escapeHtml(job.location || "—") + "</td>";
        html += "  <td>" + (job.jobType ? jobTypeBadge(job.jobType) : "—") + "</td>";
        html += "  <td>" + statusBadge(app.status) + "</td>";
        html += "  <td class=\"text-muted\">" + formatDate(app.appliedAt || app.createdAt) + "</td>";
        html += "</tr>";
      });

      html += "</tbody></table></div>";

      $("#apps-table-wrapper").html(html).hide().fadeIn(500);
    },
    error: function () {
      $("#apps-spinner").hide();
      $("#apps-table-wrapper").html('<div class="alert alert-danger">Failed to load applications.</div>').show();
    },
  });
}
