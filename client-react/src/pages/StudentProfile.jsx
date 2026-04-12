import { useState, useEffect } from "react";
import { profileAPI } from "../services/api";
import useAuth from "../hooks/useAuth";
import ProfileSection from "../components/ProfileSection";

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Basic Info Modal state
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [basicInfoForm, setBasicInfoForm] = useState({ phone: "", location: "", profilePic: null });

  // Which section is currently being edited
  const [editSection, setEditSection] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await profileAPI.get();
      setProfile(data);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      // Construct the updated payload taking editData where applicable
      let updatedStudentProfile = { ...profile.studentProfile };
      
      if (editSection === "summary") {
        updatedStudentProfile.profileSummary = editData.profileSummary;
      } else if (editSection === "skills") {
        updatedStudentProfile.skills = editData.skills.split(",").map(s => s.trim()).filter(s => s);
      } else if (editSection === "preferences") {
        updatedStudentProfile.careerPreferences = { ...updatedStudentProfile.careerPreferences, ...editData };
      }
      // Add other sections as necessary...

      const res = await profileAPI.update({ studentProfile: updatedStudentProfile });
      setProfile(res.user);
      setEditSection(null);
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (section) => {
    setEditSection(section);
    // Pre-populate editData
    if (section === "summary") {
      setEditData({ profileSummary: profile?.studentProfile?.profileSummary || "" });
    } else if (section === "skills") {
      setEditData({ skills: profile?.studentProfile?.skills?.join(", ") || "" });
    } else if (section === "preferences") {
      setEditData(profile?.studentProfile?.careerPreferences || {});
    }
  };

  const handleUploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setSaving(true);
      const res = await profileAPI.uploadResume(file);
      setProfile(res.user);
      alert("Resume uploaded successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const openBasicInfoModal = () => {
    setBasicInfoForm({
      phone: profile.studentProfile?.contactInfo?.phone || "",
      location: profile.studentProfile?.contactInfo?.location || "",
      profilePic: null,
    });
    setShowBasicInfoModal(true);
  };

  const handleSaveBasicInfo = async () => {
    setSaving(true);
    try {
      if (basicInfoForm.profilePic) {
        // Upload picture first
        await profileAPI.uploadProfilePic(basicInfoForm.profilePic);
      }
      
      let updatedStudentProfile = { ...profile.studentProfile };
      updatedStudentProfile.contactInfo = {
        ...updatedStudentProfile.contactInfo,
        phone: basicInfoForm.phone,
        location: basicInfoForm.location,
      };

      const res = await profileAPI.update({ studentProfile: updatedStudentProfile });
      
      // We refetch the profile completely to ensure we get the updated profile pic URL securely from DB
      fetchProfile();
      setShowBasicInfoModal(false);
    } catch (err) {
      alert("Failed to update basic info: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderSectionEditFooter = () => (
    <div className="mt-3">
      <button className="btn btn-primary btn-sm me-2" onClick={handleUpdate} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
      <button className="btn btn-light btn-sm" onClick={() => setEditSection(null)} disabled={saving}>Cancel</button>
    </div>
  );

  if (loading) return <div className="p-5 text-center">Loading profile...</div>;
  if (!profile) return <div className="p-5 text-center text-danger">Failed to load profile.</div>;

  const sp = profile.studentProfile || {};

  return (
    <div className="container py-4 bg-light min-vh-100">
      <div className="row">
        {/* Left Sidebar Menu */}
        <div className="col-md-3 d-none d-md-block">
          <div className="card shadow-sm border-0 sticky-top rounded-4" style={{ top: "80px" }}>
            <div className="card-body p-0 py-2">
              <h6 className="px-4 py-2 mb-0 text-muted fw-bold">Quick Links</h6>
              <div className="list-group list-group-flush">
                <button onClick={() => scrollToSection('preferences')} className="list-group-item list-group-item-action border-0 px-4">Preferences</button>
                <button onClick={() => scrollToSection('education')} className="list-group-item list-group-item-action border-0 px-4">Education</button>
                <button onClick={() => scrollToSection('skills')} className="list-group-item list-group-item-action border-0 px-4">Key Skills</button>
                <button onClick={() => scrollToSection('summary')} className="list-group-item list-group-item-action border-0 px-4">Profile Summary</button>
                <button onClick={() => scrollToSection('resume')} className="list-group-item list-group-item-action border-0 px-4">Resume</button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          
          {/* Top Profile Card */}
          <div className="card shadow-sm mb-4 border-0 rounded-4 overflow-hidden">
            <div className="bg-primary text-white p-4" style={{ height: "120px" }}></div>
            <div className="card-body position-relative px-4 pb-4 px-md-5">
              <div className="d-flex justify-content-between align-items-end mb-3" style={{ marginTop: "-60px" }}>
                 {sp.profilePic ? (
                   <img 
                     src={sp.profilePic} 
                     alt={profile.name} 
                     className="rounded-circle shadow-sm" 
                     style={{ width: "100px", height: "100px", objectFit: "cover", border: "4px solid white" }}
                   />
                 ) : (
                   <div 
                     className="rounded-circle bg-white border d-flex justify-content-center align-items-center shadow-sm"
                     style={{ width: "100px", height: "100px", fontSize: "2.5rem", color: "var(--primary-color)" }}
                   >
                     {profile.name?.[0]?.toUpperCase()}
                   </div>
                 )}
                 <button className="btn btn-outline-primary btn-sm" onClick={openBasicInfoModal}>
                   <i className="bi bi-pencil me-1"></i> Edit Basic Info
                 </button>
              </div>
              <h3 className="fw-bold mb-1">{profile.name}</h3>
              <p className="text-muted mb-2"><i className="bi bi-envelope me-2"></i>{profile.email}</p>
              <div className="d-flex gap-4 text-muted small mt-3">
                <span title="Location"><i className="bi bi-geo-alt me-1"></i>{sp.contactInfo?.location || "Add Location"}</span>
                <span title="Phone"><i className="bi bi-phone me-1"></i>{sp.contactInfo?.phone || "Add Phone"}</span>
              </div>
            </div>
          </div>

          {/* Resume Section */}
          <div id="resume">
            <ProfileSection title="Resume" editLabel="Update">
              <div className="border border-dashed rounded p-4 text-center">
                {sp.resume?.url ? (
                  <div className="d-flex flex-column align-items-center">
                     <i className="bi bi-file-earmark-pdf fs-1 text-danger mb-2"></i>
                     <a href={sp.resume.url} target="_blank" rel="noreferrer" className="fw-bold">{sp.resume.filename}</a>
                     <div className="mt-3">
                       <input type="file" id="resume-upload" className="d-none" onChange={handleUploadResume} accept=".pdf,.doc,.docx" />
                       <label htmlFor="resume-upload" className="btn btn-outline-primary btn-sm mx-1">
                         {saving ? "Uploading..." : "Replace File"}
                       </label>
                     </div>
                  </div>
                ) : (
                  <div>
                    <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-2 d-block"></i>
                    <p className="text-muted mb-3">Upload your resume to increase your chances of being hired.</p>
                    <input type="file" id="resume-upload" className="d-none" onChange={handleUploadResume} accept=".pdf,.doc,.docx" />
                    <label htmlFor="resume-upload" className="btn btn-primary">
                      {saving ? "Uploading..." : "Upload Resume"}
                    </label>
                    <div className="form-text mt-2">Supported formats: PDF, DOC, DOCX. Max size: 5MB</div>
                  </div>
                )}
              </div>
            </ProfileSection>
          </div>

          {/* Profile Summary */}
          <div id="summary">
            <ProfileSection title="Profile Summary" onEdit={editSection !== "summary" ? () => startEdit("summary") : undefined}>
              {editSection === "summary" ? (
                <div>
                  <textarea 
                    className="form-control" 
                    rows="4" 
                    value={editData.profileSummary}
                    onChange={(e) => setEditData({...editData, profileSummary: e.target.value})}
                    placeholder="Write a strong summary emphasizing your skills and experience... (Aim for 100-250 words)"
                  ></textarea>
                  {renderSectionEditFooter()}
                </div>
              ) : (
                <p className="mb-0 text-muted" style={{ whiteSpace: "pre-wrap" }}>
                  {sp.profileSummary ? sp.profileSummary : <span className="text-primary cursor-pointer border-bottom border-primary pb-1" onClick={() => startEdit("summary")}>Add Profile Summary</span>}
                </p>
              )}
            </ProfileSection>
          </div>

          {/* Key Skills */}
          <div id="skills">
            <ProfileSection title="Key Skills" onEdit={editSection !== "skills" ? () => startEdit("skills") : undefined}>
              {editSection === "skills" ? (
                <div>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editData.skills}
                    onChange={(e) => setEditData({...editData, skills: e.target.value})}
                    placeholder="e.g. React, Node.js, Python (comma separated)"
                  />
                  <div className="form-text">Separate skills with commas</div>
                  {renderSectionEditFooter()}
                </div>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {sp.skills && sp.skills.length > 0 ? (
                    sp.skills.map((skill, i) => (
                      <span key={i} className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-normal">{skill}</span>
                    ))
                  ) : (
                    <span className="text-primary cursor-pointer border-bottom border-primary pb-1" onClick={() => startEdit("skills")}>Add Key Skills</span>
                  )}
                </div>
              )}
            </ProfileSection>
          </div>
          
          {/* Career Preferences */}
          <div id="preferences">
            <ProfileSection title="Career Preferences" onEdit={editSection !== "preferences" ? () => startEdit("preferences") : undefined}>
              {editSection === "preferences" ? (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Preferred Job Type</label>
                    <select className="form-select" value={editData.preferredJobType || ""} onChange={(e) => setEditData({...editData, preferredJobType: e.target.value})}>
                      <option value="">Select...</option>
                      <option value="Internship">Internship</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Availability</label>
                    <select className="form-select" value={editData.availability || ""} onChange={(e) => setEditData({...editData, availability: e.target.value})}>
                       <option value="">Select...</option>
                       <option value="Immediate">Immediate</option>
                       <option value="Within 1 Month">Within 1 Month</option>
                       <option value="Within 3 Months">Within 3 Months</option>
                    </select>
                  </div>
                  {renderSectionEditFooter()}
                </div>
              ) : (
                <div className="row g-3">
                  <div className="col-sm-6">
                    <div className="fw-bold text-dark">Preferred Job Type</div>
                    <div className="text-muted">{sp.careerPreferences?.preferredJobType || "Not specified"}</div>
                  </div>
                  <div className="col-sm-6">
                    <div className="fw-bold text-dark">Availability</div>
                    <div className="text-muted">{sp.careerPreferences?.availability || "Not specified"}</div>
                  </div>
                </div>
              )}
            </ProfileSection>
          </div>

          {/* Education - Simplified for demonstration */}
          <div id="education">
            <ProfileSection title="Education" editLabel="Add Education">
               {sp.education && sp.education.length > 0 ? (
                 sp.education.map((edu, i) => (
                   <div key={i} className="mb-3 pb-3 border-bottom">
                     <h6 className="fw-bold mb-1">{edu.qualification} in {edu.specialization}</h6>
                     <div className="text-muted">{edu.institute}</div>
                     <div className="text-muted small mt-1">{edu.startYear} - {edu.endYear} | Score: {edu.score}</div>
                   </div>
                 ))
               ) : (
                 <p className="text-muted mb-0">No education details added yet.</p>
               )}
            </ProfileSection>
          </div>

        </div>
      </div>

      {/* Basic Info Modal */}
      {showBasicInfoModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Edit Basic Info</h5>
                <button type="button" className="btn-close" onClick={() => setShowBasicInfoModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                
                <div className="mb-4 text-center">
                  <div className="mb-2">
                     {basicInfoForm.profilePic ? (
                       <img src={URL.createObjectURL(basicInfoForm.profilePic)} alt="Preview" className="rounded-circle border" style={{ width: "80px", height: "80px", objectFit: "cover" }} />
                     ) : sp.profilePic ? (
                       <img src={sp.profilePic} alt="Current" className="rounded-circle border" style={{ width: "80px", height: "80px", objectFit: "cover" }} />
                     ) : (
                       <div className="rounded-circle bg-light border d-inline-flex justify-content-center align-items-center text-secondary" style={{ width: "80px", height: "80px", fontSize: "2rem" }}>
                         <i className="bi bi-camera"></i>
                       </div>
                     )}
                  </div>
                  <input 
                    type="file" 
                    id="profile-pic-upload" 
                    className="d-none" 
                    accept="image/*" 
                    onChange={(e) => setBasicInfoForm({...basicInfoForm, profilePic: e.target.files[0]})} 
                  />
                  <label htmlFor="profile-pic-upload" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                    Change Picture
                  </label>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold text-uppercase mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={basicInfoForm.phone} 
                    onChange={(e) => setBasicInfoForm({...basicInfoForm, phone: e.target.value})}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold text-uppercase mb-1">Location</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={basicInfoForm.location} 
                    onChange={(e) => setBasicInfoForm({...basicInfoForm, location: e.target.value})}
                    placeholder="e.g. Mumbai, India"
                  />
                </div>
                
              </div>
              <div className="modal-footer border-0 pt-0 justify-content-start">
                <button type="button" className="btn btn-primary" onClick={handleSaveBasicInfo} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="btn btn-light" onClick={() => setShowBasicInfoModal(false)} disabled={saving}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
