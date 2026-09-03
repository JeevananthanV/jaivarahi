import React from 'react';

const needOptions = ['Papasamyam', 'Dosham', 'Compatibility', 'DetailedReport', 'MarriageConsultation', 'Documents'];

const MatchMakingForm = ({ formData, errors, onChange, onFieldChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
    if (errors[name]) onFieldChange(prev => ({ ...prev, [name]: '' }));
  };

  const handleBrideChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [`bride_${name}`]: value });
  };

  const handleGroomChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [`groom_${name}`]: value });
  };

  return (
    <div className="jothidam-form__panel">
      <h3 className="jothidam-form__section-title">Match Making Details</h3>

      <h4 className="jothidam-form__sub-title">Bride Details</h4>
      <div className="jothidam-form__grid">
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="bride_name">Name</label>
          <input id="bride_name" type="text" name="name" value={formData.bride_name || ''} onChange={handleBrideChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="bride_dob">Date of Birth</label>
          <input id="bride_dob" type="date" name="dob" value={formData.bride_dob || ''} onChange={handleBrideChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="bride_birthTime">Birth Time</label>
          <input id="bride_birthTime" type="time" name="birthTime" value={formData.bride_birthTime || ''} onChange={handleBrideChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="bride_birthPlace">Birth Place</label>
          <input id="bride_birthPlace" type="text" name="birthPlace" value={formData.bride_birthPlace || ''} onChange={handleBrideChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="bride_nakshatra">Nakshatra</label>
          <input id="bride_nakshatra" type="text" name="nakshatra" value={formData.bride_nakshatra || ''} onChange={handleBrideChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="bride_rasi">Rasi</label>
          <input id="bride_rasi" type="text" name="rasi" value={formData.bride_rasi || ''} onChange={handleBrideChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="bride_horoscope">Bride Horoscope</label>
          <input id="bride_horoscope" type="file" name="brideHoroscope" onChange={(e) => onChange({ ...formData, brideHoroscope: e.target.files[0] })} className="jothidam-form__input" />
        </div>
      </div>

      <h4 className="jothidam-form__sub-title">Groom Details</h4>
      <div className="jothidam-form__grid">
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="groom_name">Name</label>
          <input id="groom_name" type="text" name="name" value={formData.groom_name || ''} onChange={handleGroomChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="groom_dob">Date of Birth</label>
          <input id="groom_dob" type="date" name="dob" value={formData.groom_dob || ''} onChange={handleGroomChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="groom_birthTime">Birth Time</label>
          <input id="groom_birthTime" type="time" name="birthTime" value={formData.groom_birthTime || ''} onChange={handleGroomChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="groom_birthPlace">Birth Place</label>
          <input id="groom_birthPlace" type="text" name="birthPlace" value={formData.groom_birthPlace || ''} onChange={handleGroomChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="groom_nakshatra">Nakshatra</label>
          <input id="groom_nakshatra" type="text" name="nakshatra" value={formData.groom_nakshatra || ''} onChange={handleGroomChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="groom_rasi">Rasi</label>
          <input id="groom_rasi" type="text" name="rasi" value={formData.groom_rasi || ''} onChange={handleGroomChange} className="jothidam-form__input" />
        </div>
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="groom_horoscope">Groom Horoscope</label>
          <input id="groom_horoscope" type="file" name="groomHoroscope" onChange={(e) => onChange({ ...formData, groomHoroscope: e.target.files[0] })} className="jothidam-form__input" />
        </div>
      </div>

      <div className="jothidam-form__field">
        <label className="jothidam-form__label" htmlFor="matchmaking_need">Need</label>
        <select id="matchmaking_need" name="need" value={formData.need || ''} onChange={handleChange} className="jothidam-form__input">
          <option value="">Select need</option>
          {needOptions.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
    </div>
  );
};

export default MatchMakingForm;