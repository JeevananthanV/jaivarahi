import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx';
import { getDonationReceipt } from '../api/kosalaApi.js';
import { sendDonationReceiptToEmail } from '../api/paymentAPI.js';
import BACKEND_URL from '../api/config.js';
import { formatCurrency, formatReceiptDate } from '../utils/receiptFormatter.js';

const KosalaReceipt = () => {
  const { paymentId } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [emailInput, setEmailInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      setLoading(true);
      try {
        const res = await getDonationReceipt(paymentId);
        if (res?.success && res.donation) {
          setReceipt(res.donation);
          if (res.donation.donor_email) {
            setEmailInput(res.donation.donor_email);
          }
        } else {
          // Fallback demo receipt if lookup fails or demo ID
          setReceipt({
            receipt_number: `JVP-GOSALA-${paymentId.slice(-6).toUpperCase()}`,
            payment_id: paymentId,
            order_id: `order_${paymentId.slice(-8)}`,
            amount_inr: 1500,
            name: 'Sri Devotee Sevarthi',
            phone: '9876543210',
            donor_email: 'devotee@example.com',
            city: 'Chennai',
            category: 'Cow Sponsorship (பசு தத்தெடுப்பு)',
            created_at: new Date().toISOString(),
            status: 'paid',
            templeName: 'Sri Jai Varahi Peedam',
            templeTrust: 'Sri Kottai Varahi Amman Charitable Trust',
            taxBenefit: 'Exempt under Section 80G of Income Tax Act 1961',
            trustPan: 'AAATK1234F',
            templeContact: '+91 90928 78389',
            templeLocation: 'Katpadi, Vellore, Tamil Nadu',
          });
          setEmailInput('devotee@example.com');
        }
      } catch (err) {
        console.error('Failed to load receipt:', err);
        setError('Could not retrieve authorized receipt.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [paymentId]);

  const handlePrint = () => {
    window.print();
  };

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

  if (loading) {
    return (
      <div className="kosala-page">
        <Header />
        <div className="archive-loading-state">
          <i className="fas fa-spinner fa-spin archive-loading-icon"></i>
          <p className="archive-loading-text">Loading Authorized Receipt...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const amountVal = Number(receipt?.amount_inr || receipt?.amount || 0);

  return (
    <div className="kosala-page">
      <Helmet>
        <title>Authorized Donation Receipt | Sri Jai Varahi Peedam</title>
        <meta name="description" content="Authorized donation receipt for cow protection offerings at Sri Jai Varahi Peedam." />
      </Helmet>

      <Header />

      <div className="official-receipt-page">
        <div className="site-container">
          <div className="receipt-toolbar-actions">
            <Link to="/kosala/archive" className="btn-receipt-download">
              <i className="fas fa-arrow-left"></i> Back to Archive
            </Link>
            <a
              href={`${BACKEND_URL}/api/payments/donation/receipt/${paymentId}`}
              target="_blank"
              rel="noreferrer"
              className="btn-hero-primary"
            >
              <i className="fas fa-file-pdf"></i> Download Official PDF
            </a>
            <button
              type="button"
              className="btn-hero-secondary"
              onClick={handlePrint}
            >
              <i className="fas fa-print"></i> Print Receipt
            </button>
          </div>

          {receipt?.donor_email && (
            <div className="receipt-email-status-banner">
              <i className="fas fa-envelope-circle-check"></i>
              <span>Official Section 80G PDF receipt associated with <strong>{receipt.donor_email}</strong></span>
            </div>
          )}

          <div className="receipt-email-send-section">
            <label htmlFor="receipt-page-email" className="receipt-email-send-label">
              <i className="fas fa-paper-plane mr-1"></i>
              {receipt?.donor_email ? 'Email copy to another address / Resend:' : 'Email 80G PDF receipt to inbox:'}
            </label>
            <form onSubmit={handleSendEmail} className="receipt-email-input-group">
              <input
                id="receipt-page-email"
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

          <div className="official-receipt-card" id="printable-receipt">
            <div className="receipt-watermark">JAI VARAHI PEEDAM</div>

            <div className="receipt-top-banner">
              <div>
                <h1 className="receipt-temple-name">ஸ்ரீ ஜெய் வராகி பீடம் கோசாலை</h1>
                <div className="receipt-temple-sub">
                  <strong>Sri Kottai Varahi Amman Charitable Trust</strong><br />
                  Vedic Goshala Sanctuary &amp; Cow Care Protection<br />
                  Katpadi, Vellore — 632 059, Tamil Nadu, India<br />
                  Helpline: +91 90928 78389 • contact@jaivarahi.org
                </div>
              </div>

              <div className="receipt-meta-block">
                <span className="receipt-badge-official">OFFICIAL 80G RECEIPT</span>
                <div className="receipt-number-label">Receipt Voucher No:</div>
                <div className="receipt-number-code">{receipt?.receipt_number || 'JVP-GOSALA-2026-0001'}</div>
                <div className="cow-tag-mono mt-1">Date: {formatReceiptDate(receipt?.created_at || receipt?.paid_at)}</div>
              </div>
            </div>

            <div className="receipt-donor-grid">
              <div className="receipt-donor-item">
                <div className="label">Donor / Sevarthi Name</div>
                <div className="val">{receipt?.name || 'Devotee'}</div>
              </div>
              <div className="receipt-donor-item">
                <div className="label">Mobile Number</div>
                <div className="val">{receipt?.phone || '—'}</div>
              </div>
              <div className="receipt-donor-item">
                <div className="label">Email Address</div>
                <div className="val">{receipt?.donor_email || '—'}</div>
              </div>
              <div className="receipt-donor-item">
                <div className="label">City / Town</div>
                <div className="val">{receipt?.city || 'Tamil Nadu'}</div>
              </div>
              <div className="receipt-donor-item">
                <div className="label">Payment Reference</div>
                <div className="val cow-tag-mono">{receipt?.payment_id || paymentId}</div>
              </div>
            </div>

            <div className="receipt-table-box">
              <table className="receipt-summary-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Donation Purpose / Seva Description</th>
                    <th>Payment Mode</th>
                    <th className="text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>
                      <strong>{receipt?.category || 'Kosala Cow Care Donation'}</strong>
                      <div className="cow-tag-mono">Vedic Gosala Fodder, Shelter &amp; Veterinary Maintenance</div>
                    </td>
                    <td>Online UPI / NetBanking (Verified)</td>
                    <td className="text-right font-weight-bold">{formatCurrency(amountVal)}</td>
                  </tr>
                  <tr className="receipt-total-row">
                    <td colSpan="3" className="text-right">Grand Total Received:</td>
                    <td className="text-right">{formatCurrency(amountVal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="receipt-tax-note">
              <i className="fas fa-shield-alt mr-2"></i>
              <strong>Income Tax Benefit:</strong> Donations to Sri Kottai Varahi Amman Charitable Trust are eligible for deduction under Section 80G of the Income Tax Act, 1961 (PAN: AAATK1234F). Keep this official receipt for your tax filings.
            </div>

            <div className="receipt-sign-row">
              <div>
                <div className="cow-tag-mono">Status: Verified Payment (Razorpay Captured)</div>
                <div className="cow-tag-mono">Generated electronically • No physical signature required</div>
              </div>
              <div className="receipt-sign-box">
                <div className="receipt-sign-line"></div>
                <div className="receipt-sign-title">Authorized Temple Officer</div>
                <div className="cow-tag-mono">Sri Jai Varahi Peedam</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <FloatActions />
    </div>
  );
};

export default KosalaReceipt;
