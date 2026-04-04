/* ── jobs.js — Job listing page logic ────────────────────────── */

$(document).ready(function () {
  loadJobs();

  // --- Filter form submit ---
  $("#filter-form").on("submit", function (e) {
    e.preventDefault();
    loadJobs();
  });

  // --- Clear filters ---
  $("#clear-filters").on("click", function () {
    $("#filter-search").val("");
    $("#filter-location").val("");
    $("#filter-type").val("");
    loadJobs();
  });
});

function loadJobs() {
  var search = $("#filter-search").val().trim();
  var location = $("#filter-location").val().trim();
  var jobType = $("#filter-type").val();

  // Build query string
  var params = [];
  if (search) params.push("search=" + encodeURIComponent(search));
  if (location) params.push("location=" + encodeURIComponent(location));
  if (jobType) params.push("jobType=" + encodeURIComponent(jobType));

  var query = params.length > 0 ? "?" + params.join("&") : "";

  // Show spinner, hide jobs
  $("#jobs-list").hide();
  $("#jobs-spinner").show();

  $.ajax({
    url: API + "/jobs" + query,
    method: "GET",

    success: function (data) {
      $("#jobs-spinner").hide();

      var jobs = data.jobs;
      $("#jobs-count").text(jobs.length + " job" + (jobs.length !== 1 ? "s" : "") + " found");

      if (jobs.length === 0) {
        $("#jobs-list").html(
          '<div class="empty-state">' +
          '  <i class="bi bi-search"></i>' +
          "  <p>No jobs match your filters. Try a different search.</p>" +
          "</div>"
        ).fadeIn(400);
        return;
      }

      var html = '<div class="row g-4">';
      $.each(jobs, function (i, job) {
        html += '<div class="col-md-6 col-lg-4">';
        html += '  <div class="card job-card p-3 h-100 d-flex flex-column">';
        html += '    <div class="d-flex justify-content-between align-items-start mb-2">';
        html += "      <h5 class=\"mb-0\">" + job.title + "</h5>";
        html += "      " + jobTypeBadge(job.jobType);
        html += "    </div>";
        html += '    <p class="text-muted mb-1"><i class="bi bi-building me-1"></i>' + (job.companyName || "Company") + "</p>";
        html += '    <p class="mb-1"><i class="bi bi-geo-alt me-1"></i>' + job.location + "</p>";
        html += '    <p class="mb-1"><i class="bi bi-cash me-1"></i>' + job.salaryOrStipend + "</p>";

        // Skills tags
        if (job.skillsRequired && job.skillsRequired.length > 0) {
          html += '<div class="mb-2">';
          $.each(job.skillsRequired, function (j, skill) {
            html += '<span class="badge bg-light text-dark border me-1 mb-1">' + skill + "</span>";
          });
          html += "</div>";
        }

        html += '    <p class="text-muted small flex-grow-1">' + job.description.substring(0, 120) + "...</p>";

        if (job.deadline) {
          html += '    <p class="small text-muted"><i class="bi bi-calendar me-1"></i>Deadline: ' + formatDate(job.deadline) + "</p>";
        }

        html += '    <a href="job-details.html?id=' + job._id + '" class="btn btn-outline-primary btn-sm mt-auto">View Details</a>';
        html += "  </div>";
        html += "</div>";
      });
      html += "</div>";

      $("#jobs-list").html(html).hide().fadeIn(600);
    },
    error: function () {
      $("#jobs-spinner").hide();
      $("#jobs-list").html('<p class="text-center text-danger">Failed to load jobs. Is the server running?</p>').show();
    },
  });
}
