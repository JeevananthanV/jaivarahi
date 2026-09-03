import React from 'react';

const FIELD_CONFIG = {
  Abishekam: [
    { name: 'abishekam_type', label: 'Abishekam Type', type: 'select', options: ['Milk', 'Honey', 'Ghee', 'Turmeric', 'Sahasra', 'Nithya'] },
    { name: 'sponsor_material', label: 'Sponsor Material', type: 'select', options: ['Temple', 'Devotee'] },
    { name: 'receive_prasadam', label: 'Receive Prasadam', type: 'select', options: ['Yes', 'No'] },
  ],
  Archana: [
    { name: 'archana_name', label: 'Archana Name', type: 'text', placeholder: 'e.g. Varahi Sahasranamam' },
    { name: 'number_of_names', label: 'Number of Names', type: 'number', min: 1, max: 1000 },
    { name: 'offer_kumkum', label: 'Offer Kumkum', type: 'select', options: ['Yes', 'No'] },
    { name: 'flower_type', label: 'Flower Type', type: 'select', options: ['Rose', 'Lotus', 'Jasmine', 'Mixed'] },
  ],
  Homam: [
    { name: 'homam_purpose', label: 'Homam Purpose', type: 'select', options: ['Business', 'Marriage', 'Health', 'Education', 'Enemy Removal', 'Dosha', 'Other'] },
    { name: 'people_attending', label: 'People Attending', type: 'number', min: 1, max: 500 },
    { name: 'need_homa_prasadam', label: 'Need Homa Prasadam', type: 'select', options: ['Yes', 'No'] },
  ],
  'Special Pooja': [
    { name: 'occasion', label: 'Occasion', type: 'select', options: ['Birthday', 'Wedding Anniversary', '60th Birthday', 'Other'] },
    { name: 'person_name', label: 'Person Name', type: 'text', placeholder: 'Name of the person' },
    { name: 'event_date', label: 'Event Date', type: 'date' },
    { name: 'marriage_years', label: 'Marriage Years', type: 'number', min: 0, max: 100 },
    { name: 'birthday_age', label: 'Birthday Age', type: 'number', min: 0, max: 120 },
  ],
  'Go Seva': [
    { name: 'seva_type', label: 'Seva Type', type: 'select', options: ['Cow Adoption', 'Cow Donation', 'Maintenance', 'Cow Pooja'] },
    { name: 'donation_type', label: 'Donation Type', type: 'select', options: ['Monthly', 'Quarterly', 'Yearly', 'Lifetime', 'One-time'] },
    { name: 'certificate_required', label: 'Certificate Required', type: 'select', options: ['Yes', 'No'] },
    { name: 'name_on_certificate', label: 'Name on Certificate', type: 'text', placeholder: 'Name to print on certificate' },
  ],
};

const DynamicCategoryFields = ({ category, formData, onChange, errors = {} }) => {
  const fields = FIELD_CONFIG[category] || [];

  if (fields.length === 0) {
    return <p style={{ color: '#64748b', fontSize: 14, fontStyle: 'italic' }}>No additional fields required for this service.</p>;
  }

  const handleChange = (name, value) => {
    const fieldConfig = FIELD_CONFIG[category]?.find((f) => f.name === name);
    if (fieldConfig?.type === 'number') {
      onChange({ ...formData, [name]: value === '' ? '' : Number(value) });
    } else {
      onChange({ ...formData, [name]: value });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {fields.map((field) => (
        <div key={field.name}>
          <label style={{ color: '#94a3b8', fontSize: 13, display: 'block', marginBottom: 6, fontWeight: 500 }}>
            {field.label}
          </label>
          {field.type === 'select' ? (
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#f1f5f9' }}
            >
              <option value="">Select...</option>
              {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : field.type === 'number' ? (
            <input
              type="number"
              min={field.min}
              max={field.max}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder || ''}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#f1f5f9' }}
            />
          ) : field.type === 'date' ? (
            <input
              type="date"
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#f1f5f9' }}
            />
          ) : (
            <input
              type="text"
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder || ''}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#f1f5f9' }}
            />
          )}
          {errors[field.name] && <span style={{ color: '#ef4444', fontSize: 12, marginTop: 4, display: 'block' }}>{errors[field.name]}</span>}
        </div>
      ))}
    </div>
  );
};

export default DynamicCategoryFields;
