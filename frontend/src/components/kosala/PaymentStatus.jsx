import React from 'react';

const PaymentStatus = ({
  isLoading,
  status = 'idle',
  paymentError,
  onRetry,
  totalAmount,
  formatINR,
  isPhysical,
  physicalSubmitted,
  donorName,
  donorPhone,
}) => {
  return (
    <>
      {status === 'pending' && (
        <div className="payment-pending-alert">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Transaction in progress. Please do not refresh or press back...</span>
        </div>
      )}

      {(paymentError || status === 'failed' || status === 'cancelled') && (
        <div className="payment-error-alert" role="alert">
          <div className="payment-error-header">
            <i className="fas fa-exclamation-triangle"></i>
            <strong>{status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}</strong>
          </div>
          <p className="payment-error-text">
            {paymentError || 'The transaction could not be completed. You can safely retry below.'}
          </p>
          {onRetry && (
            <button
              type="button"
              className="btn-hero-secondary btn-retry"
              onClick={onRetry}
            >
              <i className="fas fa-redo"></i> Retry Payment
            </button>
          )}
        </div>
      )}

      {!isPhysical ? (
        <button
          type="submit"
          className="btn-donate-submit"
          disabled={isLoading || totalAmount <= 0}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <span>Connecting Razorpay...</span>
            </>
          ) : (
            <>
              <i className="fas fa-lock"></i>
              <span>Pay {formatINR(totalAmount)} Securely</span>
            </>
          )}
        </button>
      ) : (
        <button
          type="submit"
          className="btn-donate-submit btn-physical-submit"
        >
          <i className="fas fa-paper-plane"></i>
          <span>Submit Cow Donation Request</span>
        </button>
      )}

      {physicalSubmitted && (
        <div className="physical-success-banner">
          <strong><i className="fas fa-check-circle"></i> Request Received!</strong>
          <p className="physical-success-desc">
            Thank you, {donorName}. Our temple goshala coordinator will call you at {donorPhone} within 24 hours to schedule cow intake.
          </p>
        </div>
      )}
    </>
  );
};

export default PaymentStatus;


