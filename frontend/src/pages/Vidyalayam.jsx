import React, { useState, useEffect } from 'react';
import SeoEnhanced from '../components/common/SeoEnhanced.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx';
import '../assets/css/vidyalayam.css';
import {
  getVidyalayamCourses,
  getVidyalayamAnnouncements,
  verifyVidyalayamCertificate,
  submitVidyalayamAdmission,
  subscribeVidyalayamRealtime
} from '../api/vidyalayamApi.js';

const Vidyalayam = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);

  // Certificate Verification state
  const [certInput, setCertInput] = useState('');
  const [certLoading, setCertLoading] = useState(false);
  const [certResult, setCertResult] = useState(null);
  const [certError, setCertError] = useState('');

  // Admission Modal state
  const [selectedCourseForModal, setSelectedCourseForModal] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(null);
  const [applyError, setApplyError] = useState('');
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    whatsapp: '',
    gender: 'Male',
    dob: '',
    qualification: '',
    occupation: '',
    city: '',
    address: '',
    studyMode: 'Online Live',
    notes: ''
  });

  // Load initial data
  const loadData = async () => {
    try {
      const [coursesRes, annRes] = await Promise.all([
        getVidyalayamCourses(),
        getVidyalayamAnnouncements()
      ]);
      if (coursesRes && coursesRes.courses) {
        setCourses(coursesRes.courses);
      }
      if (annRes && annRes.announcements) {
        setAnnouncements(annRes.announcements);
      }
    } catch (err) {
      console.error('Error loading vidyalayam data:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to public Real-time SSE
    const unsubscribe = subscribeVidyalayamRealtime((event) => {
      setSseConnected(true);
      if (event.type === 'NEW_ADMISSION' || event.type === 'SEAT_UPDATE') {
        // Increment course enrolled count or update remaining seats live
        setCourses((prev) =>
          prev.map((c) => {
            if (c.id === event.data.courseId) {
              const updatedEnrolled = event.data.enrolledSeats !== undefined 
                ? event.data.enrolledSeats 
                : c.enrolled_seats + 1;
              return {
                ...c,
                enrolled_seats: updatedEnrolled,
                remaining_seats: Math.max(0, c.max_seats - updatedEnrolled)
              };
            }
            return c;
          })
        );
      } else if (event.type === 'COURSE_UPDATE') {
        loadData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleVerify = async (e, sampleCode = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = sampleCode || certInput;
    if (!query.trim()) {
      setCertError('Please enter a valid Certificate or Roll number');
      setCertResult(null);
      return;
    }

    setCertLoading(true);
    setCertError('');
    setCertResult(null);

    try {
      const res = await verifyVidyalayamCertificate(query);
      if (res && res.valid) {
        setCertResult(res.certificate);
      } else {
        setCertError(res.message || 'No record found. Please verify the number entered.');
      }
    } catch (err) {
      setCertError('Verification service is temporarily unreachable.');
    } finally {
      setCertLoading(false);
    }
  };

  const openModal = (course) => {
    setSelectedCourseForModal(course);
    setApplySuccess(null);
    setApplyError('');
    setShowApplyModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.email || !formData.phone) {
      setApplyError('Please fill in student name, email, and mobile phone.');
      return;
    }

    setApplySubmitting(true);
    setApplyError('');

    try {
      const payload = {
        courseId: selectedCourseForModal.id,
        studentName: formData.studentName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob || null,
        qualification: formData.qualification,
        occupation: formData.occupation,
        address: formData.address,
        city: formData.city,
        preferredBatch: formData.studyMode,
        notes: formData.notes
      };

      const result = await submitVidyalayamAdmission(payload);
      if (result && result.ok) {
        setApplySuccess(result);
        // Refresh local seats count
        setCourses((prev) =>
          prev.map((c) =>
            c.id === selectedCourseForModal.id
              ? {
                  ...c,
                  enrolled_seats: c.enrolled_seats + 1,
                  remaining_seats: Math.max(0, c.remaining_seats - 1)
                }
              : c
          )
        );
      } else {
        setApplyError(result.error || 'Failed to submit application.');
      }
    } catch (err) {
      setApplyError(err.message || 'Error communicating with admissions server.');
    } finally {
      setApplySubmitting(false);
    }
  };

  return (
    <>
      <SeoEnhanced
        title="Sri Varahi Jothida Vidyalayam | Vedic Astrology Academy Katpadi Vellore"
        description="Learn authentic Vedic Astrology, Prasannam, KP System, and Varahi Upasana from Swamy Pallur Varahidhasan at Sri Varahi Jothida Vidyalayam, Katpadi Vellore."
        canonicalUrl="/vidyalayam"
      />

      <Navbar onOpenMobile={() => setIsMobileOpen(true)} />
      <MobileNav isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      <main className="sv-page">
        {/* Hero Section */}
        <section className="sv-hero">
          <div className="sv-hero-inner">
            <div className="sv-live-badge">
              <span className="sv-pulse-dot"></span>
              {sseConnected ? 'Real-Time Admissions & Batch Status Active' : 'Admissions Open for 2027 Batches'}
            </div>

            <div className="sv-hero-title-ta">ஸ்ரீ வாராஹி ஜோதிட வித்யாலயம்</div>
            <h1 className="sv-hero-title-en">Sri Varahi Jothida Vidyalayam</h1>

            <p className="sv-hero-desc">
              Preserving and imparting authentic Vedic Astrology, Horary Prasannam, KP System, 
              and Divine Varahi Upasana under the direct sacred guidance of <strong>Swamy Pallur Varahidhasan</strong> at Jai Varahi Peedam, Katpadi, Vellore.
            </p>

            <div className="sv-hero-actions">
              <a href="#courses" className="sv-btn-primary">
                <i className="fas fa-graduation-cap"></i> View Certified Courses
              </a>
              <a href="#verify" className="sv-btn-secondary">
                <i className="fas fa-certificate"></i> Verify Certificate
              </a>
              <a href="tel:+919092878389" className="sv-btn-secondary">
                <i className="fas fa-phone-alt"></i> Academy Helpline
              </a>
            </div>

            {/* Live Stats Row */}
            <div className="sv-stats-row">
              <div className="sv-stat-card">
                <h3>{courses.length || 5}</h3>
                <p>Specialized Courses</p>
              </div>
              <div className="sv-stat-card">
                <h3>1,200+</h3>
                <p>Graduated Astrologers</p>
              </div>
              <div className="sv-stat-card">
                <h3>100%</h3>
                <p>Guru-Shishya Authenticity</p>
              </div>
              <div className="sv-stat-card">
                <h3>Katpadi &amp; Online</h3>
                <p>Dual Learning Mode</p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Announcements Bar */}
        {announcements.length > 0 && (
          <div className="sv-announcements-bar">
            <div className="sv-announcements-inner">
              <span className="sv-ann-badge">ANNOUNCEMENT</span>
              <p className="sv-ann-ticker">
                <i className="fas fa-bullhorn" style={{ marginRight: '6px' }}></i>
                <strong>{announcements[0].title}:</strong> {announcements[0].content}
              </p>
            </div>
          </div>
        )}

        {/* Heritage Section */}
        <section className="sv-section" id="about">
          <div className="sv-section-header">
            <span className="sv-sub-tag">Guru-Shishya Parampara</span>
            <h2 className="sv-section-title">Sacred Knowledge for the Modern World</h2>
            <p className="sv-section-subtitle">
              Astrology is not superstition; it is the eye of the Vedas (Vedanga Jyotisha). Under the divine grace of Goddess Sri Maha Varahi, our academy prepares principled, highly accurate astrologers capable of illuminating life paths with clarity and spiritual remedies.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: 'var(--sv-shadow)' }}>
              <div style={{ width: '48px', height: '48px', background: '#fef3c7', color: '#b45309', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '1rem' }}>
                <i className="fas fa-scroll"></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#5b0f1a' }}>Parashara &amp; Jaimini Mastery</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Master classical planetary combinations, Shadbala analysis, Vimshottari and Chara Dashas, and transit impacts step-by-step with practical real horoscope charts.
              </p>
            </div>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: 'var(--sv-shadow)' }}>
              <div style={{ width: '48px', height: '48px', background: '#fef3c7', color: '#b45309', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '1rem' }}>
                <i className="fas fa-compass"></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#5b0f1a' }}>Ashta Mangala &amp; KP Horary</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Gain pinpoint accuracy for immediate queries using traditional Chozhi Prasannam, Jamakkol Arudam, and the modern Krishnamurti Padhdhati (KP) sub-lord system.
              </p>
            </div>

            <div style={{ background: '#fff', padding: '2rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: 'var(--sv-shadow)' }}>
              <div style={{ width: '48px', height: '48px', background: '#fef3c7', color: '#b45309', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '1rem' }}>
                <i className="fas fa-om"></i>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#5b0f1a' }}>Varahi Upasana &amp; Pariharams</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                Learn divine remedial measures including authentic Bija mantras, sacred yantra consecration, Navagraha homam procedures, and karmic mitigation rituals.
              </p>
            </div>
          </div>
        </section>

        {/* Courses Section with Real-Time Remaining Seats */}
        <section className="sv-section" id="courses">
          <div className="sv-section-header">
            <span className="sv-sub-tag">Academic Admissions 2027</span>
            <h2 className="sv-section-title">Courses &amp; Certification Batches</h2>
            <p className="sv-section-subtitle">
              Live seat counters dynamically sync with academy admissions in real-time. Secure your seat early for hands-on mentorship.
            </p>
          </div>

          {loadingCourses ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#5b0f1a' }}></i>
              <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading active courses...</p>
            </div>
          ) : (
            <div className="sv-courses-grid">
              {courses.map((course) => {
                const rem = course.remaining_seats !== undefined ? course.remaining_seats : (course.max_seats - course.enrolled_seats);
                const isFull = rem <= 0;
                const isFillingFast = rem > 0 && rem <= 12;

                return (
                  <div key={course.id} className="sv-course-card">
                    <div className="sv-course-header">
                      <div className="sv-course-badges">
                        <span className="sv-code-pill">{course.course_code}</span>
                        <span className={`sv-seat-badge ${isFull ? 'full' : isFillingFast ? 'filling' : 'open'}`}>
                          <i className={`fas ${isFull ? 'fa-ban' : isFillingFast ? 'fa-fire' : 'fa-check-circle'}`}></i>
                          {isFull ? 'Batch Full' : `${rem} Seats Left`}
                        </span>
                      </div>
                      <h3 className="sv-course-title">{course.title}</h3>
                      {course.title_ta && <p className="sv-course-title-ta">{course.title_ta}</p>}
                    </div>

                    <div className="sv-course-body">
                      <div className="sv-meta-row">
                        <div className="sv-meta-item">
                          <i className="fas fa-clock"></i>
                          <span>{course.duration}</span>
                        </div>
                        <div className="sv-meta-item">
                          <i className="fas fa-layer-group"></i>
                          <span>{course.level}</span>
                        </div>
                        <div className="sv-meta-item" style={{ gridColumn: '1 / -1' }}>
                          <i className="fas fa-video"></i>
                          <span>{course.mode}</span>
                        </div>
                        <div className="sv-meta-item" style={{ gridColumn: '1 / -1' }}>
                          <i className="fas fa-calendar-alt"></i>
                          <span>Starts: <strong>{course.next_batch_date || 'Enrolling Now'}</strong></span>
                        </div>
                      </div>

                      <div className="sv-syllabus-box">
                        <div className="sv-syllabus-title">
                          <i className="fas fa-book-open"></i> Syllabus Highlights:
                        </div>
                        <div>{course.syllabus}</div>
                      </div>

                      <div className="sv-course-footer">
                        <div>
                          <span className="sv-fee-label">Tuition Fee</span>
                          <span className="sv-fee-amount">₹{Number(course.fee).toLocaleString('en-IN')}</span>
                        </div>
                        <button
                          type="button"
                          className="sv-btn-primary"
                          disabled={isFull}
                          onClick={() => openModal(course)}
                          style={{ opacity: isFull ? 0.6 : 1, cursor: isFull ? 'not-allowed' : 'pointer' }}
                        >
                          {isFull ? 'Waitlist' : 'Apply Online'} <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Certificate Verification Tool */}
        <section className="sv-section" id="verify">
          <div className="sv-verify-section">
            <div className="sv-section-header" style={{ marginBottom: '1.75rem' }}>
              <span className="sv-sub-tag">Academic Registry &amp; Verification</span>
              <h2 className="sv-section-title">Verify Vidyalayam Certificate</h2>
              <p className="sv-section-subtitle">
                Enter an official Certificate ID or Student Roll Number to verify authenticity and transcript details from our permanent institutional ledger.
              </p>
            </div>

            <form onSubmit={handleVerify} className="sv-verify-form">
              <input
                type="text"
                placeholder="e.g. SVJV-CERT-2026-0042 or SVJV-ROLL-2401"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="sv-verify-input"
              />
              <button type="submit" className="sv-btn-primary" disabled={certLoading}>
                {certLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Verifying...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search"></i> Verify Now
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
              <span>Try Sample Registrations: </span>
              <button
                type="button"
                onClick={() => {
                  setCertInput('SVJV-CERT-2026-0042');
                  handleVerify(null, 'SVJV-CERT-2026-0042');
                }}
                style={{ background: 'none', border: 'none', color: '#5b0f1a', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, marginRight: '10px' }}
              >
                SVJV-CERT-2026-0042
              </button>
              <button
                type="button"
                onClick={() => {
                  setCertInput('SVJV-ROLL-2401');
                  handleVerify(null, 'SVJV-ROLL-2401');
                }}
                style={{ background: 'none', border: 'none', color: '#5b0f1a', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
              >
                SVJV-ROLL-2401
              </button>
            </div>

            {certError && (
              <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1rem', background: '#fee2e2', border: '1px solid #f87171', borderRadius: '8px', color: '#991b1b', textAlign: 'center', fontSize: '0.9rem' }}>
                <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }}></i>
                {certError}
              </div>
            )}

            {certResult && (
              <div className="sv-cert-result-card">
                <div className="sv-cert-header">
                  <div className="sv-verified-pill">
                    <i className="fas fa-shield-alt"></i> Officially Verified Institutional Credential
                  </div>
                  <h3 style={{ margin: '0.5rem 0 0.25rem', color: '#5b0f1a', fontSize: '1.4rem' }}>
                    {certResult.student_name}
                  </h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                    {certResult.course_name} ({certResult.course_code})
                  </p>
                </div>

                <div className="sv-cert-details-grid">
                  <div>
                    <span className="sv-cert-field-label">Certificate Number</span>
                    <span className="sv-cert-field-val" style={{ fontFamily: 'monospace' }}>
                      {certResult.certificate_no}
                    </span>
                  </div>
                  <div>
                    <span className="sv-cert-field-label">Student Roll No</span>
                    <span className="sv-cert-field-val" style={{ fontFamily: 'monospace' }}>
                      {certResult.roll_no}
                    </span>
                  </div>
                  <div>
                    <span className="sv-cert-field-label">Grade / Distinction</span>
                    <span className="sv-cert-field-val" style={{ color: '#166534' }}>
                      {certResult.grade}
                    </span>
                  </div>
                  <div>
                    <span className="sv-cert-field-label">Issue Date</span>
                    <span className="sv-cert-field-val">
                      {new Date(certResult.issue_date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span className="sv-cert-field-label">Authorizing Signatory</span>
                    <span className="sv-cert-field-val">{certResult.signatory}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  Sri Varahi Jothida Vidyalayam • Jai Varahi Peedam, Katpadi, Vellore • Official Registry Record
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Location & Contact Section */}
        <section className="sv-section" style={{ paddingTop: 0 }}>
          <div style={{ background: '#5b0f1a', color: '#fff', borderRadius: '20px', padding: '3.5rem 2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1rem', color: '#fef08a' }}>
              Study at the Katpadi Ashram or Online Worldwide
            </h2>
            <p style={{ maxWidth: '680px', margin: '0 auto 2rem', color: '#fde68a', fontSize: '1.1rem', lineHeight: 1.6 }}>
              Whether you are an aspiring astrologer or a practicing consultant looking to master Prasannam and Upasana, Sri Varahi Jothida Vidyalayam welcomes you into its sacred lineage.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <a href="tel:+919092878389" className="sv-btn-primary">
                <i className="fas fa-phone-alt"></i> Call +91 9092878389
              </a>
              <a href="https://maps.google.com/?q=Sri+Varahi+Jothida+Vidyalayam" target="_blank" rel="noopener noreferrer" className="sv-btn-secondary">
                <i className="fas fa-map-marker-alt"></i> Google Maps Katpadi
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Admission Application Modal */}
      {showApplyModal && (
        <div className="sv-modal-backdrop" onClick={(e) => {
          if (e.target === e.currentTarget) setShowApplyModal(false);
        }}>
          <div className="sv-modal">
            <div className="sv-modal-header">
              <h3>
                {applySuccess ? 'Application Confirmed' : `Admission: ${selectedCourseForModal?.title}`}
              </h3>
              <button type="button" className="sv-modal-close" onClick={() => setShowApplyModal(false)}>
                &times;
              </button>
            </div>

            <div className="sv-modal-body">
              {applySuccess ? (
                <div className="sv-success-box">
                  <div className="sv-success-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#5b0f1a', margin: '0 0 0.5rem' }}>
                    Application Submitted Successfully!
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                    Your application has been received into the official Sri Varahi Jothida Vidyalayam student ledger.
                  </p>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>
                      Application Reference Number
                    </span>
                    <div className="sv-app-ref">{applySuccess.application_no}</div>
                  </div>
                  <p style={{ color: '#334155', fontSize: '0.9rem' }}>
                    Course: <strong>{applySuccess.courseTitle}</strong> <br />
                    Tuition Fee: <strong>₹{Number(applySuccess.fee).toLocaleString('en-IN')}</strong>
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    Our admissions office will reach out to you via Phone and WhatsApp with your orientation schedule and payment details.
                  </p>
                  <button
                    type="button"
                    className="sv-btn-primary"
                    onClick={() => setShowApplyModal(false)}
                    style={{ marginTop: '1rem' }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit}>
                  {applyError && (
                    <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      <i className="fas fa-exclamation-circle" style={{ marginRight: '6px' }}></i>
                      {applyError}
                    </div>
                  )}

                  <div className="sv-form-grid">
                    <div className="sv-form-group full-width">
                      <label className="sv-label">Selected Course</label>
                      <input
                        type="text"
                        disabled
                        value={`${selectedCourseForModal?.title} (${selectedCourseForModal?.course_code}) — ₹${Number(selectedCourseForModal?.fee).toLocaleString('en-IN')}`}
                        className="sv-input"
                        style={{ background: '#f8fafc', fontWeight: 600 }}
                      />
                    </div>

                    <div className="sv-form-group">
                      <label className="sv-label">Full Name *</label>
                      <input
                        type="text"
                        name="studentName"
                        required
                        value={formData.studentName}
                        onChange={handleFormChange}
                        placeholder="As per legal records"
                        className="sv-input"
                      />
                    </div>

                    <div className="sv-form-group">
                      <label className="sv-label">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleFormChange} className="sv-select">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="sv-form-group">
                      <label className="sv-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="e.g. name@example.com"
                        className="sv-input"
                      />
                    </div>

                    <div className="sv-form-group">
                      <label className="sv-label">Mobile Phone (Calling &amp; WhatsApp) *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="e.g. 9876543210"
                        className="sv-input"
                      />
                    </div>

                    <div className="sv-form-group">
                      <label className="sv-label">City / Town</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleFormChange}
                        placeholder="e.g. Chennai / Vellore / Bangalore"
                        className="sv-input"
                      />
                    </div>

                    <div className="sv-form-group">
                      <label className="sv-label">Preferred Study Mode</label>
                      <select name="studyMode" value={formData.studyMode} onChange={handleFormChange} className="sv-select">
                        <option value="Online Live">Online Interactive Live Classes</option>
                        <option value="Weekend Katpadi Classes">Weekend Direct Classes at Katpadi Peedam</option>
                        <option value="Hybrid">Hybrid (Online + Monthly Workshop)</option>
                      </select>
                    </div>

                    <div className="sv-form-group full-width">
                      <label className="sv-label">Prior Astrology Knowledge &amp; Spiritual Background</label>
                      <textarea
                        name="notes"
                        rows="3"
                        value={formData.notes}
                        onChange={handleFormChange}
                        placeholder="Tell us briefly about any past astrology reading, books studied, or your spiritual motivation..."
                        className="sv-textarea"
                      ></textarea>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="sv-btn-secondary"
                      style={{ color: '#475569', borderColor: '#cbd5e1' }}
                      onClick={() => setShowApplyModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="sv-btn-primary" disabled={applySubmitting}>
                      {applySubmitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Submitting...
                        </>
                      ) : (
                        <>
                          Submit Admission Application <i className="fas fa-check"></i>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <FloatActions />
      <Footer />
    </>
  );
};

export default Vidyalayam;

