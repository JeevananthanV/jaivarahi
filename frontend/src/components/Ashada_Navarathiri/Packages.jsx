import { useEffect, useMemo, useState } from "react";
import BACKEND_URL from "../../api/config";
import { validateFields, hasErrors } from "../../utils/formValidation";

const supportPhone = "+91 90928 78389";
const backendBaseUrl = BACKEND_URL;

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [activePackage, setActivePackage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });

  const priceLabel = useMemo(() => activePackage ? `₹${activePackage.price.toLocaleString("en-IN")}` : "", [activePackage]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch("/api/package-categories");
        const data = await res.json();
        setPackages(data.rows || data);
      } catch (e) {
        console.error("Failed to fetch packages:", e);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    if (document.getElementById("razorpay-sdk")) return;
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const openForm = (pkg) => {
    setActivePackage(pkg);
    setError("");
    setIsOpen(true);
  };

  const closeForm = () => setIsOpen(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateFields(form, {
      name: [{ rule: 'required', message: 'Please fill in your name.' }],
      phone: [
        { rule: 'required', message: 'Please enter your phone number.' },
        { rule: 'phone', message: 'Please enter a valid phone number (at least 10 digits).' },
      ],
      address: [{ rule: 'required', message: 'Please fill in your address.' }],
    });

    if (hasErrors(errors)) {
      setError(Object.values(errors)[0]);
      return;
    }

    const name = String(form.name || "").trim();
    const finalPhone = String(form.phone || "").replace(/\D/g, "");
    const address = String(form.address || "").trim();

    setLoading(true);
    setError("");

    try {
      const orderResponse = await fetch(`${backendBaseUrl}/api/bookings/packages/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: activePackage.price, packageName: activePackage.name }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData?.order?.id) throw new Error(orderData?.message || "Order failed");

      const razorpay = new window.Razorpay({
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        order_id: orderData.order.id,
        name: "Jaivarahi",
        description: activePackage.name,
        prefill: { name, contact: finalPhone },
        theme: { color: "#8b1e3f" },
        handler: async (response) => {
          try {
            const tier = activePackage.price === 1000 ? 1 : activePackage.price === 2500 ? 2 : activePackage.price === 5000 ? 3 : activePackage.price === 10000 ? 4 : null;
            const verifyResponse = await fetch(`${backendBaseUrl}/api/bookings/packages/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                booking: { name, phone: finalPhone, address, notes: form.notes },
                packageName: activePackage.name,
                amount: activePackage.price,
                packageTier: tier,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyResponse.json();
            if (verifyResponse.ok && verifyData?.success) {
              setForm({ name: "", phone: "", address: "", notes: "" });
              closeForm();
              alert(`Welcome ${name}, your booking is confirmed.`);
            } else {
              alert(`Payment not done. Please contact ${supportPhone}.`);
            }
          } catch (err) {
            console.error(err);
            alert(`Payment done, but verification failed. Please contact ${supportPhone}.`);
          }
        },
      });

      razorpay.on("payment.failed", () => {
        alert(`Payment not done. Please contact ${supportPhone}.`);
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      alert(`Payment not done. Please contact ${supportPhone}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="an-packages">
      <div className="an-packages__bg" />
      <div className="site-container an-packages__inner">
        <div className="an-packages__intro">
          <h2>Receive Varahi Amman Blessings</h2>
          <p>Surrender at the lotus feet of Sri Kottai Varahi Amman and receive divine protection and grace.</p>
        </div>

        <div className="an-packages__grid">
          {packages.map((pkg) => (
            <article key={pkg.id || pkg.name} className={`an-package-card ${pkg.featured ? "an-package-card--featured" : ""}`}>
              {pkg.badge && <div className="an-package-badge">{pkg.badge}</div>}
              <div className="an-package-price">₹{Number(pkg.price).toLocaleString("en-IN")}</div>
              <h3>{pkg.name}</h3>
              <div className="an-package-divider" />
              <ul>{(Array.isArray(pkg.items) ? pkg.items : []).map((item) => <li key={item}>{item}</li>)}</ul>
              <button type="button" className={pkg.featured ? "an-btn site-cta__btn" : "an-btn an-btn-primary"} onClick={() => openForm(pkg)}>
                Join Seva
              </button>
            </article>
          ))}
        </div>

        {error && <div className="av-error" role="alert" style={{ marginTop: "1rem" }}>{error}</div>}
      </div>

      {isOpen && activePackage && (
        <div className="av-modal" role="dialog" aria-modal="true">
          <div className="av-modal-backdrop" onClick={closeForm} role="presentation" />
          <div className="av-modal-content">
            <div className="av-modal-header">
              <h3>{activePackage.name}</h3>
              <button type="button" className="av-modal-close" onClick={closeForm} aria-label="Close form">×</button>
            </div>
            <div style={{ marginBottom: "1rem", fontWeight: 700 }}>Price: {priceLabel}</div>
            <form className="av-modal-form" onSubmit={handleSubmit}>
              <div className="av-form-grid">
                <label className="av-form-field">
                  <span>Name</span>
                  <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                </label>
                <label className="av-form-field">
                  <span>Phone</span>
                  <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} maxLength={10} inputMode="numeric" required />
                </label>
                <label className="av-form-field av-form-field--full">
                  <span>Address</span>
                  <textarea value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} rows={4} required />
                </label>
                <label className="av-form-field av-form-field--full">
                  <span>Notes</span>
                  <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={3} />
                </label>
              </div>
              <div className="av-form-actions">
                <button className="av-btn" type="submit" disabled={loading}>{loading ? "Processing..." : `Pay ${priceLabel}`}</button>
                <button className="av-btn av-btn-ghost" type="button" onClick={closeForm} disabled={loading}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Packages;
