import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendDonationReceiptToEmail } from '../../../api/paymentAPI.js';
import BACKEND_URL from '../../../api/config.js';

const DonationDetails = ({ donation, onClose, formatINR }) => {
  if (!donation) return null;

  const [resendEmail, setResendEmail] = useState(donation.donor_email || '');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    const targetEmail = (resendEmail || '').trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setFeedback({ type: 'error', message: 'Please enter a valid devotee email address.' });
      return;
    }

    const payId = donation.payment_id || donation.receipt_number || donation.id;
    try {
      setIsSending(true);
      setFeedback(null);
      const res = await sendDonationReceiptToEmail({ paymentId: payId, email: targetEmail });
      if (res?.success) {
        setFeedback({ type: 'success', message: `Official 80G receipt successfully emailed to ${targetEmail}` });
        donation.donor_email = targetEmail;
      } else {
        throw new Error(res?.error || 'Failed to dispatch email');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Unable to send email right now' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="kosala-modal-overlay">
      <div className="kosala-modal-box text-left">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="cat-title">Donation Record #{donation.id}</div>
          <button type="button" className="btn-receipt-download" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-receipt-box">
          <div className="receipt-row">
            <span className="label">Receipt Voucher:</span>
            <span className="val receipt-val-mono">{donation.receipt_number || `JVP-GOSALA-${donation.id}`}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Donor Name:</span>
            <span className="val">{donation.name} {donation.is_anonymous ? '(Marked Anonymous)' : ''}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Phone Number:</span>
            <span className="val cow-tag-mono">{donation.phone}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Email Address:</span>
            <span className="val">{donation.donor_email || '—'}</span>
          </div>
          <div className="receipt-row">
            <span className="label">City / Address:</span>
            <span className="val">{donation.city || donation.address || '—'}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Category / Seva:</span>
            <span className="val badge-category">{donation.category}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Amount:</span>
            <span className="val receipt-val-primary font-weight-bold">{formatINR(donation.amount_inr)}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Payment Status:</span>
            <span className={`val badge-verified ${donation.status === 'paid' ? '' : 'text-danger'}`}>
              {donation.status}
            </span>
          </div>
          <div className="receipt-row">
            <span className="label">Razorpay Payment ID:</span>
            <span className="val receipt-val-mono receipt-val-small">{donation.payment_id || '—'}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Razorpay Order ID:</span>
            <span className="val receipt-val-mono receipt-val-small">{donation.order_id || '—'}</span>
          </div>
          <div className="receipt-row">
            <span className="label">Created Date:</span>
            <span className="val">{donation.created_at ? new Date(donation.created_at).toLocaleString('en-IN') : '—'}</span>
          </div>
          {donation.paid_at && (
            <div className="receipt-row">
              <span className="label">Settled At:</span>
              <span className="val">{new Date(donation.paid_at).toLocaleString('en-IN')}</span>
            </div>
          )}
          {donation.notes && (
            <div className="mt-2 pt-2 border-top">
              <span className="label d-block text-muted">Devotee Sankalpam Prayers:</span>
              <p className="cow-story mt-1">{donation.notes}</p>
            </div>
          )}
        </div>

        {/* Resend PDF Receipt via Email */}
        <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '14px' }}>
          <label htmlFor="kosala-resend-email" style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
            <i className="fas fa-paper-plane mr-1" style={{ color: '#9a3b34' }}></i>
            Send / Resend PDF Receipt to Devotee Email:
          </label>
          <form onSubmit={handleSendEmail} style={{ display: 'flex', gap: '8px' }}>
            <input
              id="kosala-resend-email"
              type="email"
              placeholder="devotee@example.com"
              value={resendEmail}
              onChange={(e) => {
                setResendEmail(e.target.value);
                if (feedback) setFeedback(null);
              }}
              style={{
                flex: 1,
                padding: '6px 10px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending}
              style={{
                padding: '6px 14px',
                backgroundColor: '#9a3b34',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {isSending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-envelope"></i>}
              <span>{isSending ? 'Sending...' : 'Send Mail'}</span>
            </button>
          </form>
          {feedback && (
            <div style={{
              marginTop: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: feedback.type === 'success' ? '#166534' : '#b91c1c'
            }}>
              <i className={`fas fa-${feedback.type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-1`}></i>
              {feedback.message}
            </div>
          )}
        </div>

        <div className="modal-receipt-actions mt-3">
          {donation.payment_id && (
            <>
              <a
                href={`${BACKEND_URL}/api/payments/donation/receipt/${donation.payment_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero-primary pgn-action-btn"
                style={{ textDecoration: 'none' }}
              >
                <i className="fas fa-file-pdf mr-1"></i> Download PDF
              </a>
              <Link
                to={`/kosala/receipt/${donation.payment_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero-secondary pgn-action-btn"
                style={{ textDecoration: 'none' }}
              >
                <i className="fas fa-file-invoice mr-1"></i> Online Record
              </Link>
            </>
          )}
          <button
            type="button"
            className="btn-hero-secondary btn-receipt-modal-close pgn-action-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationDetails;
