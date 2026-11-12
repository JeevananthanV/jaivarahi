import React from 'react';

const KosalaStats = ({ stats = {} }) => {
  const totalCows = stats.total_cows || 24;
  const adoptedCows = stats.adopted_cows || 18;

  return (
    <section className="kosala-stats-section">
      <div className="site-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon orange">
              <i className="fas fa-cow"></i>
            </div>
            <div>
              <div className="stat-value">{totalCows}</div>
              <div className="stat-label">Cows Under Lifelong Care</div>
              <div className="stat-sub">Permanent shelter &amp; sanctuary</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <i className="fas fa-hands-helping"></i>
            </div>
            <div>
              <div className="stat-value">{adoptedCows}</div>
              <div className="stat-label">Cows Actively Sponsored</div>
              <div className="stat-sub">Adopted by noble sevarthis</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <i className="fas fa-leaf"></i>
            </div>
            <div>
              <div className="stat-value">250+ kg</div>
              <div className="stat-label">Daily Fresh Green Fodder</div>
              <div className="stat-sub">Grass, maize &amp; mineral feed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">
              <i className="fas fa-stethoscope"></i>
            </div>
            <div>
              <div className="stat-value">Weekly</div>
              <div className="stat-label">Veterinary Care &amp; Vaccines</div>
              <div className="stat-sub">Doctor checkups &amp; tonics</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KosalaStats;
