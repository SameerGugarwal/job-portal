/* ── recruiter-dashboard.js — Recruiter's posted jobs + applicants ── */

$(document).ready(function () {
  if (!requireLogin()) return;

  var user = getUser();
  if (user.role !== "recruiter") {
    showAlert("This page is for recruiters only.", "warning");
    setTimeout(function () {
      window.location.href = "student-dashboard.html";
    }, 1000);
    return;
  }

  $("#recruiter-name").text(user.name);

  loadMyJobs();

  // --- Post new job form ---
  $("#post-job-form").on("submit", function (e) {
    e.preventDefault();

    var title = $("#job-title").val().trim();
    var description = $("#job-description").val().trim();
    var skillsRaw = $("#job-skills").val().trim();
    var location = $("#job-location").val().trim();
    var salary = $("#job-salary").val().trim();
    var jobType = $("#job-type").val();
    var category = $("#job-category").val().trim();
    var deadline = $("#job-deadline").val();

    // Validation
    if (!title || !description) {
      showAlert("Title and description are required.", "warning");
      return;
    }

    var skills = skillsRaw ? skillsRaw.split(",").map(function (s) { return s.trim(); }) : [];

    var $btn = $("#post-job-btn");
    $btn.prop("disabled", true).text("Posting...");

    $.ajax({
      url: API + "/jobs",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        title: title,
        description: description,
        skillsRequired: skills,
        location: location || "Remote",
        salaryOrStipend: salary || "Unpaid",
        jobType: jobType,
        category: category || "General",
        deadline: deadline || null,
      }),

      success: function () {
        showAlert("Job posted successfully!", "success");
        $("#post-job-form")[0].reset();
        $btn.prop("disabled", false).text("Post Job");

        // Close modal and refresh list
        $("#postJobModal").modal("hide");
        loadMyJobs();
      },
      error: function (xhr) {
        var msg = xhr.responseJSON ? xhr.responseJSON.message : "Failed to post job.";
        showAlert(msg, "danger");
        $btn.prop("disabled", false).text("Post Job");
      },
    });
  });
});

/* ---------- Load recruiter's jobs ---------- */
function loadMyJobs() {
  $("#jobs-spinner").show();
  $("#my-jobs-list").hide();

  $.ajax({
    url: API + "/jobs/recruiter/mine",
    method: "GET",
    success: function (data) {
      $("#jobs-spinner").hide();

      var jobs = data.jobs;
      $("#stat-posted").text(jobs.length);

      if (jobs.length === 0) {
        $("#my-jobs-list").html(
          '<div class="empty-state">' +
          '  <i class="bi bi-briefcase"></i>' +
          "  <p>You haven't posted any jobs yet. Click \"Post New Job\" to get started.</p>" +
          "</div>"
        ).fadeIn(400);
        return;
      }

      var html = "";
      $.each(jobs, function (i, job) {
        html += '<div class="card job-card p-3 mb-3">';
        html += '  <div class="d-flex justify-content-between align-items-start flex-wrap">';
        html += "    <div>";
        html += "      <h5 class=\"mb-1\">" + job.title + "</h5>";
        html += '      <p class="text-muted mb-1">' + job.location + " &middot; " + job.salaryOrStipend + "</p>";
        html += "    </div>";
        html += "    <div>" + jobTypeBadge(job.jobType) + "</div>";
        html += "  </div>";

        if (job.deadline) {
          html += '  <p class="small text-muted mb-2">Deadline: ' + formatDate(job.deadline) + "</p>";
        }

        html += '  <div class="d-flex gap-2 flex-wrap">';
        html += '    <button class="btn btn-outline-primary btn-sm view-applicants-btn" data-job-id="' + job._id + '" data-job-title="' + job.title + '">';
        html += '      <i class="bi bi-people me-1"></i>View Applicants';
        html += "    </button>";
        html += '    <button class="btn btn-outline-danger btn-sm delete-job-btn" data-job-id="' + job._id + '">';
        html += '      <i class="bi bi-trash me-1"></i>Delete';
        html += "    </button>";
        html += "  </div>";
        html += "</div>";
      });

      $("#my-jobs-list").html(html).hide().fadeIn(600);

      // --- View applicants button ---
      $(".view-applicants-btn").on("click", function () {
        var jobId = $(this).data("job-id");
        var jobTitle = $(this).data("job-title");
        loadApplicants(jobId, jobTitle);
      });

      // --- Delete job button ---
      $(".delete-job-btn").on("click", function () {
        var jobId = $(this).data("job-id");
        var $card = $(this).closest(".card");

        if (!confirm("Are you sure you want to delete this job?")) return;

        $.ajax({
          url: API + "/jobs/" + jobId,
          method: "DELETE",
    
          success: function () {
            $card.slideUp(400, function () {
              $(this).remove();
              // Update count
              var current = parseInt($("#stat-posted").text());
              $("#stat-posted").text(current - 1);
            });
            showAlert("Job deleted.", "success");
          },
          error: function (xhr) {
            var msg = xhr.responseJSON ? xhr.responseJSON.message : "Failed to delete.";
            showAlert(msg, "danger");
          },
        });
      });
    },
    error: function () {
      $("#jobs-spinner").hide();
      $("#my-jobs-list").html('<p class="text-danger">Failed to load your jobs.</p>').show();
    },
  });
}

/* ---------- Load applicants for a specific job ---------- */
function loadApplicants(jobId, jobTitle) {
  $("#applicants-title").text("Applicants for: " + jobTitle);
  $("#applicants-body").html(
    '<div class="spinner-wrapper"><div class="spinner-border text-primary" role="status"></div></div>'
  );
  $("#applicantsModal").modal("show");

  $.ajax({
    url: API + "/applications/job/" + jobId,
    method: "GET",
    success: function (data) {
      var apps = data.applications;

      if (apps.length === 0) {
        $("#applicants-body").html('<p class="text-muted text-center">No applications yet.</p>');
        return;
      }

      var html = '<div class="table-responsive">';
      html += '<table class="table table-hover align-middle">';
      html += "<thead><tr><th>#</th><th>Name</th><th>Email</th><th>Cover Letter</th><th>Status</th><th>Action</th></tr></thead>";
      html += "<tbody>";

      $.each(apps, function (i, app) {
        var student = app.studentId || {};
        html += "<tr>";
        html += "  <td>" + (i + 1) + "</td>";
        html += "  <td>" + (student.name || "—") + "</td>";
        html += "  <td>" + (student.email || "—") + "</td>";
        html += "  <td>" + (app.coverLetter || "<em>None</em>") + "</td>";
        html += "  <td>" + statusBadge(app.status) + "</td>";
        html += "  <td>";
        html += '    <select class="form-select form-select-sm status-select" data-app-id="' + app._id + '" style="width: 140px;">';
        html += '      <option value="Applied"' + (app.status === "Applied" ? " selected" : "") + ">Applied</option>";
        html += '      <option value="Shortlisted"' + (app.status === "Shortlisted" ? " selected" : "") + ">Shortlisted</option>";
        html += '      <option value="Rejected"' + (app.status === "Rejected" ? " selected" : "") + ">Rejected</option>";
        html += '      <option value="Hired"' + (app.status === "Hired" ? " selected" : "") + ">Hired</option>";
        html += "    </select>";
        html += "  </td>";
        html += "</tr>";
      });

      html += "</tbody></table></div>";
      $("#applicants-body").html(html);

      // --- Status change handler ---
      $(".status-select").on("change", function () {
        var appId = $(this).data("app-id");
        var newStatus = $(this).val();
        var $row = $(this).closest("tr");
        var $badge = $row.find(".badge");

        $.ajax({
          url: API + "/applications/" + appId + "/status",
          method: "PATCH",
          contentType: "application/json",
          data: JSON.stringify({ status: newStatus }),
    
          success: function () {
            // Update badge in the table
            $badge.attr("class", "badge status-" + newStatus.toLowerCase()).text(newStatus);
            showAlert("Status updated to " + newStatus, "success");
          },
          error: function (xhr) {
            var msg = xhr.responseJSON ? xhr.responseJSON.message : "Failed to update status.";
            showAlert(msg, "danger");
          },
        });
      });
    },
    error: function () {
      $("#applicants-body").html('<p class="text-danger">Failed to load applicants.</p>');
    },
  });
}
