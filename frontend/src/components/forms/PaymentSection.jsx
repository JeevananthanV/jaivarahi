import React, { useState } from 'react';
import { createJothidamOrder, verifyJothidamPayment } from '../../api/paymentAPI';

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

const PaymentSection = ({ formData, onFieldChange, priceSummary, bookingId, onPaymentSuccess, onPaymentError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    onFieldChange(prev => ({ ...prev, [name]: value }));
  };

  const { servicePrice = 0, consultationCharge = 0, travelCharge = 0, gst = 0, discount = 0, grandTotal = 0 } = priceSummary || {};

  const handlePayment = async () => {
    if (!bookingId) {
      setMessage({ type: 'error', text: 'Booking ID missing. Please go back and try again.' });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: '', text: '' });

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay checkout. Please check your internet connection.');
      }

      const orderData = await createJothidamOrder(bookingId, grandTotal);
      if (!orderData || !orderData.order_id) {
        throw new Error('Server failed to create a valid payment order. Please try again later.');
      }

      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Jaivarahi',
        description: `Jothidam - ${formData.service_type}`,
        order_id: orderData.order_id,
        prefill: {
          name: formData.fullName,
          contact: formData.mobileNumber,
          email: formData.email || '',
        },
        handler: async (response) => {
          try {
            const verifyData = await verifyJothidamPayment(bookingId, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setMessage({ type: 'success', text: `Payment verified successfully! Booking ID: ${verifyData.bookingId}` });
            if (onPaymentSuccess) {
              onPaymentSuccess(verifyData);
            }
          } catch (verifyError) {
            console.error(verifyError);
            setMessage({ type: 'error', text: verifyError.message || 'Payment succeeded but verification failed. Please contact support.' });
            if (onPaymentError) {
              onPaymentError(verifyError);
            }
          } finally {
            setIsProcessing(false);
          }
        },
        theme: {
          color: '#F48521',
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            setMessage({ type: 'error', text: 'Payment popup was closed before completion.' });
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Payment failed. Please try again.' });
      if (onPaymentError) {
        onPaymentError(err);
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="jothidam-form__panel">
      <h3 className="jothidam-form__section-title">Payment Summary</h3>
      <div className="jothidam-form__price-breakdown">
        <div className="jothidam-form__price-row">
          <span>Service Price</span>
          <strong>₹{Number(servicePrice).toLocaleString('en-IN')}</strong>
        </div>
        <div className="jothidam-form__price-row">
          <span>Consultation Charge</span>
          <strong>₹{Number(consultationCharge).toLocaleString('en-IN')}</strong>
        </div>
        <div className="jothidam-form__price-row">
          <span>Travel Charge</span>
          <strong>₹{Number(travelCharge).toLocaleString('en-IN')}</strong>
        </div>
        <div className="jothidam-form__price-row">
          <span>GST</span>
          <strong>₹{Number(gst).toLocaleString('en-IN')}</strong>
        </div>
        <div className="jothidam-form__price-row">
          <span>Discount</span>
          <strong>-₹{Number(discount).toLocaleString('en-IN')}</strong>
        </div>
        <div className="jothidam-form__price-row jothidam-form__price-row--total">
          <span>Grand Total</span>
          <strong>₹{Number(grandTotal).toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <div className="jothidam-form__field">
        <label className="jothidam-form__label" htmlFor="coupon_code">Coupon Code</label>
        <input id="coupon_code" type="text" name="coupon_code" value={formData.coupon_code || ''} onChange={handleChange} className="jothidam-form__input" placeholder="Enter coupon code" />
      </div>

      {message.text && (
        <div className={`jothidam-form__message ${message.type === 'error' ? 'is-error' : 'is-success'}`} role="alert">
          {message.text}
        </div>
      )}

      <button type="button" className="jothidam-form__pay-btn" onClick={handlePayment} disabled={isProcessing || !bookingId}>
        {isProcessing ? 'Processing...' : `Pay ₹${Number(grandTotal).toLocaleString('en-IN')}`}
      </button>
    </div>
  );
};

export default PaymentSection;
