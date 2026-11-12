import React from 'react';

const DonationAmountSelector = ({
  category,
  selectedTier,
  onSelectTier,
  isCustom,
  setIsCustom,
  customAmount,
  setCustomAmount,
  formatINR,
  donationFrequency = 'one_time',
  setDonationFrequency,
}) => {
  if (category.isPhysical) {
    return (
      <div className="physical-cow-info-box">
        <h4 className="physical-cow-info-title">
          <i className="fas fa-info-circle"></i> Physical Cow Donation Procedure
        </h4>
        <p className="physical-cow-info-text">
          Sri Kottai Varahi Amman Temple accepts healthy cows and calves with open hands. Due to housing and
          dietary requirements, please coordinate with our temple administration before bringing a cow.
        </p>
        <div className="physical-cow-actions">
          <a
            href="tel:+919092878389"
            className="btn-hero-primary btn-phone-call"
          >
            <i className="fas fa-phone-alt"></i>
            <span>Call +91 90928 78389</span>
          </a>
          <span className="physical-cow-address">
            Temple Office: Sri Kottai Varahi Amman Temple, Katpadi, Vellore.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="category-selector-pills">
        <button
          type="button"
          className={`filter-chip ${donationFrequency === 'one_time' ? 'active' : ''}`}
          onClick={() => setDonationFrequency && setDonationFrequency('one_time')}
        >
          <i className="fas fa-hand-holding-heart"></i> One-Time Contribution
        </button>
        <button
          type="button"
          className={`filter-chip ${donationFrequency === 'recurring' ? 'active' : ''}`}
          onClick={() => setDonationFrequency && setDonationFrequency('recurring')}
        >
          <i className="fas fa-sync-alt"></i> Monthly Recurring Seva
        </button>
      </div>

      <label className="plan-selector-label">
        Select Contribution Plan:
      </label>

      <div className="tier-options-grid">
        {category.tiers?.map((tier) => (
          <div
            key={tier.id}
            className={`tier-card ${!isCustom && selectedTier === tier.id ? 'selected' : ''}`}
            onClick={() => {
              onSelectTier(tier.id);
              setIsCustom(false);
            }}
          >
            <div className="tier-amount">{formatINR(tier.amount)}</div>
            <div className="tier-duration">{tier.label}</div>
            <div className="tier-note">{tier.note}</div>
          </div>
        ))}
      </div>

      {category.allowCustom && (
        <div>
          <div
            className={`custom-amt-toggle ${isCustom ? 'active' : ''}`}
            onClick={() => setIsCustom(true)}
          >
            <input
              type="radio"
              name="custom_amt_radio"
              checked={isCustom}
              onChange={() => setIsCustom(true)}
              className="custom-amt-radio"
            />
            <span>Or enter custom donation amount</span>
          </div>

          {isCustom && (
            <div className="custom-amount-box">
              <span className="custom-amount-symbol">₹</span>
              <input
                type="number"
                className="custom-amount-input"
                placeholder="Enter custom amount in INR"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="100"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DonationAmountSelector;

