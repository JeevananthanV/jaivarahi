import React from 'react';

const AppointmentSection = ({ formData, errors, onChange, onFieldChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...formData, [name]: value });
    if (errors[name]) {
      onFieldChange(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="jothidam-form__panel">
      <h3 className="jothidam-form__section-title">Appointment Preferences</h3>
      <div className="jothidam-form__grid">
        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="appointment_date">Preferred Date</label>
          <input id="appointment_date" type="date" name="appointment_date" value={formData.appointment_date} onChange={handleChange} className="jothidam-form__input" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="appointment_time">Preferred Time</label>
          <input id="appointment_time" type="time" name="appointment_time" value={formData.appointment_time} onChange={handleChange} className="jothidam-form__input" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="alternative_date">Alternative Date</label>
          <input id="alternative_date" type="date" name="alternative_date" value={formData.alternative_date} onChange={handleChange} className="jothidam-form__input" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="alternative_time">Alternative Time</label>
          <input id="alternative_time" type="time" name="alternative_time" value={formData.alternative_time} onChange={handleChange} className="jothidam-form__input" />
        </div>

        <div className="jothidam-form__field">
          <label className="jothidam-form__label" htmlFor="urgency">Urgency</label>
          <select id="urgency" name="urgency" value={formData.urgency} onChange={handleChange} className="jothidam-form__input">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="jothidam-form__field jothidam-form__field--full">
          <label className="jothidam-form__label" htmlFor="special_notes">Special Notes</label>
          <textarea id="special_notes" name="special_notes" value={formData.special_notes} onChange={handleChange} className="jothidam-form__input jothidam-form__textarea" placeholder="Any special requirements or notes" rows={3} />
        </div>
      </div>
    </div>
  );
};

export default AppointmentSection;