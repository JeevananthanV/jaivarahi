import React from 'react';

const CowSponsorshipCard = ({ onAdoptClick }) => {
  return (
    <div className="cow-sponsorship-banner">
      <div className="cow-sponsorship-text">
        <span className="section-tag cow-sponsorship-tag">
          பசு தத்தெடுப்பு திட்டம்
        </span>
        <h3 className="cow-sponsorship-title">
          Adopt a Gomatha for Full Year Care (₹18,000/year)
        </h3>
        <p className="cow-sponsorship-desc">
          Cover complete nutritious feeding, shelter maintenance, regular veterinary doctor care, and seasonal vaccinations.
          Every adopting sponsor receives monthly special archana sankalpam blessings in their family’s name.
        </p>
      </div>

      <div>
        <button
          type="button"
          className="btn-hero-primary cow-sponsorship-btn"
          onClick={onAdoptClick}
        >
          <i className="fas fa-heart"></i>
          <span>Adopt a Cow Now</span>
        </button>
      </div>
    </div>
  );
};

export default CowSponsorshipCard;

