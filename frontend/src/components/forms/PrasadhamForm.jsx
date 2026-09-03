import React, { useEffect, useState } from 'react';
import { createPrasadhamOrder, verifyPrasadhamPayment } from '../../api/paymentAPI.js';
import { isRequired, isValidPhone, isValidPincode } from '../../utils/formValidation';

const rasiOptions = [
  { ta: 'Mesham', en: 'Mesham', value: 'mesham' },
  { ta: 'Rishabam', en: 'Rishabam', value: 'rishabam' },
  { ta: 'Midhunam', en: 'Midhunam', value: 'midhunam' },
  { ta: 'Kadagam', en: 'Kadagam', value: 'kadagam' },
  { ta: 'Simmam', en: 'Simmam', value: 'simmam' },
  { ta: 'Kanni', en: 'Kanni', value: 'kanni' },
  { ta: 'Thulaam', en: 'Thulaam', value: 'thulaam' },
  { ta: 'Viruchigam', en: 'Viruchigam', value: 'viruchigam' },
  { ta: 'Dhanusu', en: 'Dhanusu', value: 'dhanusu' },
  { ta: 'Magaram', en: 'Magaram', value: 'magaram' },
  { ta: 'Kumbam', en: 'Kumbam', value: 'kumbam' },
  { ta: 'Meenam', en: 'Meenam', value: 'meenam' }
];

const starOptions = [
  "Ashwini (Aswini)", "Bharani", "Krittika (Krithika)", "Rohini", 
  "Mrigashira (Mrigashirsha)", "Ardra (Ardra)", "Punarvasu", "Pushya (Poosam)", 
  "Ashlesha (Aayilyam)", "Magha", "Poorva Phalguni (Pooram)", 
  "Uttara Phalguni (Uthiram)", "Hasta (Hastham)", "Chitra (Chithirai)", 
  "Swati (Swaathi)", "Vishakha (Visaakam)", "Anuradha", "Jyeshtha (Kettai)", 
  "Moola (Moolam)", "Poorva Ashadha (Pooraadam)", "Uttara Ashadha (Uthiraadam)", 
  "Shravana (Thiruvonam)", "Dhanishtha (Avittam)", "Shatabhisha (Shatabhishak)", 
  "Poorva Bhadrapada (Poorattathi)", "Uttara Bhadrapada (Uthirattathi)", "Revati"
];

const categoryOptions = [
  { label: 'Abishyam', value: 'Abishyam', price: 3001 },
  { label: 'Arachna', value: 'Arachna', price: 501 },
  { label: 'Co Pooja', value: 'Co Pooja', price: 1001 },
  { label: 'Sangalapam', value: 'Sangalapam', price: 751 },
  { label: 'Full Homam', value: 'Full Homam', price: 15000 },
  { label: 'Homam and Sangalpam', value: 'Homam and Sangalpam', price: 10001 },
];

const categoryPriceMap = categoryOptions.reduce((acc, item) => {
  acc[item.value] = item.price;
  return acc;
}, {});

