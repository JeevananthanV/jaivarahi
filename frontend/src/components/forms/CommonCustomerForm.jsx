import React from 'react';

const genderOptions = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

const languageOptions = [
  'Tamil', 'English', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'Marathi', 'Other',
];

const CommonCustomerForm = ({ formData, errors, onChange, onFieldChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
    if (errors[name]) {
      onFieldChange(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="jothidam-form__panel">
      <h3 className="jothidam-form__section-title">Customer Details</h3>
      <div className="jothidam-form__grid">
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="fullName">Full Name <span className="required">*</span></label>
          <input id="fullName" type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={`jothidam-form__input ${errors.fullName ? 'is-error' : ''}`} placeholder="Enter full name" />
          {errors.fullName && <span className="jothidam-form__error-text">{errors.fullName}</span>}
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="mobileNumber">Mobile Number <span className="required">*</span></label>
          <input id="mobileNumber" type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className={`jothidam-form__input ${errors.mobileNumber ? 'is-error' : ''}`} placeholder="10-digit mobile number" maxLength={15} />
          {errors.mobileNumber && <span className="jothidam-form__error-text">{errors.mobileNumber}</span>}
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="whatsappNumber">WhatsApp Number</label>
          <input id="whatsappNumber" type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} className="jothidam-form__input" placeholder="WhatsApp number (optional)" maxLength={15} />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="email">Email</label>
          <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className={`jothidam-form__input ${errors.email ? 'is-error' : ''}`} placeholder="email@example.com" />
          {errors.email && <span className="jothidam-form__error-text">{errors.email}</span>}
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="gender">Gender</label>
          <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="jothidam-form__input">
            <option value="">Select Gender</option>
            {genderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="dateOfBirth">Date of Birth</label>
          <input id="dateOfBirth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="jothidam-form__input" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="timeOfBirth">Time of Birth</label>
          <input id="timeOfBirth" type="time" name="timeOfBirth" value={formData.timeOfBirth} onChange={handleChange} className="jothidam-form__input" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="birthPlace">Birth Place</label>
          <input id="birthPlace" type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} className="jothidam-form__input" placeholder="City, State" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="currentLocation">Current Location</label>
          <input id="currentLocation" type="text" name="currentLocation" value={formData.currentLocation} onChange={handleChange} className="jothidam-form__input" placeholder="City, State" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="preferredLanguage">Preferred Language</label>
          <select id="preferredLanguage" name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange} className="jothidam-form__input">
            <option value="">Select Language</option>
            {languageOptions.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="gothram">Gothram</label>
          <input id="gothram" type="text" name="gothram" value={formData.gothram} onChange={handleChange} className="jothidam-form__input" placeholder="Your gothram" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="nakshatra">Nakshatra</label>
          <input id="nakshatra" type="text" name="nakshatra" value={formData.nakshatra} onChange={handleChange} className="jothidam-form__input" placeholder="Your nakshatra" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="rasi">Rasi</label>
          <input id="rasi" type="text" name="rasi" value={formData.rasi} onChange={handleChange} className="jothidam-form__input" placeholder="Your rasi" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="occupation">Occupation</label>
          <input id="occupation" type="text" name="occupation" value={formData.occupation} onChange={handleChange} className="jothidam-form__input" placeholder="Your occupation" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="maritalStatus">Marital Status</label>
          <select id="maritalStatus" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="jothidam-form__input">
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </div>

        <div className="jothidam-form__field jothidam-form__field--full">
          <label className="jothidam-form__label" htmlFor="address">Address</label>
          <textarea id="address" name="address" value={formData.address} onChange={handleChange} className={`jothidam-form__input jothidam-form__textarea ${errors.address ? 'is-error' : ''}`} placeholder="Full address" rows={3} />
          {errors.address && <span className="jothidam-form__error-text">{errors.address}</span>}
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="alternateNumber">Alternate Number</label>
          <input id="alternateNumber" type="tel" name="alternateNumber" value={formData.alternateNumber} onChange={handleChange} className="jothidam-form__input" placeholder="Alternate phone number" maxLength={15} />
        </div>
      </div>
    </div>
  );
};

export default CommonCustomerForm;