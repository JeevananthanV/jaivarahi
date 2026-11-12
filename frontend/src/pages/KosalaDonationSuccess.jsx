import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx';
import BACKEND_URL from '../api/config.js';
import { sendDonationReceiptToEmail } from '../api/paymentAPI.js';

const KosalaDonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('payment_id') || 'RZP-PAY-REF';
  const receiptNum = searchParams.get('receipt') || 'JVP-GOSALA-XXXX';
  const amount = searchParams.get('amount') || '0';
  const donorName = searchParams.get('name') || 'Devotee';
  const donorEmail = searchParams.get('email') || '';

  const [emailInput, setEmailInput] = useState(donorEmail || '');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val) || 0);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    const targetEmail = (emailInput || '').trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!targetEmail || !emailRegex.test(targetEmail)) {
      setFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    try {
      setIsSending(true);
      setFeedback(null);
      const res = await sendDonationReceiptToEmail({
        paymentId,
        email: targetEmail,
      });
      if (res?.success) {
        setFeedback({
          type: 'success',
          message: `Official 80G PDF receipt successfully dispatched to ${targetEmail}`,
        });
      } else {
        throw new Error(res?.error || 'Failed to dispatch email receipt');
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Unable to send email right now. Please try again.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="kosala-page">
      <Helmet>
        <title>Donation Successful | Sri Jai Varahi Peedam Kosala</title>
        <meta name="description" content="Thank you for your sacred Go Seva offering. Your donation has been recorded with an official receipt." />
      </Helmet>

      <Header />

      <div className="donation-result-page">
        <div className="site-container">
          <div className="donation-result-card">
            <div className="result-icon-lg success">
              <i className="fas fa-check"></i>
            </div>

            <h1 className="result-title-lg">கோசேவை காணிக்கை பெறப்பட்டது</h1>
            <p className="result-desc-lg">
              Dear <strong>{donorName}</strong>, thank you for your sacred offering of <strong>{formatINR(amount)}</strong> towards Sri Jai Varahi Peedam Kosala. May Sri Kottai Varahi Amman shower you and your family with peace, prosperity, and health.
            </p>

            {donorEmail && (
              <div className="receipt-email-status-banner">
                <i className="fas fa-envelope-circle-check"></i>
                <span>
                  Official 80G PDF receipt automatically sent to <strong>{donorEmail}</strong>
                </span>
              </div>
            )}

            <div className="modal-receipt-box">
              <div className="receipt-row">
                <span className="label">Receipt Number</span>
                <span className="val receipt-val-mono">{receiptNum}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Payment ID</span>
                <span className="val receipt-val-mono receipt-val-small">{paymentId}</span>
              </div>
              {donorEmail && (
                <div className="receipt-row">
                  <span className="label">Devotee Email</span>
                  <span className="val receipt-val-small">{donorEmail}</span>
                </div>
              )}
              <div className="receipt-row">
                <span className="label">Donation Amount</span>
                <span className="val receipt-val-primary">{formatINR(amount)}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Date</span>
                <span className="val">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Tax Exemption</span>
                <span className="val">Eligible for Section 80G Deduction</span>
              </div>
            </div>

            <div className="receipt-email-send-section">
              <label htmlFor="success-email-field" className="receipt-email-send-label">
                <i className="fas fa-paper-plane mr-1"></i>
                {donorEmail ? 'Send copy to another email / Resend receipt:' : 'Email 80G PDF Receipt to your inbox:'}
              </label>
              <form onSubmit={handleSendEmail} className="receipt-email-input-group">
                <input
                  id="success-email-field"
                  type="email"
                  className="receipt-email-input"
                  placeholder="devotee@example.com"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (feedback) setFeedback(null);
                  }}
                  disabled={isSending}
                />
                <button
                  type="submit"
                  className="receipt-email-send-btn"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-envelope"></i>
                      <span>Send PDF</span>
                    </>
                  )}
                </button>
              </form>
              {feedback && (
                <div className={`receipt-email-feedback ${feedback.type}`}>
                  <i className={`fas fa-${feedback.type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-1`}></i>
                  {feedback.message}
                </div>
              )}
            </div>

            <div className="modal-receipt-actions">
              <a
                href={`${BACKEND_URL}/api/payments/donation/receipt/${paymentId}`}
                target="_blank"
                rel="noreferrer"
                className="btn-hero-primary btn-receipt-modal-primary"
              >
                <i className="fas fa-file-pdf"></i>
                <span>Download Official PDF</span>
              </a>
              <Link
                to={`/kosala/receipt/${paymentId}`}
                className="btn-hero-secondary btn-receipt-modal-close"
              >
                <i className="fas fa-file-invoice"></i> View Web Receipt
              </Link>
            </div>
            
            <div className="mt-3">
              <Link to="/kosala" className="btn-receipt-download">
                <i className="fas fa-arrow-left"></i> Return to Kosala Overview
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <FloatActions />
    </div>
  );
};

export default KosalaDonationSuccess;