const PrasadhamForm = ({ eventTitle = '', onClose }) => {
  const [formData, setFormData] = useState({
    primaryName: '',
    gothuram: '',
    phone: '',
    address: '',
    pincode: '',
    dob: '',
    familyMembers: [{ name: '', rasi: '', star: '', dob: '' }],
  });
  
  // New state for field-specific errors
  const [errors, setErrors] = useState({});
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Global message for payment success/failure
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const nextTotal = selectedCategories.reduce((sum, category) => sum + (categoryPriceMap[category] || 0), 0);
    setTotalAmount(nextTotal);
  }, [selectedCategories]);

  // Validation Logic
  const validateForm = () => {
    const newErrors = {};
    
    if (!isRequired(formData.primaryName)) {
      newErrors.primaryName = 'Primary Name is required.';
    }

    if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits).';
    }

    if (!isRequired(formData.address)) {
      newErrors.address = 'Residential address is required.';
    }

    if (!isValidPincode(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode.';
    }

    if (selectedCategories.length === 0) {
      newErrors.categories = 'Please select at least one category.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    
    // Clear error for this specific field as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    // Clear global message when user interacts
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleFamilyChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((current) => {
      const updatedMembers = [...current.familyMembers];
      updatedMembers[index] = { ...updatedMembers[index], [name]: value };
      return { ...current, familyMembers: updatedMembers };
    });
  };

  const addMember = () => {
    setFormData((current) => ({
      ...current,
      familyMembers: [...current.familyMembers, { name: '', rasi: '', star: '', dob: '' }],
    }));
  };

  const removeMember = (index) => {
    setFormData((current) => {
      if (current.familyMembers.length === 1) return current;
      return {
        ...current,
        familyMembers: current.familyMembers.filter((_, i) => i !== index),
      };
    });
  };

  const toggleCategory = (category) => {
    setSelectedCategories((current) => {
      const next = current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category];
      
      // Clear category error if user selects something
      if (next.length > 0 && errors.categories) {
        setErrors(prev => ({ ...prev, categories: '' }));
      }
      return next;
    });
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validate Frontend
    if (!validateForm()) {
      // If validation fails, scroll to top or first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const normalizedPhone = formData.phone.replace(/\D/g, '');
    const finalPhone = normalizedPhone.slice(-10); 

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setMessage({ type: 'error', text: 'Failed to load Razorpay checkout. Please check your internet connection.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage({ type: '', text: '' }); // Clear previous messages

      const orderData = await createPrasadhamOrder({
        selectedCategories,
        totalAmount,
      });

      if (!orderData || !orderData.order_id) {
        throw new Error('Server failed to create a valid payment order. Please try again later.');
      }

      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Jaivarahi',
        description: eventTitle || 'Prasadham Booking',
        order_id: orderData.order_id,
        prefill: {
          name: formData.primaryName,
          contact: normalizedPhone, // Use normalized phone for prefill
        },
        handler: async (response) => {
          try {
            const verifyData = await verifyPrasadhamPayment({
              payload: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                selectedCategories,
                totalAmount,
                booking: {
                  ...formData,
                  phone: finalPhone,
                  eventTitle,
                },
              },
            });

            setMessage({
              type: 'success',
              text: `Payment verified successfully! Your Booking ID is: ${verifyData.booking_id}`,
            });

            // Optional: Reset form or close after delay
            setTimeout(() => {
                if (onClose) onClose();
            }, 5000);

          } catch (verifyError) {
            console.error(verifyError);
            setMessage({
              type: 'error',
              text: verifyError.message || 'Payment succeeded but verification failed. Please contact support with your transaction ID.',
            });
          } finally {
            setIsSubmitting(false);
          }
        },
        theme: {
          color: '#F48521',
        },
        // Handle payment dismissal or failure
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
            setMessage({ type: 'error', text: 'Payment popup was closed before completion.' });
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setMessage({ type: 'error', text: error.message || 'Unable to start payment flow. Please try again.' });
    }
  };

  return (
    <div key={eventTitle} className="prasadham-form prasadham-form--alert" role="region" aria-label="Prasadham and Pooja Registration">
      <div className="prasadham-form__header">
        <div className="prasadham-form__heading-block">
          <p className="prasadham-form__tag">Temple Booking</p>
          <h2 className="prasadham-form__title">Prasadham and Pooja Registration</h2>
          {eventTitle && <p className="prasadham-form__subtitle">Selected Event: {eventTitle}</p>}
        </div>
        {onClose && (
          <button type="button" className="prasadham-form__close" onClick={onClose} aria-label="Close form">
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>

      {/* Global System Message (Payment Success/Failure) */}
      {message.text && (
        <div className={`prasadham-form__global-msg ${message.type === 'error' ? 'is-error' : 'is-success'}`} role="alert">
          <span className="icon">{message.type === 'error' ? '⚠' : '✓'}</span>
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="prasadham-form__hero">
          <div className="prasadham-form__hero-copy">
            <p className="prasadham-form__eyebrow">Secure temple offering booking</p>
            <h3 className="prasadham-form__hero-title">Choose one or more offerings and pay in a single checkout.</h3>
          </div>
          <div className="prasadham-form__hero-summary">
            <span className="prasadham-form__hero-summary-label">Current Total</span>
            <strong>Rs. {totalAmount.toLocaleString('en-IN')}</strong>
            <small>{selectedCategories.length} selection{selectedCategories.length === 1 ? '' : 's'}</small>
          </div>
        </div>

        <div className="prasadham-form__panel">
          <h3 className="prasadham-form__section-title">Primary Contact</h3>
          <div className="prasadham-form__grid">
            
            {/* Name Field */}
            <div className="prasadham-form__field">
              <label className="prasadham-form__label" htmlFor="primaryName">Name <span className="required">*</span></label>
              <input 
                id="primaryName" 
                type="text" 
                name="primaryName" 
                value={formData.primaryName}
                onChange={handleInputChange} 
                className={`prasadham-form__input ${errors.primaryName ? 'is-error' : ''}`} 
                placeholder="Full name" 
              />
              {errors.primaryName && <span className="prasadham-form__error-text">{errors.primaryName}</span>}
            </div>

            {/* Phone Field with Validation */}
            <div className="prasadham-form__field">
              <label className="prasadham-form__label" htmlFor="phone">Phone Number <span className="required">*</span></label>
              <input 
                id="phone" 
                type="tel" 
                name="phone" 
                value={formData.phone}
                onChange={handleInputChange} 
                className={`prasadham-form__input ${errors.phone ? 'is-error' : ''}`} 
                placeholder="10-digit mobile number" 
              />
              {errors.phone && <span className="prasadham-form__error-text">{errors.phone}</span>}
            </div>

            {/* Address Field */}
            <div className="prasadham-form__field prasadham-form__field--full">
              <label className="prasadham-form__label" htmlFor="address">Residential Address <span className="required">*</span></label>
              <textarea 
                id="address" 
                name="address" 
                value={formData.address}
                onChange={handleInputChange} 
                className={`prasadham-form__input prasadham-form__textarea ${errors.address ? 'is-error' : ''}`} 
                placeholder="House number, street, city, state, country" 
              />
              {errors.address && <span className="prasadham-form__error-text">{errors.address}</span>}
            </div>

            {/* Pincode Field */}
            <div className="prasadham-form__field">
              <label className="prasadham-form__label" htmlFor="pincode">Pincode <span className="required">*</span></label>
              <input 
                id="pincode" 
                type="text" 
                name="pincode" 
                value={formData.pincode}
                onChange={handleInputChange} 
                className={`prasadham-form__input ${errors.pincode ? 'is-error' : ''}`} 
                placeholder="Postal code" 
              />
              {errors.pincode && <span className="prasadham-form__error-text">{errors.pincode}</span>}
            </div>

            {/* Gothuram Field (Optional) */}
            <div className="prasadham-form__field">
              <label className="prasadham-form__label" htmlFor="gothuram">Gothuram (Gothram)</label>
              <input 
                id="gothuram" 
                type="text" 
                name="gothuram" 
                value={formData.gothuram}
                onChange={handleInputChange} 
                className="prasadham-form__input" 
                placeholder="Your gothram" 
              />
            </div>
          </div>
        </div>

        <div className="prasadham-form__panel">
          <h3 className="prasadham-form__section-title">Select Categories</h3>
          {errors.categories && <p className="prasadham-form__error-text prasadham-form__error-text--block">{errors.categories}</p>}
          
          <div className="prasadham-form__checkbox-grid">
            {categoryOptions.map((category) => (
              <label key={category.value} className="prasadham-form__checkbox-card">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.value)}
                  onChange={() => toggleCategory(category.value)}
                />
                <span>
                  <strong>{category.label}</strong>
                  <small>Rs. {category.price.toLocaleString('en-IN')}</small>
                </span>
                <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
              </label>
            ))}
          </div>
          <div className="prasadham-form__selection-bar">
            <div>
              <span className="prasadham-form__selection-label">Selected offerings</span>
              <div className="prasadham-form__chips">
                {selectedCategories.length ? (
                  selectedCategories.map((item) => (
                    <span key={item} className="prasadham-form__chip">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="prasadham-form__chip prasadham-form__chip--empty">No category selected yet</span>
                )}
              </div>
            </div>
            <div className="prasadham-form__total">
              <span>Total Amount</span>
              <strong>Rs. {totalAmount.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        <div className="prasadham-form__panel">
          <h3 className="prasadham-form__section-title">Family Member Details (for Sankalpam)</h3>
          {formData.familyMembers.map((member, index) => (
            <div key={index} className="prasadham-form__member">
              <div className="prasadham-form__member-head">
                <p className="prasadham-form__member-title">Member {index + 1}</p>
                {formData.familyMembers.length > 1 && (
                  <button type="button" className="prasadham-form__remove" onClick={() => removeMember(index)} aria-label={`Remove member ${index + 1}`} title="Remove member">
                    <i className="fa-solid fa-trash" aria-hidden="true"></i>
                  </button>
                )}
              </div>
              <div className="prasadham-form__grid">
                <div className="prasadham-form__field">
                  <label className="prasadham-form__label">Full Name</label>
                  <input type="text" name="name" placeholder="Full Name" value={member.name} onChange={(e) => handleFamilyChange(index, e)} className="prasadham-form__input" />
                </div>
                <div className="prasadham-form__field">
                  <label className="prasadham-form__label">Rasi</label>
                  <select name="rasi" value={member.rasi} onChange={(e) => handleFamilyChange(index, e)} className="prasadham-form__input">
                    <option value="" disabled>Select Rasi</option>
                    {rasiOptions.map((rasi) => (
                      <option key={rasi.value} value={`${rasi.ta} (${rasi.en})`}>
                        {rasi.ta} ({rasi.en})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="prasadham-form__field">
                  <label className="prasadham-form__label">Star</label>
                  <select 
                    name="star" 
                    value={member.star} 
                    onChange={(e) => handleFamilyChange(index, e)} 
                    className="prasadham-form__input"
                  >
                    <option value="" disabled>Select Star</option>
                    {starOptions.map((star) => (
                      <option key={star} value={star}>
                        {star}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="prasadham-form__field">
                  <label className="prasadham-form__label" htmlFor={`dob-${index}`}>DOB</label>
                  <input id={`dob-${index}`} type="date" name="dob" value={member.dob} onChange={(e) => handleFamilyChange(index, e)} className="prasadham-form__input" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="prasadham-form__actions">
          <button type="button" onClick={addMember} className="prasadham-form__add">+ Add Family Member</button>
          <button type="submit" className="prasadham-form__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : `Submit & Pay Rs. ${totalAmount.toLocaleString('en-IN')}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrasadhamForm;