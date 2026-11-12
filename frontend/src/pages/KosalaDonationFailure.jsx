import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx';

const KosalaDonationFailure = () => {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('error') || 'The transaction could not be completed at this time.';
  const orderId = searchParams.get('order_id') || '';

  return (
    <div className="kosala-page">
      <Helmet>
        <title>Payment Incomplete | Kosala Donation — Jai Varahi Peedam</title>
        <meta name="description" content="Payment was not completed. You can safely retry or contact the temple office for assistance." />
      </Helmet>

      <Header />

      <div className="donation-result-page">
        <div className="site-container">
          <div className="donation-result-card">
            <div className="result-icon-lg failure">
              <i className="fas fa-exclamation-triangle"></i>
            </div>

            <h1 className="result-title-lg">காணிக்கை பரிவர்த்தனை நிறைவடையவில்லை</h1>
            <p className="result-desc-lg">
              We were unable to complete your donation transaction. If any amount was deducted from your bank or card, it will be automatically refunded by your bank within 3 to 5 business days.
            </p>

            <div className="payment-error-alert text-left">
              <div className="payment-error-header">
                <i className="fas fa-info-circle"></i>
                <strong>Notice</strong>
              </div>
              <p className="payment-error-text">{errorMessage}</p>
              {orderId && (
                <div className="cow-tag-mono">Reference Order: {orderId}</div>
              )}
            </div>

            <div className="modal-receipt-actions">
              <Link
                to="/kosala/donate"
                className="btn-hero-primary btn-receipt-modal-primary"
              >
                <i className="fas fa-redo"></i> Retry Donation
              </Link>
              <a
                href="tel:+919092878389"
                className="btn-hero-secondary btn-receipt-modal-close"
              >
                <i className="fas fa-phone-alt"></i> Call Temple Help
              </a>
            </div>

            <div className="mt-3">
              <Link to="/kosala" className="btn-receipt-download">
                <i className="fas fa-arrow-left"></i> Return to Kosala Home
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

export default KosalaDonationFailure;
