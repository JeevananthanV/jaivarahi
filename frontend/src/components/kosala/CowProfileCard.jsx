import React from 'react';
import { Link } from 'react-router-dom';

const CowProfileCard = ({ cow, onSponsorClick }) => {
  const cowId = cow.id || cow.cow_id || '1';
  const tagNumber = cow.tag_number || cow.tagNumber || `JVP-COW-${String(cowId).padStart(3, '0')}`;
  const photoUrl = cow.photo_url || cow.photoUrl || cow.image;

  return (
    <div className="stat-card cow-profile-card">
      <div className="cow-card-header">
        <div className="cow-card-info-wrap">
          {photoUrl ? (
            <img 
              src={photoUrl} 
              alt={cow.name} 
              className="stat-icon cow-icon cow-profile-photo" 
            />
          ) : (
            <div className="stat-icon orange cow-icon">
              <i className="fas fa-cow"></i>
            </div>
          )}
          <div>
            <div className="cow-name">{cow.name}</div>
            <div className="cow-tag-mono">{tagNumber}</div>
            <div className="cow-breed-meta">{cow.breed} • {cow.age}</div>
          </div>
        </div>
        <span
          className={`badge-category ${cow.isSponsored || cow.sponsorship_status === 'sponsored' ? 'badge-sponsored' : 'badge-needs-sponsor'}`}
        >
          {cow.isSponsored || cow.sponsorship_status === 'sponsored' ? 'Sponsored' : 'Needs Sponsor'}
        </span>
      </div>

      <p className="cow-story">
        {cow.story || cow.description || 'Devotedly cared for under Vedic goshala traditions at Sri Jai Varahi Peedam.'}
      </p>

      <div className="cow-card-footer">
        <span className="cow-health-badge">
          <i className="fas fa-check-circle cow-health-icon"></i>
          {cow.healthStatus || cow.health_status || 'Vaccinated & Healthy'}
        </span>
        <div className="cow-footer-actions">
          <Link
            to={`/kosala/cows/${cowId}`}
            className="btn-receipt-download"
            title="View full medical & care details"
          >
            Details
          </Link>
          {!(cow.isSponsored || cow.sponsorship_status === 'sponsored') && onSponsorClick && (
            <button
              type="button"
              className="btn-hero-primary btn-cow-sponsor"
              onClick={() => onSponsorClick(cow)}
            >
              Sponsor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CowProfileCard;

