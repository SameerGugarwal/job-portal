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

  // Post new job form
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

    if (!title || !description) {
      showAlert("Title and description are required.", "warning");
      return;
    }

    var skills = skillsRaw ? skillsRaw.split(",").map(function (s) { return s.trim(); }).filter(Boolean) : [];

    var $btn = $("#post-job-btn");
    $btn.prop("disabled", true).html('<i class="bi bi-hourglass-split"></i> Posting...');

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
        $btn.prop("disabled", false).html('<i class="bi bi-send-fill"></i> Post Job');
        $("#postJobModal").modal("hide");
        loadMyJobs();
      },
      error: function (xhr) {
        var msg = xhr.responseJSON ? xhr.responseJSON.message : "Failed to post job.";
        showAlert(msg, "danger");
        $btn.prop("disabled", false).html('<i class="bi bi-send-fill"></i> Post Job');
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
      animateCounter($("#stat-posted"), jobs.length);

      // Load applicant counts for stats
      loadApplicantStats(jobs);

      if (jobs.length === 0) {
        $("#my-jobs-list").html(
          '<div class="empty-state">' +
          '  <i class="bi bi-briefcase"></i>' +
          "  <p>You haven't posted any jobs yet.</p>" +
          '  <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#postJobModal"><i class="bi bi-plus-circle"></i> Post Your First Job</button>' +
          "</div>"
        ).fadeIn(400);
        return;
      }

      var html = '<div class="row g-4">';
      $.each(jobs, function (i, job) {
        var skills = job.skillsRequired || [];
        var skillsHtml = "";
        $.each(skills.slice(0, 3), function (_, skill) {
          skillsHtml += '<span class="skill-chip">' + escapeHtml(skill) + '</span>';
        });

        html += '<div class="col-md-6 col-xl-4">';
        html += '  <div class="job-card animate-fade-in-up delay-' + Math.min(i % 5, 5) + '">';
        html += '    <div class="job-card-header">';
        html += '      <div class="company-logo">' + getCompanyInitial(job.companyName) + '</div>';
        html += '      <div class="flex-grow-1 min-w-0">';
        html += '        <h6 class="job-title">' + escapeHtml(job.title) + '</h6>';
        html += '        <p class="company-name">' + escapeHtml(job.location) + ' · ' + escapeHtml(job.salaryOrStipend) + '</p>';
        html += '      </div>';
        html += '      ' + jobTypeBadge(job.jobType);
        html += '    </div>';

        html += '    <p class="job-description">' + escapeHtml(job.description) + '</p>';
        if (skillsHtml) html += '    <div class="skill-chips">' + skillsHtml + '</div>';

        html += '    <div class="job-footer">';
        html += '      <span class="deadline-text">';
        if (job.deadline) html += '<i class="bi bi-calendar"></i> Due ' + formatDate(job.deadline);
        else html += '<i class="bi bi-clock"></i> Open';
        html += '</span>';
        html += '      <div class="d-flex gap-1">';
        html += '        <button class="btn btn-outline-primary btn-sm view-applicants-btn" data-job-id="' + escapeHtml(job._id) + '" data-job-title="' + escapeHtml(job.title) + '">';
        html += '          <i class="bi bi-people"></i> Applicants';
        html += '        </button>';
        html += '        <button class="btn btn-outline-danger btn-sm delete-job-btn" data-job-id="' + escapeHtml(job._id) + '">';
        html += '          <i class="bi bi-trash"></i>';
        html += '        </button>';
        html += '      </div>';
        html += '    </div>';

        html += '  </div>';
        html += '</div>';
      });
      html += '</div>';

      $("#my-jobs-list").html(html).fadeIn(500);

      // View applicants
      $(".view-applicants-btn").on("click", function () {
        var jobId = $(this).data("job-id");
        var jobTitle = $(this).data("job-title");
        loadApplicants(jobId, jobTitle);
      });

      // Delete job
      $(".delete-job-btn").on("click", function () {
        var jobId = $(this).data("job-id");
        var $card = $(this).closest(".col-md-6, .col-xl-4");

        if (!confirm("Are you sure you want to delete this job?")) return;

        $.ajax({
          url: API + "/jobs/" + jobId,
          method: "DELETE",
          success: function () {
            $card.slideUp(400, function () {
              $(this).remove();
              var current = parseInt($("#stat-posted").text(), 10);
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
      $("#my-jobs-list").html('<div class="alert alert-danger">Failed to load your jobs.</div>').show();
    },
  });
}

/* ---------- Calculate total applicants + hired across all jobs ---------- */
function loadApplicantStats(jobs) {
  if (jobs.length === 0) return;
  var totalApplicants = 0;
  var totalHired = 0;
  var done = 0;

  jobs.forEach(function (job) {
    $.ajax({
      url: API + "/applications/job/" + job._id,
      method: "GET",
      success: function (data) {
        totalApplicants += data.applications.length;
        totalHired += data.applications.filter(function (a) { return a.status === "Hired"; }).length;
      },
      complete: function () {
        done++;
        if (done === jobs.length) {
          animateCounter($("#stat-applicants"), totalApplicants);
          animateCounter($("#stat-hired-count"), totalHired);
        }
      },
    });
  });
}

/* ---------- Load applicants for a specific job ---------- */
function loadApplicants(jobId, jobTitle) {
  $("#applicants-title").html('<i class="bi bi-people-fill me-2 text-primary"></i>Applicants for: ' + escapeHtml(jobTitle));
  $("#applicants-body").html(
    '<div class="spinner-wrapper"><div class="spinner-border" role="status"></div></div>'
  );
  $("#applicantsModal").modal("show");

  $.ajax({
    url: API + "/applications/job/" + jobId,
    method: "GET",
    success: function (data) {
      var apps = data.applications;

      if (apps.length === 0) {
        $("#applicants-body").html(
          '<div class="empty-state">' +
          '  <i class="bi bi-person-x"></i>' +
          '  <p>No applications yet. Check back later!</p>' +
          '</div>'
        );
        return;
      }

      var html = '<div class="table-responsive"><table class="table table-hover align-middle mb-0">';
      html += "<thead><tr><th>#</th><th>Name</th><th>Email</th><th>Cover Letter</th><th>Status</th><th>Update</th></tr></thead>";
      html += "<tbody>";

      $.each(apps, function (i, app) {
        var student = app.studentId || {};
        var letter = app.coverLetter || "<em class='text-muted'>None</em>";
        html += "<tr>";
        html += "  <td><strong>" + (i + 1) + "</strong></td>";
        html += "  <td><strong>" + escapeHtml(student.name || "—") + "</strong></td>";
        html += "  <td class='text-muted'>" + escapeHtml(student.email || "—") + "</td>";
        html += "  <td style='max-width:280px;'><small>" + (app.coverLetter ? escapeHtml(app.coverLetter) : letter) + "</small></td>";
        html += "  <td>" + statusBadge(app.status) + "</td>";
        html += "  <td>";
        html += '    <select class="form-select form-select-sm status-select" data-app-id="' + escapeHtml(app._id) + '" style="width:140px;">';
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

      // Status change handler
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
      $("#applicants-body").html('<div class="alert alert-danger">Failed to load applicants.</div>');
    },
  });
}
