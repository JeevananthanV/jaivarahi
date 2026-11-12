import React, { useState } from 'react';
import BACKEND_URL from '../../api/config.js';
import { sendDonationReceiptToEmail } from '../../api/paymentAPI.js';

const DonationReceipt = ({ receiptData, onClose, formatINR }) => {
  if (!receiptData) return null;

  const [emailInput, setEmailInput] = useState(receiptData.donorEmail || '');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

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
        paymentId: receiptData.paymentId,
        email: targetEmail,
      });
      if (res?.success) {
        setFeedback({
          type: 'success',
          message: `Official 80G PDF receipt sent to ${targetEmail}`,
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
    <div className="kosala-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="kosala-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-success">
          <i className="fas fa-check"></i>
        </div>
        <h3 className="modal-receipt-title">
          Sacred Donation Successful!
        </h3>
        <p className="modal-receipt-desc">
          By the divine grace of Sri Kottai Varahi Amman, your sacred Kosala Go Seva contribution has been received.
        </p>

        {receiptData.donorEmail && (
          <div className="receipt-email-status-banner">
            <i className="fas fa-envelope-circle-check"></i>
            <span>
              Official 80G PDF receipt automatically sent to <strong>{receiptData.donorEmail}</strong>
            </span>
          </div>
        )}

        <div className="modal-receipt-box">
          <div className="receipt-row">
            <span className="label">Receipt Number:</span>
            <span className="val receipt-val-mono">{receiptData.receiptNumber}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Donor Name:</span>
            <span className="val">{receiptData.donorName}</span>
          </div>
          {receiptData.donorEmail && (
            <div className="receipt-row">
              <span className="label">Devotee Email:</span>
              <span className="val receipt-val-small">{receiptData.donorEmail}</span>
            </div>
          )}
          <div className="receipt-row">
            <span className="label">Offering Category:</span>
            <span className="val">{receiptData.category}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Amount Paid:</span>
            <span className="val receipt-val-primary">{formatINR(receiptData.amount)}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Payment ID:</span>
            <span className="val receipt-val-small">{receiptData.paymentId}</span>
          </div>
        </div>

        <div className="receipt-email-send-section">
          <label htmlFor="receipt-email-field" className="receipt-email-send-label">
            <i className="fas fa-paper-plane mr-1"></i>
            {receiptData.donorEmail ? 'Send copy to another email / Resend receipt:' : 'Email 80G PDF Receipt to your inbox:'}
          </label>
          <form onSubmit={handleSendEmail} className="receipt-email-input-group">
            <input
              id="receipt-email-field"
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
            href={`${BACKEND_URL}/api/payments/donation/receipt/${receiptData.paymentId}`}
            target="_blank"
            rel="noreferrer"
            className="btn-hero-primary btn-receipt-modal-primary"
          >
            <i className="fas fa-file-pdf"></i>
            <span>Download Official PDF</span>
          </a>
          <button
            type="button"
            className="btn-hero-secondary btn-receipt-modal-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationReceipt;
