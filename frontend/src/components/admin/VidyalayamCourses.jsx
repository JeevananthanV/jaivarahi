import React, { useEffect, useState } from 'react';
import { 
  GraduationCap, Plus, Edit2, Trash2, CheckCircle2, 
  XCircle, RefreshCw, AlertCircle, Calendar, Users
} from 'lucide-react';
import { 
  getVidyalayamCourses, 
  saveAdminCourse, 
  deleteAdminCourse 
} from '../../api/vidyalayamApi';

const VidyalayamCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCourse, setEditingCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formData, setFormData] = useState({
    course_code: '',
    title: '',
    title_ta: '',
    level: 'Beginner',
    duration: '3 Months',
    mode: 'Online & Weekend Katpadi Classes',
    fee: 4500,
    max_seats: 30,
    enrolled_seats: 0,
    syllabus: '',
    instructor: 'Swamy Pallur Varahidhasan',
    next_batch_date: '01 June 2027',
    is_active: 1
  });

  const fetchCourses = async () => {
    try {
      setError('');
      const res = await getVidyalayamCourses();
      if (res && res.courses) {
        setCourses(res.courses);
      }
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      course_code: 'SVJV-C' + Math.floor(10 + Math.random() * 90),
      title: '',
      title_ta: '',
      level: 'Beginner',
      duration: '3 Months',
      mode: 'Online & Weekend Katpadi Classes',
      fee: 5000,
      max_seats: 30,
      enrolled_seats: 0,
      syllabus: '',
      instructor: 'Swamy Pallur Varahidhasan',
      next_batch_date: '01 July 2027',
      is_active: 1
    });
    setShowModal(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code,
      title: course.title,
      title_ta: course.title_ta || '',
      level: course.level || 'Beginner',
      duration: course.duration || '3 Months',
      mode: course.mode || 'Online',
      fee: course.fee || 0,
      max_seats: course.max_seats || 30,
      enrolled_seats: course.enrolled_seats || 0,
      syllabus: course.syllabus || '',
      instructor: course.instructor || 'Swamy Pallur Varahidhasan',
      next_batch_date: course.next_batch_date || '',
      is_active: course.is_active ? 1 : 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate/delete this course?')) return;
    try {
      await deleteAdminCourse(id);
      fetchCourses();
    } catch (err) {
      alert(err.message || 'Failed to delete course');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await saveAdminCourse(formData, editingCourse ? editingCourse.id : null);
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      alert(err.message || 'Failed to save course');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="admin-page" style={{ padding: '1.5rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--maroon-dark, #4a0914)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={26} color="#d4a017" />
            Courses &amp; Batches Management
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Manage Curriculum, Tuition Fees, Seat Quotas, and Batch Start Dates
          </p>
        </div>

        <button 
          onClick={handleOpenAdd} 
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
        >
          <Plus size={16} /> Add New Course
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin" style={{ color: 'var(--maroon)' }} />
          <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Loading courses...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <AlertCircle size={18} /> {error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {courses.map((course) => {
            const rem = Math.max(0, course.max_seats - course.enrolled_seats);
            return (
              <div key={course.id} className="card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {course.course_code}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(course)}
                      style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#334155' }}
                      title="Edit Course"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(course.id)}
                      style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#b91c1c' }}
                      title="Delete Course"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#1e293b' }}>
                  {course.title}
                </h3>
                {course.title_ta && (
                  <p style={{ margin: '0 0 0.75rem', color: '#b45309', fontSize: '0.85rem', fontWeight: 500 }}>
                    {course.title_ta}
                  </p>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', margin: '0.75rem 0', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                  <div><strong>Level:</strong> {course.level}</div>
                  <div><strong>Duration:</strong> {course.duration}</div>
                  <div><strong>Tuition:</strong> ₹{Number(course.fee).toLocaleString('en-IN')}</div>
                  <div><strong>Mode:</strong> {course.mode}</div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Starts:</strong> {course.next_batch_date || 'Upcoming'}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} color="#64748b" />
                    <span><strong>{course.enrolled_seats}</strong> / {course.max_seats} Enrolled</span>
                  </div>
                  <span style={{ fontWeight: 700, color: rem <= 5 ? '#dc2626' : '#166534' }}>
                    {rem} Seats Available
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '650px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#5b0f1a', color: '#fff', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                {editingCourse ? 'Edit Course' : 'Create New Vidyalayam Course'}
              </h3>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Course Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Mastery">Mastery</option>
                    <option value="Specialized">Specialized</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Course Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Course Title (Tamil)</label>
                  <input
                    type="text"
                    value={formData.title_ta}
                    onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 3 Months / 6 Months"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Tuition Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Max Seats Limit *</label>
                  <input
                    type="number"
                    required
                    value={formData.max_seats}
                    onChange={(e) => setFormData({ ...formData, max_seats: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Enrolled Seats</label>
                  <input
                    type="number"
                    value={formData.enrolled_seats}
                    onChange={(e) => setFormData({ ...formData, enrolled_seats: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Next Batch Date</label>
                  <input
                    type="text"
                    value={formData.next_batch_date}
                    onChange={(e) => setFormData({ ...formData, next_batch_date: e.target.value })}
                    placeholder="e.g. 15 June 2027"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Syllabus Highlights</label>
                  <textarea
                    rows="3"
                    value={formData.syllabus}
                    onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  ></textarea>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saveLoading}
                >
                  {saveLoading ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VidyalayamCourses;

