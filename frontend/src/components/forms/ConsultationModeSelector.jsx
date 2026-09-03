import React from 'react';

const modeFields = {
  'Report Only': ['email', 'language', 'printedCopy', 'courierAddress'],
  'Phone Consultation': ['preferredNumber', 'preferredTime', 'countryCode'],
  'WhatsApp Consultation': ['whatsappNumber', 'preferredTime'],
  'Video Consultation': ['platform', 'preferredTime', 'timezone'],
  'Temple Visit': ['temple', 'visitDate', 'visitTime', 'personsCount'],
  'Home Visit': ['address', 'landmark', 'googleLocation', 'distance', 'travelCharges'],
};

const platformOptions = ['Google Meet', 'Zoom', 'MS Teams'];

const ConsultationModeSelector = ({ formData, errors, onChange, onFieldChange }) => {
  const handleModeChange = (e) => {
    const newMode = e.target.value;
    const updated = { ...formData, consultation_mode: newMode, mode_detail_json: {} };
    onChange(updated);
    if (errors.consultation_mode) {
      onFieldChange(prev => ({ ...prev, consultation_mode: '' }));
    }
  };

  const handleDetailChange = (e) => {
    const { name, value, type, checked } = e.target;
    const detailValue = type === 'checkbox' ? checked : value;
    const currentDetails = formData.mode_detail_json || {};
    onChange({
      ...formData,
      mode_detail_json: { ...currentDetails, [name]: detailValue },
    });
  };

  const selectedMode = formData.consultation_mode;
  const activeFields = selectedMode ? modeFields[selectedMode] || [] : [];

  const renderField = (fieldName) => {
    const detailValue = (formData.mode_detail_json && formData.mode_detail_json[fieldName]) || '';
    const fieldError = errors[`mode_${fieldName}`];

    switch (fieldName) {
      case 'printedCopy':
        return (
          <div key={fieldName} className="jothidam-form__field">
            <label className="jothidam-form__label">
              <input type="checkbox" name="printedCopy" checked={detailValue === true || detailValue === 'true'} onChange={handleDetailChange} />
              &nbsp;Require printed copy
            </label>
          </div>
        );
      case 'platform':
        return (
          <div key={fieldName} className="jothidam-form__field">
            <label className="jothidam-form__label" htmlFor={`mode_${fieldName}`}>Platform <span className="required">*</span></label>
            <select id={`mode_${fieldName}`} name={fieldName} value={detailValue} onChange={handleDetailChange} className={`jothidam-form__input ${fieldError ? 'is-error' : ''}`}>
              <option value="">Select platform</option>
              {platformOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {fieldError && <span className="jothidam-form__error-text">{fieldError}</span>}
          </div>
        );
      case 'personsCount':
      case 'distance':
      case 'travelCharges':
        return (
          <div key={fieldName} className="jothidam-form__field">
            <label className="jothidam-form__label" htmlFor={`mode_${fieldName}`}>{fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
            <input id={`mode_${fieldName}`} type={fieldName === 'personsCount' ? 'number' : 'text'} name={fieldName} value={detailValue} onChange={handleDetailChange} className={`jothidam-form__input ${fieldError ? 'is-error' : ''}`} placeholder={fieldName} />
            {fieldError && <span className="jothidam-form__error-text">{fieldError}</span>}
          </div>
        );
      case 'visitDate':
        return (
          <div key={fieldName} className="jothidam-form__field">
            <label className="jothidam-form__label" htmlFor={`mode_${fieldName}`}>Visit Date <span className="required">*</span></label>
            <input id={`mode_${fieldName}`} type="date" name={fieldName} value={detailValue} onChange={handleDetailChange} className={`jothidam-form__input ${fieldError ? 'is-error' : ''}`} />
            {fieldError && <span className="jothidam-form__error-text">{fieldError}</span>}
          </div>
        );
      default:
        return (
          <div key={fieldName} className="jothidam-form__field">
            <label className="jothidam-form__label" htmlFor={`mode_${fieldName}`}>{fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
            <input id={`mode_${fieldName}`} type="text" name={fieldName} value={detailValue} onChange={handleDetailChange} className={`jothidam-form__input ${fieldError ? 'is-error' : ''}`} placeholder={fieldName} />
            {fieldError && <span className="jothidam-form__error-text">{fieldError}</span>}
          </div>
        );
    }
  };

  return (
    <div className="jothidam-form__panel">
      <h3 className="jothidam-form__section-title">Consultation Mode</h3>
      <div className="jothidam-form__field">
        <label className="jothidam-form__label" htmlFor="consultation_mode">Consultation Mode <span className="required">*</span></label>
        <select id="consultation_mode" name="consultation_mode" value={selectedMode} onChange={handleModeChange} className={`jothidam-form__input ${errors.consultation_mode ? 'is-error' : ''}`}>
          <option value="">Select consultation mode</option>
          {Object.keys(modeFields).map(mode => <option key={mode} value={mode}>{mode}</option>)}
        </select>
        {errors.consultation_mode && <span className="jothidam-form__error-text">{errors.consultation_mode}</span>}
      </div>
      {selectedMode && (
        <div className="jothidam-form__grid">
          {activeFields.map(renderField)}
        </div>
      )}
    </div>
  );
};

export default ConsultationModeSelector;