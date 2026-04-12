/* ── jobs.js — Job listing page logic ────────────────────────── */

$(document).ready(function () {
  // Pre-fill from URL query (so hero search works)
  var params = new URLSearchParams(window.location.search);
  if (params.get("search")) $("#filter-search").val(params.get("search"));
  if (params.get("location")) $("#filter-location").val(params.get("location"));
  if (params.get("jobType")) $("#filter-type").val(params.get("jobType"));

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

  var params = [];
  if (search) params.push("search=" + encodeURIComponent(search));
  if (location) params.push("location=" + encodeURIComponent(location));
  if (jobType) params.push("jobType=" + encodeURIComponent(jobType));

  var query = params.length > 0 ? "?" + params.join("&") : "";

  $("#jobs-list").hide();
  $("#jobs-spinner").show();

  $.ajax({
    url: API + "/jobs" + query,
    method: "GET",
    success: function (data) {
      $("#jobs-spinner").hide();

      var jobs = data.jobs;
      $("#jobs-count").html("<strong>" + jobs.length + "</strong> job" + (jobs.length !== 1 ? "s" : "") + " found");

      if (jobs.length === 0) {
        $("#jobs-list").html(
          '<div class="empty-state">' +
          '  <i class="bi bi-search"></i>' +
          "  <p>No jobs match your filters. Try adjusting your search.</p>" +
          "</div>"
        ).fadeIn(400);
        return;
      }

      var html = '<div class="row g-4">';
      $.each(jobs, function (i, job) {
        var skills = job.skillsRequired || [];
        var skillsHtml = "";
        $.each(skills.slice(0, 4), function (_, skill) {
          skillsHtml += '<span class="skill-chip">' + escapeHtml(skill) + '</span>';
        });

        html += '<div class="col-md-6 col-xl-4">';
        html += '  <div class="job-card animate-fade-in-up delay-' + Math.min(i % 5, 5) + '">';

        // Header
        html += '    <div class="job-card-header">';
        html += '      <div class="company-logo">' + getCompanyInitial(job.companyName) + '</div>';
        html += '      <div class="flex-grow-1 min-w-0">';
        html += '        <h6 class="job-title">' + escapeHtml(job.title) + '</h6>';
        html += '        <p class="company-name">' + escapeHtml(job.companyName || "Company") + '</p>';
        html += '      </div>';
        html += '      ' + jobTypeBadge(job.jobType);
        html += '    </div>';

        // Meta
        html += '    <div class="meta-row">';
        html += '      <span><i class="bi bi-geo-alt"></i> ' + escapeHtml(job.location) + '</span>';
        html += '      <span><i class="bi bi-cash"></i> ' + escapeHtml(job.salaryOrStipend) + '</span>';
        if (job.category) html += '      <span><i class="bi bi-tag"></i> ' + escapeHtml(job.category) + '</span>';
        html += '    </div>';

        // Description
        html += '    <p class="job-description">' + escapeHtml(job.description) + '</p>';

        // Skills
        if (skillsHtml) html += '    <div class="skill-chips">' + skillsHtml + '</div>';

        // Footer
        html += '    <div class="job-footer">';
        html += '      <span class="deadline-text">';
        if (job.deadline) html += '<i class="bi bi-calendar"></i> Due ' + formatDate(job.deadline);
        else html += '<i class="bi bi-clock"></i> Open';
        html += '</span>';
        html += '      <a href="job-details.html?id=' + encodeURIComponent(job._id) + '" class="btn btn-outline-primary btn-sm">View <i class="bi bi-arrow-right"></i></a>';
        html += '    </div>';

        html += '  </div>';
        html += '</div>';
      });
      html += "</div>";

      $("#jobs-list").html(html).fadeIn(400);
    },
    error: function () {
      $("#jobs-spinner").hide();
      $("#jobs-list").html('<div class="alert alert-danger">Failed to load jobs. Is the server running?</div>').show();
    },
  });
}
