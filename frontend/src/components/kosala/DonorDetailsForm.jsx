import React from 'react';

const DonorDetailsForm = ({
  donorName,
  setDonorName,
  donorPhone,
  setDonorPhone,
  donorEmail = '',
  setDonorEmail,
  donorCity,
  setDonorCity,
  donorAddress = '',
  setDonorAddress,
  sankalpamNote,
  setSankalpamNote,
  isAnonymous,
  setIsAnonymous,
  consentAgreed = true,
  setConsentAgreed,
  fieldErrors = {},
  isPhysical = false,
}) => {
  return (
    <>
      <div className="form-group-item">
        <label htmlFor="donor-name">Devotee Full Name *</label>
        <input
          id="donor-name"
          type="text"
          placeholder="e.g. R. Karthikeyan"
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          required
        />
        {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
      </div>

      <div className="form-group-item">
        <label htmlFor="donor-phone">WhatsApp / Mobile Number *</label>
        <input
          id="donor-phone"
          type="tel"
          placeholder="10-digit mobile number"
          value={donorPhone}
          onChange={(e) => setDonorPhone(e.target.value)}
          required
        />
        {fieldErrors.phone && <div className="form-error">{fieldErrors.phone}</div>}
      </div>

      <div className="form-group-item">
        <label htmlFor="donor-email">
          Email Address <span className="label-subtext">(Optional for Instant 80G PDF Receipt)</span>
        </label>
        <input
          id="donor-email"
          type="email"
          placeholder="devotee@example.com"
          value={donorEmail}
          onChange={(e) => setDonorEmail && setDonorEmail(e.target.value)}
        />
        {fieldErrors.email && <div className="form-error">{fieldErrors.email}</div>}
      </div>

      <div className="form-group-item">
        <label htmlFor="donor-city">City / Town *</label>
        <input
          id="donor-city"
          type="text"
          placeholder="e.g. Vellore / Chennai / Bengaluru"
          value={donorCity}
          onChange={(e) => setDonorCity(e.target.value)}
          required
        />
        {fieldErrors.city && <div className="form-error">{fieldErrors.city}</div>}
      </div>

      <div className="form-group-item">
        <label htmlFor="donor-address">Full Address / Postal Pincode (Optional)</label>
        <input
          id="donor-address"
          type="text"
          placeholder="Street address & Pincode for Prasadam / Receipt"
          value={donorAddress}
          onChange={(e) => setDonorAddress && setDonorAddress(e.target.value)}
        />
      </div>

      <div className="form-group-item">
        <label htmlFor="donor-sankalpam">Donation Purpose &amp; Family Sankalpam Details</label>
        <input
          id="donor-sankalpam"
          type="text"
          placeholder="Gothram / Nakshatram / Specific prayer intention"
          value={sankalpamNote}
          onChange={(e) => setSankalpamNote(e.target.value)}
        />
      </div>

      {!isPhysical && (
        <label className="anonymous-toggle">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
          />
          <span className="anonymous-label">
            Keep my name anonymous in the Public Donation Archive (அநாமதேய கோசேவை)
          </span>
        </label>
      )}

      <label className="anonymous-toggle">
        <input
          type="checkbox"
          checked={consentAgreed}
          onChange={(e) => setConsentAgreed && setConsentAgreed(e.target.checked)}
          required
        />
        <span className="anonymous-label">
          I voluntarily contribute this sacred offering for Gomatha protection and cow care at Jai Varahi Peedam *
        </span>
      </label>
      {fieldErrors.consent && <div className="form-error">{fieldErrors.consent}</div>}
    </>
  );
};

export default DonorDetailsForm;
