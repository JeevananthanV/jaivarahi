import React, { useState } from 'react';

const documentTypes = [
  { value: 'horoscope', label: 'Horoscope', accept: '.jpg,.jpeg,.png,.pdf' },
  { value: 'birthCertificate', label: 'Birth Certificate', accept: '.jpg,.jpeg,.png,.pdf' },
  { value: 'marriageHoroscope', label: 'Marriage Horoscope', accept: '.jpg,.jpeg,.png,.pdf' },
  { value: 'propertyDocument', label: 'Property Document', accept: '.jpg,.jpeg,.png,.pdf,.doc,.docx' },
  { value: 'businessRegistration', label: 'Business Registration', accept: '.jpg,.jpeg,.png,.pdf,.doc,.docx' },
  { value: 'medicalReport', label: 'Medical Report', accept: '.jpg,.jpeg,.png,.pdf' },
  { value: 'photo', label: 'Photo', accept: '.jpg,.jpeg,.png' },
];

const DocumentUploadSection = ({ formData, onChange }) => {
  const [previews, setPreviews] = useState({});

  const handleFileChange = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [docType]: reader.result }));
    };
    reader.readAsDataURL(file);

    const currentDocs = formData.documents_json || {};
    onChange({
      ...formData,
      documents_json: { ...currentDocs, [docType]: { name: file.name, size: file.size, type: file.type, data: reader.result } },
    });
  };

  const removeDocument = (docType) => {
    const currentDocs = { ...(formData.documents_json || {}) };
    delete currentDocs[docType];
    setPreviews(prev => {
      const next = { ...prev };
      delete next[docType];
      return next;
    });
    onChange({ ...formData, documents_json: currentDocs });
  };

  return (
    <div className="jothidam-form__panel">
      <h3 className="jothidam-form__section-title">Document Upload</h3>
      <div className="jothidam-form__grid">
        {documentTypes.map(doc => (
          <div key={doc.value} className="jothidam-form__field">
            <label className="jothidam-form__label" htmlFor={`doc_${doc.value}`}>{doc.label}</label>
            <div className="jothidam-form__file-wrapper">
              <input id={`doc_${doc.value}`} type="file" accept={doc.accept} onChange={(e) => handleFileChange(e, doc.value)} className="jothidam-form__file-input" />
              {previews[doc.value] && (
                <div className="jothidam-form__file-preview">
                  {doc.value === 'photo' || doc.accept.includes('.png') || doc.accept.includes('.jpg') ? (
                    <img src={previews[doc.value]} alt={doc.label} style={{ maxWidth: 80, maxHeight: 80, objectFit: 'cover' }} />
                  ) : (
                    <span className="jothidam-form__file-icon">📄</span>
                  )}
                  <button type="button" className="jothidam-form__file-remove" onClick={() => removeDocument(doc.value)} aria-label={`Remove ${doc.label}`}>×</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentUploadSection;