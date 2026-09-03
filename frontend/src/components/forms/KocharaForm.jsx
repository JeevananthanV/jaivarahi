import React from 'react';

const needAnalysisOptions = ['Monthly', 'Yearly', 'Current'];
const planetaryFocusOptions = ['Saturn', 'Jupiter', 'Rahu', 'Ketu'];
const currentProblemsOptions = ['Career', 'Marriage', 'Business', 'Finance', 'Health', 'Property'];
const needOptions = ['Predictions', 'Remedies', 'GemstoneAdvice'];

const KocharaForm = ({ formData, errors, onChange, onFieldChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
    if (errors[name]) onFieldChange(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="jothidam-form__panel">
      <h3 className="jothidam-form__section-title">Kochara Details</h3>
      <div className="jothidam-form__grid">
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="kochara_needAnalysis">Need Analysis</label>
          <select id="kochara_needAnalysis" name="needAnalysis" value={formData.needAnalysis || ''} onChange={handleChange} className="jothidam-form__input">
            <option value="">Select</option>
            {needAnalysisOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label">Planetary Focus</label>
          {planetaryFocusOptions.map(p => (
            <label key={p} className="jothidam-form__checkbox-label">
              <input type="checkbox" name="planetaryFocus" value={p} checked={(formData.planetaryFocus || []).includes(p)} onChange={(e) => {
                const current = formData.planetaryFocus || [];
                const next = e.target.checked ? [...current, p] : current.filter(v => v !== p);
                onChange({ ...formData, planetaryFocus: next });
              }} />
              <span>{p}</span>
            </label>
          ))}
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label">Current Problems</label>
          {currentProblemsOptions.map(p => (
            <label key={p} className="jothidam-form__checkbox-label">
              <input type="checkbox" name="currentProblems" value={p} checked={(formData.currentProblems || []).includes(p)} onChange={(e) => {
                const current = formData.currentProblems || [];
                const next = e.target.checked ? [...current, p] : current.filter(v => v !== p);
                onChange({ ...formData, currentProblems: next });
              }} />
              <span>{p}</span>
            </label>
          ))}
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="kochara_need">Need</label>
          <select id="kochara_need" name="need" value={formData.need || ''} onChange={handleChange} className="jothidam-form__input">
            <option value="">Select need</option>
            {needOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default KocharaForm;