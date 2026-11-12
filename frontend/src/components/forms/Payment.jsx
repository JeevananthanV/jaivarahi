import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Preloader from "../common/Preloader.jsx";
import Navbar from "../common/Navbar.jsx";
import MobileNav from "../common/MobileNav.jsx";
import Footer from "../common/Footer.jsx";
import FloatActions from "../common/FloatActions.jsx";
import { createDonationOrder, verifyDonationPayment, sendDonationReceiptToEmail } from "../../api/paymentAPI.js";
import BACKEND_URL from "../../api/config.js";
import { validateFields, hasErrors } from "../../utils/formValidation";

const Payment = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  // Receipt & Email dispatch state
  const [receiptData, setReceiptData] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState(null);

  const normalizedPhone = phone.replace(/\D/g, "");
  const phoneDigits = normalizedPhone.startsWith('91') && normalizedPhone.length === 12 ? normalizedPhone.slice(2) : normalizedPhone;

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    {
      label: "Ubasana",
      href: "#",
      children: [
        { label: "Varahi Malai", href: "/varahimalai" },
        { label: "Who is varahi ?", href: "/who_is_varahi" },
        { label: "Uchchishta Ganapati", href: "/Uchchishta_Ganapati" },
        { label: "Sri Bala manthiram", href: "/sri_bala_manthiram" },
      ],
    },
    {
      label: "Kosala",
      href: "/kosala",
      children: [
        { label: "Donation", href: "/kosala" },
        { label: "Donation Archive", href: "/kosala/archive" },
      ],
    },
    {
      label: "Jothidam",
      href: "#",
      children: [
        { label: "Astrology prediction", href: "/Jothidam" },
        { label: "Sri Varahi Jothida Vidyalayam", href: "/comingsoon" },
      ],
    },
    {
      label: "Events",
      href: "#",
      children: [
        { label: "Asta Varahi Dharshanam", href: "/astavarahi" },
        { label: "Asta Varahi 2.0", href: "/astavarahi2" },
        { label: "Ashada Navarathiri", href: "/ashada_navarathiri" },
      ],
    },
    { label: 'Blog', href: '/blog' },
    { label: "Latest Updates", href: "/comingsoon" },
  ];

  // Razorpay Loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
  

  const handleSendReceiptEmail = async (e) => {
    if (e) e.preventDefault();
    const targetEmail = (emailInput || email || "").trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!targetEmail || !emailRegex.test(targetEmail)) {
      setEmailFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    if (!receiptData?.paymentId) {
      setEmailFeedback({ type: 'error', message: 'Payment reference not found.' });
      return;
    }

    try {
      setIsSendingEmail(true);
      setEmailFeedback(null);
      const res = await sendDonationReceiptToEmail({
        paymentId: receiptData.paymentId,
        email: targetEmail,
      });
      if (res?.success) {
        setEmailFeedback({
          type: 'success',
          message: `Official 80G PDF receipt sent to ${targetEmail}`,
        });
        setReceiptData(p => ({ ...p, donorEmail: targetEmail, emailDispatched: true }));
      } else {
        throw new Error(res?.error || 'Failed to dispatch email receipt');
      }
    } catch (err) {
      setEmailFeedback({
        type: 'error',
        message: err.message || 'Unable to send email right now. Please try again.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handlePayment = async () => {
    setMessage({ type: "", text: "" });
    setReceiptData(null);

    const errors = validateFields({ name, city, phone, amount }, {
      name: [{ rule: 'required', message: 'Please enter your name' }],
      city: [{ rule: 'required', message: 'Please enter your city' }],
      phone: [{ rule: 'required', message: 'Phone number is required' },
              { rule: 'phone', message: 'Please enter a valid 10-digit phone number' }],
      amount: [{ rule: 'required', message: 'Please enter a donation amount' },
               { rule: 'positiveNumber', message: 'Please enter a valid amount' }],
    });

    if (email && email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address for PDF receipt';
      }
    }

    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    const finalPhone = phoneDigits;
    const finalEmail = email ? email.trim() : undefined;

    try {
      setIsLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setMessage({
          type: "error",
          text: "Failed to load Razorpay SDK",
        });
        return;
      }

      const orderData = await createDonationOrder({
        amount: Number(amount),
        name: String(name || "").trim(),
        phone: String(phone || "").trim(),
        email: finalEmail,
        city: String(city || "").trim(),
      });

      // Razorpay checkout options
      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: "Sri Kottai Varahi Peedam",
        description: "Temple Donation",
        order_id: orderData.id || orderData.order_id,

        handler: async function (response) {
          try {
            const verifyData = await verifyDonationPayment({
              payload: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: Number(amount),
                name: String(name || "").trim(),
                phone: finalPhone,
                donor_email: finalEmail || null,
                email: finalEmail || null,
                city: String(city || "").trim(),
              },
            });

            if (verifyData.success) {
              setReceiptData({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                receiptNumber: verifyData.receipt_number || `JVP-DONATION-${Date.now()}`,
                amount: Number(amount),
                donorName: name,
                donorEmail: finalEmail || '',
                emailDispatched: verifyData.email_dispatched,
              });
              setEmailInput(finalEmail || '');
              setMessage({
                type: "success",
                text: `Welcome ${name}, your donation was successful.`,
              });
            } else {
              setMessage({
                type: "error",
                text: "Payment verification failed",
              });
            }
          } catch (err) {
            console.error(err);
            setMessage({
              type: "error",
              text: "Payment done but verification failed",
            });
          } finally {
            setIsLoading(false);
          }
        },

        prefill: {
          name: name,
          contact: finalPhone,
          email: finalEmail,
        },

        theme: {
          color: "#9a3b34",
        },
      };
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        setMessage({
          type: "error",
          text: "Payment Failed: " + response.error.description,
        });
      });

      rzp.open();
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: "Payment failed please contact at +91 90928 78389",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    setActiveMobileDropdown(null);
  };

  const toggleMobileDropdown = (label) => {
    setActiveMobileDropdown((current) => (current === label ? null : label));
  };

  return (
    <div style={{ backgroundColor: "var(--background-light)", minHeight: "100vh" }}>
      <Helmet>
        <title>Varahi Temple - Donation Page</title>
        <meta
          name="description"
          content="Support Sri Kottai Varahi Temple through your generous donations."
        />
      </Helmet>

      <Preloader autoHide />
      <Navbar
        items={navItems}
        onOpenMobile={() => setIsMobileOpen(true)}
        isMobileOpen={isMobileOpen}
      />
      <MobileNav
        items={navItems}
        isOpen={isMobileOpen}
        activeDropdown={activeMobileDropdown}
        onClose={closeMobileMenu}
        onToggleDropdown={toggleMobileDropdown}
      />
      <div
        className={`mobile-nav-overlay${isMobileOpen ? " active" : ""}`}
        onClick={closeMobileMenu}
        role="presentation"
      />

      <div className="donation-container">
        <div className="donation-header">
          <h1>Sri Kottai Varahi Temple</h1>
          <p>Support our temple through your generous donations</p>
        </div>

        <div className="temple-image-wrapper">
          <img
            src="/assets/img/banner/website.png"
            width="400"
            alt="Varahi Temple"
          />
        </div>

        <div className="donation-form-wrapper">
          <h2>Make a Donation</h2>
          <p>
            Please fill in the details below to make your contribution to Sri
            Varahi Temple.
          </p>

          <div className="kosala-cross-link">
            <span className="kosala-cross-text">
              <i className="fas fa-cow kosala-cross-icon"></i>
              Looking for <strong>Kosala Cow Care &amp; Sponsorship</strong>?
            </span>
            <div className="kosala-cross-actions">
              <a href="/kosala" className="btn-hero-primary btn-cow-sponsor">
                Kosala Donation
              </a>
              <a href="/kosala/archive" className="btn-receipt-download">
                View Archive
              </a>
            </div>
          </div>


          <form action="https://jeeva17.app.n8n.cloud/webhook/dontaion-form" method="post"
            id="donation-form"
            onSubmit={(e) => {
              e.preventDefault();
              handlePayment();
            }}
          >
            <div className="donation-field">
              <label className="donation-label" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="donation-input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                required
              />
              {fieldErrors.name && <div style={{ color: 'var(--accent-color)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.name}</div>}
            </div>
            <div className="donation-field">
              <label className="donation-label" htmlFor="city">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                className="donation-input"
                placeholder="Enter your city"
                value={city}
                onChange={(e) => { setCity(e.target.value); setFieldErrors(p => ({ ...p, city: '' })); }}
                required
              />
              {fieldErrors.city && <div style={{ color: 'var(--accent-color)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.city}</div>}
            </div>
            <div className="donation-field">
              <label className="donation-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="donation-input"
                placeholder="Phone number (e.g. +91 XXXXXXXXXX)"
                autoComplete="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setFieldErrors(p => ({ ...p, phone: '' })); }}
                required
              />
              {fieldErrors.phone && <div style={{ color: 'var(--accent-color)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.phone}</div>}
            </div>

            <div className="donation-field">
              <label className="donation-label" htmlFor="email">
                Email Address <span style={{ fontSize: '12px', opacity: 0.85, fontWeight: 'normal' }}>(Optional for PDF Receipt)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="donation-input"
                placeholder="devotee@example.com (to receive official PDF receipt)"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
              />
              {fieldErrors.email && <div style={{ color: 'var(--accent-color)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.email}</div>}
            </div>

            <div className="donation-field">
              <label className="donation-label" htmlFor="amount">
                Donation Amount (₹)
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="donation-input"
                placeholder="Enter donation amount"
                min="1"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setFieldErrors(p => ({ ...p, amount: '' })); }}
                required
              />
              {fieldErrors.amount && <div style={{ color: 'var(--accent-color)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.amount}</div>}
            </div>

            <button
              type="submit"
              id="pay-btn"
              className="donation-button"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Make Donation"}
            </button>
          </form>

          {message.text && (
            <div
              className={`donation-response ${message.type === "success" ? "success" : "error"}`}
              style={{ display: "block" }}
            >
              {message.text}
            </div>
          )}

          {receiptData && (
            <div className="receipt-success-card" style={{
              marginTop: '24px',
              padding: '24px',
              background: '#fbf5ee',
              border: '1.5px solid #9a3b34',
              borderRadius: '12px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: '#9a3b34' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '22px' }}></i>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Sacred Offering Acknowledged</h3>
              </div>

              {receiptData.donorEmail && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="fas fa-envelope-circle-check"></i>
                  <span>Official Section 80G PDF receipt automatically sent to <strong>{receiptData.donorEmail}</strong></span>
                </div>
              )}

              <div style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '13px',
                lineHeight: '1.8'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', paddingBottom: '4px' }}>
                  <span style={{ color: '#6b7280' }}>Receipt Voucher:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{receiptData.receiptNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', padding: '4px 0' }}>
                  <span style={{ color: '#6b7280' }}>Payment Reference:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{receiptData.paymentId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <span style={{ color: '#6b7280' }}>Amount Contributed:</span>
                  <strong style={{ color: '#9a3b34', fontSize: '16px' }}>₹{Number(receiptData.amount).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                <a
                  href={`${BACKEND_URL}/api/payments/donation/receipt/${receiptData.paymentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-receipt-download"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    backgroundColor: '#9a3b34',
                    color: '#ffffff',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '13px',
                    textDecoration: 'none'
                  }}
                >
                  <i className="fas fa-file-pdf"></i> Download Official PDF Receipt
                </a>

                <a
                  href={`/kosala/receipt/${receiptData.paymentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #9a3b34',
                    color: '#9a3b34',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '13px',
                    textDecoration: 'none'
                  }}
                >
                  <i className="fas fa-qrcode"></i> View Online Digital Ledger
                </a>
              </div>

              {/* Email Send / Resend Section */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '14px',
                marginTop: '10px'
              }}>
                <label htmlFor="receipt-resend-email" style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '8px',
                  color: '#374151'
                }}>
                  <i className="fas fa-paper-plane" style={{ marginRight: '6px', color: '#9a3b34' }}></i>
                  {receiptData.donorEmail ? 'Send copy to another email / Resend receipt:' : 'Send official 80G PDF receipt to email:'}
                </label>
                <form onSubmit={handleSendReceiptEmail} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="receipt-resend-email"
                    type="email"
                    placeholder="devotee@example.com"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (emailFeedback) setEmailFeedback(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '13px'
                    }}
                    disabled={isSendingEmail}
                  />
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#9a3b34',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isSendingEmail ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-envelope"></i>
                        <span>Send to Mail</span>
                      </>
                    )}
                  </button>
                </form>

                {emailFeedback && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: emailFeedback.type === 'success' ? '#166534' : '#b91c1c'
                  }}>
                    <i className={`fas fa-${emailFeedback.type === 'success' ? 'check-circle' : 'exclamation-circle'}`} style={{ marginRight: '4px' }}></i>
                    {emailFeedback.message}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <FloatActions />
      <Footer />
    </div>
  );
};

export default Payment;
