import React from 'react';

const KosalaHero = ({ onDonateClick, onArchiveClick }) => {
  return (
    <section className="kosala-hero">
      <div className="site-container">
        <div className="kosala-hero-content">
          <div className="kosala-hero-badge">
            <i className="fas fa-om"></i>
            <span>ஸ்ரீ கோட்டை வராகி அம்மன் கோசாலை திருப்பணி</span>
          </div>
          <h1 className="kosala-hero-title">
            கோசாலை தானம் — <span>Protect and Nourish Cows</span>
          </h1>
          <p className="kosala-hero-desc">
            Preserving Vedic Go Seva at Sri Kottai Varahi Amman Temple, Katpadi, Vellore. Providing permanent shelter,
            daily fresh green fodder, clean water, medical treatment, and sacred Go Pooja rituals for protected Gomathas.
          </p>

          <div className="kosala-hero-actions">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={onDonateClick}
            >
              <i className="fas fa-hand-holding-heart"></i>
              <span>Donate for Cow Care</span>
            </button>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={onArchiveClick}
            >
              <i className="fas fa-receipt"></i>
              <span>View Donation Archive</span>
            </button>
          </div>

          <div className="kosala-hero-features">
            <div className="feature-pill">
              <i className="fas fa-certificate"></i>
              <span>80G Tax Deductible</span>
            </div>
            <div className="feature-pill">
              <i className="fas fa-check-circle"></i>
              <span>Instant Digital PDF Receipt</span>
            </div>
            <div className="feature-pill">
              <i className="fas fa-heart"></i>
              <span>24 Sacred Cows Protected</span>
            </div>
            <div className="feature-pill">
              <i className="fas fa-user-shield"></i>
              <span>100% Transparency Ledger</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KosalaHero;
