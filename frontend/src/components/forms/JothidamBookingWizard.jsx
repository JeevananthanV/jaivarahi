import React, { useState, useCallback } from 'react';
import CommonCustomerForm from './CommonCustomerForm.jsx';
import ConsultationModeSelector from './ConsultationModeSelector.jsx';
import AppointmentSection from './AppointmentSection.jsx';
import DocumentUploadSection from './DocumentUploadSection.jsx';
import PaymentSection from './PaymentSection.jsx';
import PanchangamForm from './PanchangamForm.jsx';
import HoroscopeForm from './HoroscopeForm.jsx';
import KocharaForm from './KocharaForm.jsx';
import MatchMakingForm from './MatchMakingForm.jsx';
import MuhurthamForm from './MuhurthamForm.jsx';

const serviceTypes = [
  { value: 'Panchangam', label: 'Panchangam', icon: 'fa-calendar-alt' },
  { value: 'Horoscope', label: 'Horoscope', icon: 'fa-star' },
  { value: 'Kochara', label: 'Kochara', icon: 'fa-globe' },
  { value: 'Match Making', label: 'Match Making', icon: 'fa-heart' },
  { value: 'Muhurtham', label: 'Muhurtham', icon: 'fa-clock' },
];

const getServiceForm = (serviceType) => {
  switch (serviceType) {
    case 'Panchangam': return PanchangamForm;
    case 'Horoscope': return HoroscopeForm;
    case 'Kochara': return KocharaForm;
    case 'Match Making': return MatchMakingForm;
    case 'Muhurtham': return MuhurthamForm;
    default: return null;
  }
};

const initialFormData = {
  service_type: '',
  fullName: '', mobileNumber: '', whatsappNumber: '', email: '',
  gender: '', dateOfBirth: '', timeOfBirth: '', birthPlace: '',
  currentLocation: '', preferredLanguage: '', gothram: '',
  nakshatra: '', rasi: '', occupation: '', maritalStatus: '',
  address: '', alternateNumber: '', existingHoroscope: null,
  consultation_mode: '', mode_detail_json: {},
  appointment_date: '', appointment_time: '', alternative_date: '',
  alternative_time: '', urgency: 'Medium', special_notes: '',
  documents_json: {},
  coupon_code: '',
};

const JothidamBookingWizard = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [bookingId, setBookingId] = useState(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const updateFormData = useCallback((data) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!formData.service_type) newErrors.service_type = 'Please select a service';
    }
    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
      else if (!/^\d{10,15}$/.test(formData.mobileNumber.replace(/\D/g, ''))) newErrors.mobileNumber = 'Valid phone number required';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email required';
    }
    if (step === 2) {
      if (!formData.purpose && (formData.service_type === 'Panchangam' || formData.service_type === 'Muhurtham')) {
        newErrors.purpose = 'Purpose is required';
      }
      if (!formData.reason && formData.service_type === 'Horoscope') {
        newErrors.reason = 'Reason is required';
      }
      if (!formData.needAnalysis && formData.service_type === 'Kochara') {
        newErrors.needAnalysis = 'Need analysis is required';
      }
    }
    if (step === 3) {
      if (!formData.consultation_mode) newErrors.consultation_mode = 'Please select a consultation mode';
    }
    if (step === 4) {
      if (!formData.appointment_date) newErrors.appointment_date = 'Preferred date is required';
    }
    return newErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleProceedToPayment = async () => {
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      if (onComplete) {
        const result = await onComplete(formData);
        setBookingId(result.bookingId);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to initialize booking.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (verifyData) => {
    setPaymentCompleted(true);
    setMessage({ type: 'success', text: `Payment verified successfully! Your Booking ID is: ${verifyData.bookingId}` });
  };

  const handlePaymentError = (err) => {
    setMessage({ type: 'error', text: err.message || 'Payment failed. Please try again.' });
  };

  const steps = [
    { label: 'Service', icon: 'fa-list' },
    { label: 'Customer', icon: 'fa-user' },
    { label: 'Service Details', icon: 'fa-file-alt' },
    { label: 'Consultation', icon: 'fa-comments' },
    { label: 'Appointment', icon: 'fa-calendar' },
    { label: 'Documents', icon: 'fa-paperclip' },
    { label: 'Payment', icon: 'fa-credit-card' },
  ];

  const ServiceForm = getServiceForm(formData.service_type);

  if (paymentCompleted) {
    return (
      <div className="jothidam-wizard">
        <div className="jothidam-wizard__steps">
          {steps.map((step, idx) => (
            <div key={idx} className={`jothidam-wizard__step ${idx === 6 ? 'is-active' : ''} ${idx < 6 ? 'is-completed' : ''}`}>
              <span className="jothidam-wizard__step-number">{idx < 6 ? '✓' : idx + 1}</span>
              <span className="jothidam-wizard__step-label">{step.label}</span>
            </div>
          ))}
        </div>
        <div className="jothidam-form__panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '48px', color: '#28a745', marginBottom: '16px' }}>✓</div>
          <h3 className="jothidam-form__section-title">Booking Confirmed!</h3>
          <p>Your astrology consultation has been booked successfully. We will contact you shortly to confirm the details.</p>
          {message.text && (
            <div className={`jothidam-wizard__message ${message.type === 'error' ? 'is-error' : 'is-success'}`} role="alert">
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="jothidam-wizard">
      <div className="jothidam-wizard__steps">
        {steps.map((step, idx) => (
          <div key={idx} className={`jothidam-wizard__step ${idx === currentStep ? 'is-active' : ''} ${idx < currentStep ? 'is-completed' : ''}`}>
            <span className="jothidam-wizard__step-number">{idx < currentStep ? '✓' : idx + 1}</span>
            <span className="jothidam-wizard__step-label">{step.label}</span>
          </div>
        ))}
      </div>

      {message.text && (
        <div className={`jothidam-wizard__message ${message.type === 'error' ? 'is-error' : 'is-success'}`} role="alert">
          {message.text}
        </div>
      )}

      <div className="jothidam-wizard__content animate-devotional-fade-in" key={currentStep}>
        {currentStep === 0 && (
          <div className="jothidam-form__panel">
            <h3 className="jothidam-form__section-title">Select Service</h3>
            <div className="jothidam-form__service-grid">
              {serviceTypes.map(svc => (
                <label key={svc.value} className={`jothidam-form__service-card ${formData.service_type === svc.value ? 'is-selected' : ''}`}>
                  <input type="radio" name="service_type" value={svc.value} checked={formData.service_type === svc.value} onChange={() => updateFormData({ service_type: svc.value })} />
                  <i className={`fas ${svc.icon}`}></i>
                  <span>{svc.label}</span>
                </label>
              ))}
            </div>
            {errors.service_type && <span className="jothidam-form__error-text">{errors.service_type}</span>}
          </div>
        )}

        {currentStep === 1 && (
          <CommonCustomerForm
            formData={formData}
            errors={errors}
            onChange={updateFormData}
            onFieldChange={clearFieldError}
          />
        )}

        {currentStep === 2 && ServiceForm ? (
          <ServiceForm
            formData={formData}
            errors={errors}
            onChange={updateFormData}
            onFieldChange={clearFieldError}
          />
        ) : currentStep === 2 ? (
          <div className="jothidam-form__panel"><p>Please select a service first.</p></div>
        ) : null}

        {currentStep === 3 && (
          <ConsultationModeSelector
            formData={formData}
            errors={errors}
            onChange={updateFormData}
            onFieldChange={clearFieldError}
          />
        )}

        {currentStep === 4 && (
          <AppointmentSection
            formData={formData}
            errors={errors}
            onChange={updateFormData}
            onFieldChange={clearFieldError}
          />
        )}

        {currentStep === 5 && (
          <DocumentUploadSection
            formData={formData}
            onChange={updateFormData}
          />
        )}

        {currentStep === 6 && (
          <PaymentSection
            formData={formData}
            onFieldChange={clearFieldError}
            priceSummary={{
              servicePrice: formData.service_price || 0,
              consultationCharge: formData.consultation_charge || 0,
              travelCharge: formData.travel_charge || 0,
              gst: formData.gst || 0,
              discount: formData.discount || 0,
              grandTotal: formData.grand_total || 0,
            }}
            bookingId={bookingId}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        )}
      </div>

      <div className="jothidam-wizard__actions">
        {currentStep > 0 && (
          <button type="button" className="jothidam-wizard__btn jothidam-wizard__btn--back" onClick={handleBack}>Back</button>
        )}
        {currentStep < 6 ? (
          <button type="button" className="jothidam-wizard__btn jothidam-wizard__btn--next" onClick={handleNext}>Next</button>
        ) : (
          !bookingId && (
            <button type="button" className="jothidam-wizard__btn jothidam-wizard__btn--submit" onClick={handleProceedToPayment} disabled={isSubmitting}>
              {isSubmitting ? 'Initializing...' : 'Proceed to Payment'}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default JothidamBookingWizard;
