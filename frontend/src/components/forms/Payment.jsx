import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Preloader from "../common/Preloader.jsx";
import Navbar from "../common/Navbar.jsx";
import MobileNav from "../common/MobileNav.jsx";
import Footer from "../common/Footer.jsx";
import FloatActions from "../common/FloatActions.jsx";
import { createDonationOrder, verifyDonationPayment } from "../../api/paymentAPI.js";
import { validateFields, hasErrors } from "../../utils/formValidation";

const Payment = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [fieldErrors, setFieldErrors] = useState({});

  const normalizedPhone = phone.replace(/\D/g, "");
  const phoneDigits = normalizedPhone.startsWith('91') && normalizedPhone.length === 12 ? normalizedPhone.slice(2) : normalizedPhone;
  const isPhoneValid = phoneDigits.length === 10;

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
      href: "#",
      children: [
        { label: "Donation", href: "/payment" },
        { label: "Donation Archive", href: "/payment" },
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
  

  const handlePayment = async () => {
    setMessage({ type: "", text: "" });

    const errors = validateFields({ name, city, phone, amount }, {
      name: [{ rule: 'required', message: 'Please enter your name' }],
      city: [{ rule: 'required', message: 'Please enter your city' }],
      phone: [{ rule: 'required', message: 'Phone number is required' },
              { rule: 'phone', message: 'Please enter a valid 10-digit phone number' }],
      amount: [{ rule: 'required', message: 'Please enter a donation amount' },
               { rule: 'positiveNumber', message: 'Please enter a valid amount' }],
    });
    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    const finalPhone = phoneDigits;

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
        city: String(city || "").trim(),
      });

      // Razorpay checkout options
      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Jaivarahi",
        description: "Donation",
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
                city: String(city || "").trim(),
              },
            });

            if (verifyData.success) {
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
          }
        },

        prefill: {
          name: name,
          contact: finalPhone,
        },

        theme: {
          color: "#528FF0",
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
    <div style={{ backgroundColor: "#f5f1e8", minHeight: "100vh" }}>
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
              {fieldErrors.name && <div style={{ color: '#ff453b', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.name}</div>}
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
              {fieldErrors.city && <div style={{ color: '#ff453b', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.city}</div>}
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
              {fieldErrors.phone && <div style={{ color: '#ff453b', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.phone}</div>}
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
              {fieldErrors.amount && <div style={{ color: '#ff453b', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.amount}</div>}
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
        </div>
      </div>

      <FloatActions />
      <Footer />
    </div>
  );
};

export default Payment;
