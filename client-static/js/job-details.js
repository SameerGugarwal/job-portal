/* ── job-details.js — Single job view + apply ───────────────── */

$(document).ready(function () {
  var params = new URLSearchParams(window.location.search);
  var jobId = params.get("id");

  if (!jobId) {
    $("#job-content").html('<div class="alert alert-warning">No job ID provided. <a href="jobs.html">Browse jobs</a></div>');
    $("#job-spinner").hide();
    return;
  }

  $.ajax({
    url: API + "/jobs/" + jobId,
    method: "GET",
    success: function (data) {
      $("#job-spinner").hide();
      var job = data.job;

      var html = "";

      // ── Main Job Card ──
      html += '<div class="job-details-card">';

      // Header
      html += '  <div class="job-details-header">';
      html += '    <div class="company-logo-lg">' + getCompanyInitial(job.companyName) + '</div>';
      html += '    <div class="flex-grow-1">';
      html += '      <h2>' + escapeHtml(job.title) + '</h2>';
      html += '      <p class="text-muted mb-2"><i class="bi bi-building me-1"></i>' + escapeHtml(job.companyName || "Company") + '</p>';
      html += '      ' + jobTypeBadge(job.jobType);
      html += '    </div>';
      html += '  </div>';

      // Detail grid
      html += '  <div class="detail-grid">';
      html += '    <div class="detail-item">';
      html += '      <div class="icon"><i class="bi bi-geo-alt-fill"></i></div>';
      html += '      <div><p class="label">Location</p><p class="value">' + escapeHtml(job.location) + '</p></div>';
      html += '    </div>';
      html += '    <div class="detail-item">';
      html += '      <div class="icon"><i class="bi bi-cash-stack"></i></div>';
      html += '      <div><p class="label">Stipend / Salary</p><p class="value">' + escapeHtml(job.salaryOrStipend) + '</p></div>';
      html += '    </div>';
      html += '    <div class="detail-item">';
      html += '      <div class="icon"><i class="bi bi-tag-fill"></i></div>';
      html += '      <div><p class="label">Category</p><p class="value">' + escapeHtml(job.category || "General") + '</p></div>';
      html += '    </div>';

      if (job.deadline) {
        var isExpired = new Date() > new Date(job.deadline);
        html += '    <div class="detail-item">';
        html += '      <div class="icon"><i class="bi bi-calendar-event-fill"></i></div>';
        html += '      <div><p class="label">Deadline</p><p class="value">' + formatDate(job.deadline);
        if (isExpired) html += ' <span class="badge status-rejected ms-1">Expired</span>';
        html += '</p></div>';
        html += '    </div>';
      }
      html += '  </div>';

      // Skills
      if (job.skillsRequired && job.skillsRequired.length > 0) {
        html += '  <h6 class="mt-4 mb-3">Required Skills</h6>';
        html += '  <div class="skill-chips mb-4">';
        $.each(job.skillsRequired, function (_, skill) {
          html += '<span class="skill-chip">' + escapeHtml(skill) + '</span>';
        });
        html += '  </div>';
      }

      // Description
      html += '  <h6 class="mt-4 mb-3">About the Role</h6>';
      html += '  <p style="white-space: pre-line; color: var(--color-text);">' + escapeHtml(job.description) + '</p>';

      // Recruiter
      if (job.recruiterId) {
        html += '  <hr class="my-4" />';
        html += '  <p class="text-muted small mb-0"><i class="bi bi-person-circle me-1"></i>Posted by ' + escapeHtml(job.recruiterId.name || "Recruiter") + '</p>';
      }

      html += '</div>';

      // ── Apply Section ──
      var user = getUser();
      if (user && user.role === "student") {
        var isExpired = job.deadline && new Date() > new Date(job.deadline);

        html += '<div class="job-details-card mt-4">';
        html += '  <h4 class="mb-3"><i class="bi bi-send-fill text-primary me-2"></i>Apply for this Job</h4>';

        if (isExpired) {
          html += '  <div class="alert alert-warning mb-0">The application deadline has passed.</div>';
        } else {
          html += '  <form id="apply-form">';
          html += '    <div class="mb-3">';
          html += '      <label for="cover-letter" class="form-label">Cover Letter <span class="text-muted">(optional)</span></label>';
          html += '      <textarea class="form-control" id="cover-letter" rows="5" placeholder="Tell the recruiter why you are a great fit for this role..."></textarea>';
          html += '    </div>';
          html += '    <button type="submit" class="btn btn-success btn-lg" id="apply-btn">';
          html += '      <i class="bi bi-send-fill"></i> Submit Application';
          html += '    </button>';
          html += '  </form>';
        }

        html += '</div>';
      } else if (!user) {
        html += '<div class="job-details-card mt-4 text-center">';
        html += '  <h5 class="mb-3"><i class="bi bi-lock-fill text-primary me-2"></i>Login Required</h5>';
        html += '  <p class="text-muted mb-3">You need an account to apply for this job.</p>';
        html += '  <div class="d-flex gap-2 justify-content-center flex-wrap">';
        html += '    <a href="login.html" class="btn btn-primary">Login</a>';
        html += '    <a href="register.html" class="btn btn-outline-primary">Create Account</a>';
        html += '  </div>';
        html += '</div>';
      }

      $("#job-content").hide().html(html).fadeIn(500);

      // Apply form handler
      $("#apply-form").on("submit", function (e) {
        e.preventDefault();

        var $btn = $("#apply-btn");
        $btn.prop("disabled", true).html('<i class="bi bi-hourglass-split"></i> Submitting...');

        $.ajax({
          url: API + "/applications",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({
            jobId: jobId,
            coverLetter: $("#cover-letter").val().trim(),
          }),
          success: function () {
            showAlert("Application submitted successfully!", "success");
            $("#apply-form").slideUp(400, function () {
              $(this).replaceWith(
                '<div class="alert alert-success mb-0">' +
                '<i class="bi bi-check-circle-fill me-2"></i>You have successfully applied! ' +
                '<a href="student-dashboard.html" class="alert-link">View your applications →</a>' +
                "</div>"
              );
            });
          },
          error: function (xhr) {
            var msg = xhr.responseJSON ? xhr.responseJSON.message : "Failed to apply.";
            showAlert(msg, "danger");
            $btn.prop("disabled", false).html('<i class="bi bi-send-fill"></i> Submit Application');
          },
        });
      });
    },
    error: function () {
      $("#job-spinner").hide();
      $("#job-content").html('<div class="alert alert-danger">Job not found. <a href="jobs.html" class="alert-link">Browse jobs</a></div>');
    },
  });
});
