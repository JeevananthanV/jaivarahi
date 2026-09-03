import React from 'react';

const purposeOptions = ['Marriage', 'Travel', 'Business', 'Vehicle', 'Property', 'Education', 'General'];
const needOptions = ['Muhurtham', 'RahuKal', 'Yamagandam', 'Kuligai', 'Horai', 'GoodTime', 'FullPanchangamPDF'];

const PanchangamForm = ({ formData, errors, onChange, onFieldChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
    if (errors[name]) onFieldChange(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="jothidam-form__panel">
      <h3 className="jothidam-form__section-title">Panchangam Details</h3>
      <div className="jothidam-form__grid">
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="panchangam_purpose">Purpose <span className="required">*</span></label>
          <select id="panchangam_purpose" name="purpose" value={formData.purpose || ''} onChange={handleChange} className={`jothidam-form__input ${errors.purpose ? 'is-error' : ''}`}>
            <option value="">Select purpose</option>
            {purposeOptions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.purpose && <span className="jothidam-form__error-text">{errors.purpose}</span>}
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="panchangam_need">Need <span className="required">*</span></label>
          <select id="panchangam_need" name="need" value={formData.need || ''} onChange={handleChange} className={`jothidam-form__input ${errors.need ? 'is-error' : ''}`}>
            <option value="">Select need</option>
            {needOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          {errors.need && <span className="jothidam-form__error-text">{errors.need}</span>}
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="panchangam_requestedDate">Requested Date</label>
          <input id="panchangam_requestedDate" type="date" name="requestedDate" value={formData.requestedDate || ''} onChange={handleChange} className="jothidam-form__input" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="panchangam_location">Location</label>
          <input id="panchangam_location" type="text" name="location" value={formData.location || ''} onChange={handleChange} className="jothidam-form__input" placeholder="City, State" />
        </div>

        <div className="jothidam-form__field jothidam-form__field--full">
          <label className="jothidam-form__label" htmlFor="panchangam_notes">Notes</label>
          <textarea id="panchangam_notes" name="notes" value={formData.notes || ''} onChange={handleChange} className="jothidam-form__input jothidam-form__textarea" placeholder="Additional notes for the astrologer" rows={3} />
        </div>
      </div>
    </div>
  );
};

export default PanchangamForm;