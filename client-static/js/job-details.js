/* ── job-details.js — Single job view + apply ───────────────── */

$(document).ready(function () {
  // Get job ID from URL: ?id=abc123
  var params = new URLSearchParams(window.location.search);
  var jobId = params.get("id");

  if (!jobId) {
    $("#job-content").html('<div class="alert alert-warning">No job ID provided. <a href="jobs.html">Browse jobs</a></div>');
    return;
  }

  // Load job details
  $.ajax({
    url: API + "/jobs/" + jobId,
    method: "GET",

    success: function (data) {
      $("#job-spinner").hide();
      var job = data.job;

      var html = "";
      html += '<div class="card p-4">';

      // Header
      html += '<div class="d-flex justify-content-between align-items-start flex-wrap mb-3">';
      html += "  <div>";
      html += "    <h2>" + job.title + "</h2>";
      html += '    <p class="text-muted mb-0"><i class="bi bi-building me-1"></i>' + (job.companyName || "Company") + "</p>";
      html += "  </div>";
      html += "  <div>" + jobTypeBadge(job.jobType) + "</div>";
      html += "</div>";

      html += "<hr />";

      // Details grid
      html += '<div class="row mb-3">';
      html += '  <div class="col-sm-6 mb-2"><strong><i class="bi bi-geo-alt me-1"></i>Location:</strong> ' + job.location + "</div>";
      html += '  <div class="col-sm-6 mb-2"><strong><i class="bi bi-cash me-1"></i>Stipend/Salary:</strong> ' + job.salaryOrStipend + "</div>";
      html += '  <div class="col-sm-6 mb-2"><strong><i class="bi bi-tag me-1"></i>Category:</strong> ' + job.category + "</div>";

      if (job.deadline) {
        var isExpired = new Date() > new Date(job.deadline);
        html += '  <div class="col-sm-6 mb-2"><strong><i class="bi bi-calendar me-1"></i>Deadline:</strong> ' + formatDate(job.deadline);
        if (isExpired) {
          html += ' <span class="badge bg-danger ms-1">Expired</span>';
        }
        html += "</div>";
      }
      html += "</div>";

      // Skills
      if (job.skillsRequired && job.skillsRequired.length > 0) {
        html += "<strong>Skills Required:</strong><div class=\"mb-3 mt-1\">";
        $.each(job.skillsRequired, function (i, skill) {
          html += '<span class="badge bg-primary me-1 mb-1">' + skill + "</span>";
        });
        html += "</div>";
      }

      // Description
      html += "<strong>Description:</strong>";
      html += '<p class="mt-1">' + job.description + "</p>";

      // Recruiter info
      if (job.recruiterId) {
        html += '<p class="text-muted small">Posted by: ' + (job.recruiterId.name || "Recruiter") + "</p>";
      }

      html += "</div>";

      // Apply section (only for students)
      var user = getUser();
      if (user && user.role === "student") {
        var isExpired = job.deadline && new Date() > new Date(job.deadline);

        html += '<div class="card p-4 mt-4">';
        html += "  <h4>Apply for this Job</h4>";

        if (isExpired) {
          html += '  <div class="alert alert-warning">The application deadline has passed.</div>';
        } else {
          html += '  <form id="apply-form">';
          html += '    <div class="mb-3">';
          html += '      <label for="cover-letter" class="form-label">Cover Letter (optional)</label>';
          html += '      <textarea class="form-control" id="cover-letter" rows="4" placeholder="Tell the recruiter why you are a great fit..."></textarea>';
          html += "    </div>";
          html += '    <button type="submit" class="btn btn-success" id="apply-btn">';
          html += '      <i class="bi bi-send me-1"></i>Submit Application';
          html += "    </button>";
          html += "  </form>";
        }

        html += "</div>";
      } else if (!user) {
        html += '<div class="card p-4 mt-4 text-center">';
        html += '  <p class="mb-2">Want to apply?</p>';
        html += '  <a href="login.html" class="btn btn-primary">Login to Apply</a>';
        html += "</div>";
      }

      $("#job-content").hide().html(html).fadeIn(500);

      // --- Apply form handler ---
      $("#apply-form").on("submit", function (e) {
        e.preventDefault();

        var $btn = $("#apply-btn");
        $btn.prop("disabled", true).html('<i class="bi bi-hourglass-split me-1"></i>Submitting...');

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
            // Replace form with success message using jQuery slideUp/slideDown
            $("#apply-form").slideUp(400, function () {
              $(this).replaceWith(
                '<div class="alert alert-success">' +
                '<i class="bi bi-check-circle me-2"></i>You have applied to this job. ' +
                '<a href="student-dashboard.html">View your applications</a>' +
                "</div>"
              );
            });
          },
          error: function (xhr) {
            var msg = xhr.responseJSON ? xhr.responseJSON.message : "Failed to apply.";
            showAlert(msg, "danger");
            $btn.prop("disabled", false).html('<i class="bi bi-send me-1"></i>Submit Application');
          },
        });
      });
    },
    error: function () {
      $("#job-spinner").hide();
      $("#job-content").html('<div class="alert alert-danger">Job not found. <a href="jobs.html">Browse jobs</a></div>');
    },
  });
});
