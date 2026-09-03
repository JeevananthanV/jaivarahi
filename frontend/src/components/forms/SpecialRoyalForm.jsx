import React, { useEffect, useState } from 'react';
import { createSpecialRoyalOrder, verifySpecialRoyalPayment } from '../../api/specialRoyalAPI.js';
import { isRequired, isValidPhone, isValidPincode } from '../../utils/formValidation';

const SpecialRoyalForm = ({ eventTitle = 'Sri Varahi Divya Aradhana', onClose }) => {
  const [formData, setFormData] = useState({
    primaryName: '',
    gothuram: '',
    phone: '',
    address: '',
    pincode: '',
    familyMembers: [{ name: '', rasi: '', star: '' }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {};
    document.body.appendChild(script);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFamilyChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((current) => {
      const familyMembers = [...current.familyMembers];
      familyMembers[index] = { ...familyMembers[index], [name]: value };
      return { ...current, familyMembers };
    });
  };

  const addMember = () => {
    setFormData((current) => ({
      ...current,
      familyMembers: [...current.familyMembers, { name: '', rasi: '', star: '' }],
    }));
  };

  const removeMember = (index) => {
    setFormData((current) => ({
      ...current,
      familyMembers: current.familyMembers.length > 1
        ? current.familyMembers.filter((_, i) => i !== index)
        : current.familyMembers,
    }));
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
    setMessage({ type: '', text: '' });

    const newErrors = {};
    if (!isRequired(formData.primaryName)) {
      newErrors.primaryName = 'Name is required.';
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
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const normalizedPhone = formData.phone.replace(/\D/g, '');
    const finalPhone = normalizedPhone.slice(-10); // Take last 10 digits

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setMessage({ type: 'error', text: 'Failed to load Razorpay checkout.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const orderData = await createSpecialRoyalOrder();

      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Jaivarahi',
        description: eventTitle,
        order_id: orderData.order_id,
        prefill: {
          name: formData.primaryName,
          contact: normalizedPhone,
        },
        handler: async (response) => {
          try {
            const verifyData = await verifySpecialRoyalPayment({
              payload: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                totalAmount: 21000,
                booking: {
                  ...formData,
                  phone: finalPhone,
                  eventTitle,
                },
              },
            });

            setMessage({
              type: 'success',
              text: verifyData?.message || `Welcome ${formData.primaryName}, your payment was successful.`,
            });
          } catch (verifyError) {
            setMessage({
              type: 'error',
              text: verifyError.message || 'Payment succeeded but verification failed.',
            });
          }
        },
        theme: {
          color: '#528FF0',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', () => {
        setMessage({ type: 'error', text: 'Payment not done. Please contact +91 90928 78389.' });
      });
      paymentObject.open();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Unable to start payment flow.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="prasadham-form prasadham-form--alert" role="region" aria-label="Special Royal Registration">
      <div className="prasadham-form__header">
        <div className="prasadham-form__heading-block">
          <p className="prasadham-form__tag">Royal Seva Booking</p>
          <h2 className="prasadham-form__title">Special Royal Seva Registration</h2>
          <p className="prasadham-form__subtitle">Fixed amount: Rs. 21,000</p>
        </div>
        {onClose && (
          <button type="button" className="prasadham-form__close" onClick={onClose} aria-label="Close form">
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="prasadham-form__panel">
          <h3 className="prasadham-form__section-title">Primary Contact</h3>
          <div className="prasadham-form__grid">
            <div className="prasadham-form__field">
              <label className="prasadham-form__label" htmlFor="primaryName">Name</label>
              <input 
                id="primaryName" 
                type="text" 
                name="primaryName" 
                required 
                value={formData.primaryName}
                onChange={handleInputChange} 
                className={`prasadham-form__input ${errors.primaryName ? 'is-error' : ''}`} 
                placeholder="Full name" 
              />
              {errors.primaryName && <span className="prasadham-form__error-text">{errors.primaryName}</span>}
            </div>
            <div className="prasadham-form__field">
              <label className="prasadham-form__label" htmlFor="phone">Phone Number</label>
              <input 
                id="phone" 
                type="tel" 
                name="phone" 
                required 
                value={formData.phone}
                onChange={handleInputChange} 
                className={`prasadham-form__input ${errors.phone ? 'is-error' : ''}`} 
                placeholder="Your phone" 
              />
              {errors.phone && <span className="prasadham-form__error-text">{errors.phone}</span>}
            </div>
            <div className="prasadham-form__field prasadham-form__field--full">
              <label className="prasadham-form__label" htmlFor="address">Residential Address</label>
              <textarea 
                id="address" 
                name="address" 
                required 
                value={formData.address}
                onChange={handleInputChange} 
                className={`prasadham-form__input prasadham-form__textarea ${errors.address ? 'is-error' : ''}`} 
                placeholder="House number, street, city, state, country" 
              />
              {errors.address && <span className="prasadham-form__error-text">{errors.address}</span>}
            </div>
            <div className="prasadham-form__field">
              <label className="prasadham-form__label" htmlFor="pincode">Pincode</label>
              <input 
                id="pincode" 
                type="text" 
                name="pincode" 
                required 
                value={formData.pincode}
                onChange={handleInputChange} 
                className={`prasadham-form__input ${errors.pincode ? 'is-error' : ''}`} 
                placeholder="Postal code" 
              />
              {errors.pincode && <span className="prasadham-form__error-text">{errors.pincode}</span>}
            </div>
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
                    <option value="mesham">Mesham</option>
                    <option value="rishabam">Rishabam</option>
                    <option value="midhunam">Midhunam</option>
                    <option value="kadagam">Kadagam</option>
                    <option value="simmam">Simmam</option>
                    <option value="kanni">Kanni</option>
                    <option value="thulaam">Thulaam</option>
                    <option value="viruchigam">Viruchigam</option>
                    <option value="dhanusu">Dhanusu</option>
                    <option value="magaram">Magaram</option>
                    <option value="kumbam">Kumbam</option>
                    <option value="meenam">Meenam</option>
                  </select>
                </div>
                <div className="prasadham-form__field">
                  <label className="prasadham-form__label">Star</label>
                  <input type="text" name="star" placeholder="Star (Nakshatra)" value={member.star} onChange={(e) => handleFamilyChange(index, e)} className="prasadham-form__input" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="prasadham-form__actions">
          <button type="button" onClick={addMember} className="prasadham-form__add">+ Add Family Member</button>
          <button type="submit" className="prasadham-form__submit" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Submit & Pay Rs. 21,000'}
          </button>
        </div>
      </form>

      {message.text && (
        <p className={`prasadham-form__notice ${message.type === 'error' ? 'is-error' : 'is-success'}`} role="status">
          {message.text}
        </p>
      )}
    </div>
  );
};

export default SpecialRoyalForm;
