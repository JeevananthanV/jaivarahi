import React, { useState, useEffect } from 'react';
import { getAdminSponsorships, addAdminSponsorship, getAdminCows } from '../../../api/kosalaApi.js';
import { FALLBACK_SPONSORSHIPS, FALLBACK_COWS } from '../../../data/kosalaFallbackData.js';

const SponsorshipManagement = () => {
  const [sponsorships, setSponsorships] = useState([]);
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [cowId, setCowId] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [planType, setPlanType] = useState('1 Month Full Care');
  const [durationMonths, setDurationMonths] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [spRes, cowRes] = await Promise.all([
        getAdminSponsorships(),
        getAdminCows(),
      ]);

      if (spRes?.success && spRes.sponsorships?.length > 0) {
        setSponsorships(spRes.sponsorships);
        setIsFallback(false);
      } else {
        setSponsorships(FALLBACK_SPONSORSHIPS);
        setIsFallback(true);
      }

      if (cowRes?.success && cowRes.cows?.length > 0) {
        setCows(cowRes.cows);
      } else {
        setCows(FALLBACK_COWS);
      }
    } catch (err) {
      console.warn('Error fetching sponsorships, using fallback state:', err?.message);
      setSponsorships(FALLBACK_SPONSORSHIPS);
      setCows(FALLBACK_COWS);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAllocateModal = () => {
    setCowId(cows.length > 0 ? cows[0].id : '');
    setDonorName('');
    setDonorPhone('');
    setDonorEmail('');
    setPlanType('1 Month Full Care');
    setDurationMonths(1);
    setStartDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addAdminSponsorship({
        cow_id: cowId,
        donor_name: donorName,
        donor_phone: donorPhone,
        donor_email: donorEmail,
        plan_type: planType,
        duration_months: Number(durationMonths) || 1,
        start_date: startDate,
      });

      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Failed to record sponsorship: ' + err.message);
    }
  };

  if (loading && sponsorships.length === 0) {
    return (
      <div className="admin-kosala-wrap admin-spinner-wrap">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-3">Loading cow sponsorship records...</div>
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
              <strong>Temple Fallback State Active:</strong> Showing active temple devotee adoption records.
            </div>
          </div>
          <button
            type="button"
            className="btn-receipt-download"
            onClick={fetchData}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt mr-1 ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? 'Reconnecting...' : 'Sync Live Database'}
          </button>
        </div>
      )}

      <div className="admin-kosala-header">
        <div>
          <h1 className="admin-kosala-title">பசு தத்தெடுப்பு மேலாண்மை (Cow Sponsorships)</h1>
          <div className="cow-tag-mono">Manage devotee adoptions, durations, allocations, and care renewals</div>
        </div>

        <button type="button" className="btn-hero-primary pgn-action-btn" onClick={openAllocateModal}>
          <i className="fas fa-hand-holding-heart mr-1"></i> Allocate New Sponsorship
        </button>
      </div>

      <div className="admin-table-card">
        <div className="archive-table-container">
          <table className="archive-table">
            <thead>
              <tr>
                <th>Sponsorship ID</th>
                <th>Cow Name &amp; Tag</th>
                <th>Sponsor Devotee</th>
                <th>Contact</th>
                <th>Plan Type</th>
                <th>Duration</th>
                <th>Start Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="archive-loading-state">
                    <i className="fas fa-spinner fa-spin archive-loading-icon"></i>
                    <p className="archive-loading-text">Loading Sponsorships...</p>
                  </td>
                </tr>
              ) : sponsorships.length > 0 ? (
                sponsorships.map((sp) => (
                  <tr key={sp.id}>
                    <td>
                      <span className="receipt-code-mono">SPON-{String(sp.id).padStart(4, '0')}</span>
                    </td>
                    <td>
                      <strong>{sp.cow_name || `Cow #${sp.cow_id}`}</strong>
                      <div className="cow-tag-mono">{sp.cow_tag || '—'}</div>
                    </td>
                    <td><strong>{sp.donor_name}</strong></td>
                    <td className="cow-tag-mono">{sp.donor_phone}</td>
                    <td>
                      <span className="badge-category">{sp.plan_type}</span>
                    </td>
                    <td>{sp.duration_months} Month(s)</td>
                    <td>{new Date(sp.start_date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className="badge-verified">
                        <i className="fas fa-check-circle mr-1"></i> {sp.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="archive-empty-cell">
                    No active cow sponsorships recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Allocate Sponsorship Modal */}
      {showModal && (
        <div className="kosala-modal-overlay">
          <div className="kosala-modal-box text-left">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="cat-title">Allocate Gomatha Sponsorship</div>
              <button type="button" className="btn-receipt-download" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group-item">
                <label>Select Gomatha to Sponsor *</label>
                <select
                  required
                  value={cowId}
                  onChange={(e) => setCowId(e.target.value)}
                >
                  {cows.map((cow) => (
                    <option key={cow.id} value={cow.id}>
                      {cow.name} ({cow.tag_number || cow.breed}) — {cow.sponsorship_status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-item">
                <label>Sponsor Devotee Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Ramesh Kumar"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                />
              </div>

              <div className="d-flex gap-2">
                <div className="form-group-item flex-1">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                  />
                </div>
                <div className="form-group-item flex-1">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Optional email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <div className="form-group-item flex-1">
                  <label>Sponsorship Plan</label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value)}
                  >
                    <option value="1 Month Full Care">1 Month Full Care</option>
                    <option value="3 Months Care">3 Months Care</option>
                    <option value="6 Months Dedicated Seva">6 Months Dedicated Seva</option>
                    <option value="1 Year Lifetime Adoption">1 Year Lifetime Adoption</option>
                  </select>
                </div>
                <div className="form-group-item flex-1">
                  <label>Duration (Months)</label>
                  <input
                    type="number"
                    min="1"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group-item">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="modal-receipt-actions mt-3">
                <button type="submit" className="btn-hero-primary pgn-action-btn">
                  <i className="fas fa-check-circle mr-1"></i> Allocate Sponsorship
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

export default SponsorshipManagement;
