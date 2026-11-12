import React from 'react';

const DonationSummary = ({
  categoryTitle,
  totalAmount,
  formatINR,
  isPhysical,
  donorName,
  donorPhone,
  frequency = 'one_time',
}) => {
  if (isPhysical) return null;

  return (
    <>
      <div className="donation-summary-pill">
        <div>
          <div className="donation-summary-label">
            Total Contribution ({frequency === 'recurring' ? 'Monthly Seva' : 'One-Time'})
          </div>
          <div className="donation-summary-category">{categoryTitle}</div>
          {donorName && (
            <div className="stat-sub">Devotee: {donorName} {donorPhone ? `• ${donorPhone}` : ''}</div>
          )}
        </div>
        <div className="donation-summary-value">{formatINR(totalAmount)}</div>
      </div>

      <div className="donation-security-notice">
        <i className="fas fa-shield-alt donation-security-icon"></i> 256-Bit Encrypted Payment • 80G Certified Receipt
      </div>
    </>
  );
};

export default DonationSummary;


