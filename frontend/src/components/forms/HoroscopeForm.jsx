import React from 'react';

const reasonOptions = ['Career', 'Marriage', 'Business', 'Health', 'Education', 'Foreign', 'Children', 'Property', 'Finance'];
const needOptions = ['VideoExplanation', 'PDF', 'PrintedReport'];

const HoroscopeForm = ({ formData, errors, onChange, onFieldChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
    if (errors[name]) onFieldChange(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="jothidam-form__panel">
      <h3 className="jothidam-form__section-title">Horoscope Details</h3>
      <div className="jothidam-form__grid">
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="horoscope_reason">Reason <span className="required">*</span></label>
          <select id="horoscope_reason" name="reason" value={formData.reason || ''} onChange={handleChange} className={`jothidam-form__input ${errors.reason ? 'is-error' : ''}`}>
            <option value="">Select reason</option>
            {reasonOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {errors.reason && <span className="jothidam-form__error-text">{errors.reason}</span>}
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="horoscope_need">Need <span className="required">*</span></label>
          <select id="horoscope_need" name="need" value={formData.need || ''} onChange={handleChange} className={`jothidam-form__input ${errors.need ? 'is-error' : ''}`}>
            <option value="">Select need</option>
            {needOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          {errors.need && <span className="jothidam-form__error-text">{errors.need}</span>}
        </div>

        <div className="jothidam-form__field jothidam-form__field--full">
          <label className="jothidam-form__label">Questions (Q1–Q5)</label>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="jothidam-form__field">
              <input type="text" name={`question${i}`} value={formData[`question${i}`] || ''} onChange={handleChange} className="jothidam-form__input" placeholder={`Question ${i}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HoroscopeForm;