import React, { useState, useEffect } from 'react';
import { getAdminCows, addAdminCow, updateAdminCow, deleteAdminCow } from '../../../api/kosalaApi.js';
import { FALLBACK_COWS } from '../../../data/kosalaFallbackData.js';

const CowManagement = () => {
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCow, setEditingCow] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [tagNumber, setTagNumber] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [story, setStory] = useState('');
  const [healthStatus, setHealthStatus] = useState('Vaccinated & Healthy');
  const [sponsorshipStatus, setSponsorshipStatus] = useState('available');

  const fetchCows = async () => {
    setLoading(true);
    try {
      const res = await getAdminCows();
      if (res?.success && res.cows?.length > 0) {
        setCows(res.cows);
        setIsFallback(false);
      } else {
        setCows(FALLBACK_COWS);
        setIsFallback(true);
      }
    } catch (err) {
      console.warn('Error fetching cows, using fallback state:', err?.message);
      setCows(FALLBACK_COWS);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCows();
  }, []);

  const openAddModal = () => {
    setEditingCow(null);
    setName('');
    setTagNumber(`JVP-COW-${String(cows.length + 1).padStart(3, '0')}`);
    setBreed('Kangeyam Native');
    setAge('3 Years');
    setPhotoUrl('/assets/img/kosala/kosala_hero_bg.jpg');
    setStory('');
    setHealthStatus('Vaccinated & Healthy');
    setSponsorshipStatus('available');
    setShowModal(true);
  };

  const openEditModal = (cow) => {
    setEditingCow(cow);
    setName(cow.name || '');
    setTagNumber(cow.tag_number || '');
    setBreed(cow.breed || '');
    setAge(cow.age || '');
    setPhotoUrl(cow.photo_url || '');
    setStory(cow.story || '');
    setHealthStatus(cow.health_status || 'Vaccinated & Healthy');
    setSponsorshipStatus(cow.sponsorship_status || 'available');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      tag_number: tagNumber,
      breed,
      age,
      photo_url: photoUrl,
      story,
      health_status: healthStatus,
      sponsorship_status: sponsorshipStatus,
    };

    try {
      if (editingCow) {
        await updateAdminCow(editingCow.id, payload);
      } else {
        await addAdminCow(payload);
      }
      setShowModal(false);
      fetchCows();
    } catch (err) {
      alert('Failed to save cow profile: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this cow profile?')) return;
    try {
      await deleteAdminCow(id);
      fetchCows();
    } catch (err) {
      alert('Failed to delete cow: ' + err.message);
    }
  };

  if (loading && cows.length === 0) {
    return (
      <div className="admin-kosala-wrap admin-spinner-wrap">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-3">Loading Gomatha records...</div>
      </div>
    );
  }

  return (
    <div className="admin-kosala-wrap">
      {isFallback && (
        <div className="admin-fallback-banner">
          <div className="admin-fallback-info">
            <i className="fas fa-database admin-fallback-icon"></i>
            <div>
              <strong>Temple Fallback State Active:</strong> Showing verified temple Gomathas (Kamadhenu, Nandhini, Surabhi, etc.).
            </div>
          </div>
          <button
            type="button"
            className="btn-receipt-download"
            onClick={fetchCows}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt mr-1 ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? 'Reconnecting...' : 'Sync Live Database'}
          </button>
        </div>
      )}

      <div className="admin-kosala-header">
        <div>
          <h1 className="admin-kosala-title">பசுக்கள் மேலாண்மை (Goshala Cow Registry)</h1>
          <div className="cow-tag-mono">Catalog, ear-tag tracking, health records, and adoption status</div>
        </div>

        <button type="button" className="btn-hero-primary pgn-action-btn" onClick={openAddModal}>
          <i className="fas fa-plus mr-1"></i> Register New Gomatha
        </button>
      </div>

      <div className="admin-table-card">
        <div className="archive-table-container">
          <table className="archive-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Tag Number</th>
                <th>Cow Name</th>
                <th>Breed</th>
                <th>Age</th>
                <th>Health Status</th>
                <th>Adoption Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="archive-loading-state">
                    <i className="fas fa-spinner fa-spin archive-loading-icon"></i>
                    <p className="archive-loading-text">Loading Cow Registry...</p>
                  </td>
                </tr>
              ) : cows.length > 0 ? (
                cows.map((cow) => (
                  <tr key={cow.id}>
                    <td>
                      <img
                        src={cow.photo_url || '/assets/img/kosala/kosala_hero_bg.jpg'}
                        alt={cow.name}
                        className="stat-icon cow-icon cow-profile-photo"
                      />
                    </td>
                    <td>
                      <span className="receipt-code-mono">{cow.tag_number || `JVP-COW-${cow.id}`}</span>
                    </td>
                    <td><strong>{cow.name}</strong></td>
                    <td>{cow.breed}</td>
                    <td>{cow.age}</td>
                    <td>
                      <span className="cow-health-badge">
                        <i className="fas fa-check-circle cow-health-icon"></i>
                        {cow.health_status || 'Healthy'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-category ${cow.sponsorship_status === 'sponsored' ? 'badge-sponsored' : 'badge-needs-sponsor'}`}
                      >
                        {cow.sponsorship_status === 'sponsored' ? 'Sponsored' : 'Available'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn-receipt-download"
                          onClick={() => openEditModal(cow)}
                          title="Edit Profile"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          type="button"
                          className="btn-receipt-download text-danger"
                          onClick={() => handleDelete(cow.id)}
                          title="Delete Cow"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="archive-empty-cell">
                    No cows registered in the goshala yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Cow Modal */}
      {showModal && (
        <div className="kosala-modal-overlay">
          <div className="kosala-modal-box text-left">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="cat-title">{editingCow ? 'Edit Gomatha Profile' : 'Register New Gomatha'}</div>
              <button type="button" className="btn-receipt-download" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group-item">
                <label>Cow Name (Tamil / English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kamadhenu (காமதேனு)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="d-flex gap-2">
                <div className="form-group-item flex-1">
                  <label>Identification Tag Number *</label>
                  <input
                    type="text"
                    required
                    value={tagNumber}
                    onChange={(e) => setTagNumber(e.target.value)}
                  />
                </div>
                <div className="form-group-item flex-1">
                  <label>Breed *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kangeyam Native"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <div className="form-group-item flex-1">
                  <label>Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 Years"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="form-group-item flex-1">
                  <label>Adoption Status</label>
                  <select
                    value={sponsorshipStatus}
                    onChange={(e) => setSponsorshipStatus(e.target.value)}
                  >
                    <option value="available">Available for Sponsorship</option>
                    <option value="sponsored">Currently Sponsored</option>
                  </select>
                </div>
              </div>

              <div className="form-group-item">
                <label>Health / Vaccination Status</label>
                <input
                  type="text"
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                />
              </div>

              <div className="form-group-item">
                <label>Photo URL / Asset Path</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
              </div>

              <div className="form-group-item">
                <label>Story / Goshala History</label>
                <textarea
                  rows="3"
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  placeholder="Details about rescue, intake, gentle nature..."
                />
              </div>

              <div className="modal-receipt-actions mt-3">
                <button type="submit" className="btn-hero-primary pgn-action-btn">
                  <i className="fas fa-save mr-1"></i> Save Profile
                </button>
                <button
                  type="button"
                  className="btn-hero-secondary btn-receipt-modal-close pgn-action-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CowManagement;
