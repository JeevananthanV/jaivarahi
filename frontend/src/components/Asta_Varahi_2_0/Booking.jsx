import React, { useEffect, useMemo, useRef, useState } from 'react';
import BACKEND_URL from '../../api/config';
import { validateFields, hasErrors } from '../../utils/formValidation';
import '../../assets/css/asta-varahi.css';

const supportPhone = "+91 90928 78389";
const DEFAULT_POLL_INTERVAL_MS = 30000;
const ERROR_POLL_INTERVAL_MS = 120000;
const MAX_RETRY_AFTER_MS = 10 * 60 * 1000;

const bookingOptions = [
  {
    type: 'free',
    title: 'Sri Varahi Darshan',
    price: 'Free',
    subtitle: 'Sacred darshan with divine prayers and blessed offerings.',
    features: [
      { icon: '🕉️', title: 'Divine Darshan', description: 'Blessings of Sri Varahi Amman.' },
      { icon: '🙏', title: 'Sacred Chanting', description: 'Join spiritual prayers.' },
      { icon: '🌸', title: 'Pushpa Offering', description: 'Offer flowers to Amma.' },
    ],
    availabilityLabel: 'Darshan Slots',
    buttonLabel: 'Get Blessings',
    total: 5000,
    badge: 'Free Seva',
  },
  {
    type: 'stall',
    title: 'Divine Stall Booking',
    subtitle: 'Sacred space for spiritual offerings.',
    features: [
      { icon: '🕉️', title: 'Seva Stall', description: 'Serve in Varahi presence.' },
      { icon: '🪔', title: 'Devotee Reach', description: 'Connect with bhakts.' },
      { icon: '📿', title: 'Spiritual Products', description: 'Share divine items.' },
    ],
    availabilityLabel: 'Seva Slots',
    buttonLabel: 'Book Stall',
    total: 50,
  },
  {
    type: 'vip',
    title: 'Royal Varahi Darshan',
    price: '₹7,500',
    subtitle: 'Exclusive divine experience.',
    features: [
      { icon: '👑', title: 'Royal Seating', description: 'Front darshan access.' },
      { icon: '✨', title: 'Special Archana', description: 'Name-based pooja.' },
      { icon: '🥘', title: 'Maha Prasadam', description: 'Blessed offering.' },
    ],
    availabilityLabel: 'VIP Blessings',
    buttonLabel: 'Book Darshan',
    badge: '₹7,500 - Limited Seva',
    total: 1000,
  },
  {
    type: 'sponsor',
    title: 'Divine Sponsorship',
    subtitle: 'Offer seva & receive blessings.',
    features: [
      { icon: '💝', title: 'Divine Recognition', description: 'Name in rituals.' },
      { icon: '🤝', title: 'Sacred Support', description: 'Be part of seva.' },
      { icon: '📜', title: 'Family Blessings', description: 'Gotra chanting.' },
    ],
    availabilityLabel: 'Sacred Opportunity',
    buttonLabel: 'Offer Sponsership',
  },
];

// Helper Component for Number Animation
const AnimatedNumber = ({ value, duration = 800 }) => {
  const [current, setCurrent] = useState(0);
  
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const val = Math.floor(progress * (value - 0) + 0);
      setCurrent(val);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrent(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{current.toLocaleString()}</>;
};

// Classic Warm Box Progress Bar Component (matching reference design)
const ProgressBar = ({ filled, remaining, total }) => {
  const tot = total || (filled + remaining) || 1;
  const percent = Math.min(100, Math.max(0, (filled / tot) * 100));

  return (
    <div className="av-progress-box">
      <div className="av-progress-bar-bg" role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100}>
        <div className="av-progress-bar-fill" style={{ width: `${percent}%` }}></div>
      </div>
      <div className="av-progress-stats">
        <div className="av-stat-col av-stat-left">
          <span className="av-stat-label">FILLED</span>
          <span className="av-stat-number">
            <AnimatedNumber value={filled} />
          </span>
        </div>
        <div className="av-stat-col av-stat-right">
          <span className="av-stat-label">REMAINING</span>
          <span className="av-stat-number">
            <AnimatedNumber value={remaining} />
          </span>
        </div>
      </div>
    </div>
  );
};

const Booking = () => {
  const bookingSectionRef = useRef(null);
  const [counts, setCounts] = useState({
    free: 5000,
    stall: 50,
    vip: 1000,
  });
  const [activeForm, setActiveForm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [pollIntervalMs, setPollIntervalMs] = useState(DEFAULT_POLL_INTERVAL_MS);
  const [isBookingVisible, setIsBookingVisible] = useState(false);
  const [formValues, setFormValues] = useState({
    free: { name: '', phone: '', email: '', city: '', devotees: '' },
    stall: { name: '', phone: '', email: '', city: '', business: '', product: '', stallPreference: '' },
    vip: { name: '', phone: '', email: '', city: '', passes: '1', specialRequest: '' },
    sponsor: { name: '', phone: '', email: '', city: '', company: '', sponsorshipTier: '', message: '' },
  });

  const formConfig = useMemo(
    () => ({
      free: {
        title: 'Varahi Darshan Registration',
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
          { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '10-digit mobile number' },
          { name: 'city', label: 'City', type: 'text', placeholder: 'Your city' },
          { name: 'devotees', label: 'Number of Devotees', type: 'number', min: 1, max: 5, placeholder: 'Max 5 devotees' },
        ],
      },
      stall: {
        title: 'Stall Booking Form',
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
          { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '10-digit mobile number' },
          { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
          { name: 'city', label: 'City', type: 'text', placeholder: 'Your city' },
          { name: 'business', label: 'Business Name', type: 'text', placeholder: 'Your business name' },
          { name: 'product', label: 'Product Type', type: 'text', placeholder: 'Type of products you sell' },
          { name: 'stallPreference', label: 'Stall Preference (Optional)', type: 'text', placeholder: 'Any specific location preference' },
        ],
      },
      vip: {
        title: 'Royal Varahi Darshan - VIP Registration',
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
          { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '10-digit mobile number' },
          { name: 'city', label: 'City', type: 'text', placeholder: 'Your city' },
          { name: 'passes', label: 'Number of VIP Passes', type: 'number', min: 1, max: 5, placeholder: 'Max 5 passes' },
        ],
      },
      sponsor: {
        title: 'Divine Partnership - Sponsorship Form',
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
          { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '10-digit mobile number' },
          { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com' },
          { name: 'city', label: 'City', type: 'text', placeholder: 'Your city' },
          { name: 'company', label: 'Company / Business Name', type: 'text', placeholder: 'Your organization name' },
          { name: 'sponsorshipTier', label: 'Sponsorship Tier', type: 'text', placeholder: 'e.g., Gold, Silver, Platinum' },
          { name: 'message', label: 'Your Message / Intentions', type: 'text', placeholder: 'Share your intentions for sponsoring' },
        ],
      },
    }),
    [],
  );

  const handleBook = (type) => {
    setSubmitError('');
    setSubmitSuccess('');
    setActiveForm(type);
  };

  const fetchAvailability = async () => {
    try {
      if (document.visibilityState === 'hidden') return;

      const backendBaseUrl = BACKEND_URL;
      const response = await fetch(`${backendBaseUrl}/api/astavarahi2/availability`, {
        cache: 'no-store',
      });

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfterSeconds = Number.parseInt(retryAfterHeader || '', 10);
        const retryAfterMs = Number.isFinite(retryAfterSeconds)
          ? Math.min(retryAfterSeconds * 1000, MAX_RETRY_AFTER_MS)
          : ERROR_POLL_INTERVAL_MS;

        setPollIntervalMs(Math.max(retryAfterMs, ERROR_POLL_INTERVAL_MS));
        return;
      }

      if (!response.ok) return;

      const result = await response.json();
      if (result) {
        const freeCount = result.counts?.free ?? result.free?.available ?? 5000;
        const stallCount = result.counts?.stall ?? result.stall?.available ?? 50;
        const vipCount = result.counts?.vip ?? result.vip?.available ?? 1000;
        setCounts({
          free: freeCount,
          stall: stallCount,
          vip: vipCount,
        });
        setPollIntervalMs(DEFAULT_POLL_INTERVAL_MS);
      }
    } catch {
      // Keep the last known values if the endpoint is temporarily unavailable.
      setPollIntervalMs(ERROR_POLL_INTERVAL_MS);
    }
  };

  // Do not request availability while the booking section is below the fold.
  useEffect(() => {
    const section = bookingSectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsBookingVisible(entry.isIntersecting),
      { rootMargin: '200px 0px', threshold: 0.01 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Fetch immediately when the section becomes active, then refresh only while
  // it remains visible. This removes the initial 30-second delay.
  useEffect(() => {
    if (!isBookingVisible) return undefined;

    let cancelled = false;
    let timeoutId;

    const loadAvailability = async () => {
      if (cancelled || document.visibilityState === 'hidden') return;
      await fetchAvailability();
      if (!cancelled) {
        timeoutId = window.setTimeout(loadAvailability, pollIntervalMs);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') loadAvailability();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    loadAvailability();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isBookingVisible, pollIntervalMs]);

  const closeForm = () => setActiveForm(null);

  const handleChange = (type, field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const downloadVipTicketImage = async (ticket) => {
    if (!ticket?.barcodeUrl || !ticket?.ticketCode) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const safeName = String(formValues?.vip?.name || 'ticket-holder')
      .trim()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'ticket-holder';
    const fileName = `${safeName}_${ticket.ticketCode}.png`;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1f1147');
    gradient.addColorStop(0.45, '#4c1d95');
    gradient.addColorStop(1, '#f59e0b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(17, 24, 39, 0.92)';
    roundRect(ctx, 70, 70, 940, 1300, 36, true, false);

    ctx.fillStyle = '#fbbf24';
    roundRect(ctx, 110, 110, 860, 120, 28, true, false);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px Arial';
    ctx.fillText('VIP TICKET', canvas.width / 2, 190);
    ctx.font = 'bold 50px Arial';
    ctx.fillText('Asta Varahi 2.0', canvas.width / 2, 290);
    ctx.font = '32px Arial';
    ctx.fillText('Sri Kottai Varahi Amman', canvas.width / 2, 350);
    ctx.font = 'bold 40px Arial';
    ctx.fillText(`Ticket Code: ${ticket.ticketCode}`, canvas.width / 2, 465);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, 320, 575, 440, 440, 34, true, false);

    const qrImage = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = ticket.barcodeUrl;
    });

    const qrSize = 360;
    ctx.drawImage(qrImage, (canvas.width - qrSize) / 2, 615, qrSize, qrSize);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Royal VIP Access Pass', canvas.width / 2, 1075);
    ctx.font = '26px Arial';
    ctx.fillText('Present this ticket for verification', canvas.width / 2, 1130);

    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleSubmit = async (event, type) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      setSubmitError('');
      setSubmitSuccess('');
      const backendBaseUrl = BACKEND_URL;
      if (type === 'vip') {
        const vip = formValues.vip;

        const vipErrors = validateFields(vip, {
          name: [{ rule: 'required', message: 'Please fill in your full name.' }],
          phone: [
            { rule: 'required', message: 'Please enter your phone number.' },
            { rule: 'phone', message: 'Please enter a valid 10-digit phone number.' },
          ],
          city: [{ rule: 'required', message: 'Please fill in your city.' }],
          passes: [
            { rule: 'required', message: 'Please enter the number of VIP passes.' },
            { rule: 'positiveInteger', message: 'Please enter a valid number of passes.' },
            { rule: 'custom', message: 'Please choose between 1 and 5 passes.', param: (value) => { const n = Number(value); return n >= 1 && n <= 5; } },
          ],
        });

        if (hasErrors(vipErrors)) {
          setSubmitError(Object.values(vipErrors)[0]);
          return;
        }

        const fullName = String(vip.name || '').trim();
        const normalizedPhone = String(vip.phone || '').replace(/\D/g, '');
        const email = String(vip.email || '').trim();
        const city = String(vip.city || '').trim();
        const vipPasses = Number(vip.passes || 1);

        const finalPhone = normalizedPhone.slice(-10);

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setSubmitError(`Payment not done. Please contact ${supportPhone}.`);
          throw new Error('Razorpay script load failed');
        }

        const orderResponse = await fetch(`${backendBaseUrl}/api/astavarahi2/vip-create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: vipPasses * 7500,
            fullName,
            passes: vipPasses,
          }),
        });

        const orderData = await orderResponse.json();
        if (!orderResponse.ok || !orderData?.order?.id) {
          setSubmitError(orderData?.message || 'Unable to create VIP order');
          throw new Error(orderData?.message || 'Unable to create VIP order');
        }

        const options = {
          key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: 'Jaivarahi',
          description: 'Royal Varahi Darshan',
          order_id: orderData.order.id,
          prefill: {
            name: fullName,
            contact: finalPhone,
            email,
          },
          theme: {
            color: '#8b1e3f',
          },
          handler: async (response) => {
            try {
              const verifyResponse = await fetch(`${backendBaseUrl}/api/astavarahi2/vip-verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fullName,
                  phone: finalPhone,
                  email,
                city,
                vipPasses,
                amount: vipPasses * 7500,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyResponse.json();
              if (verifyResponse.ok && verifyData?.success) {
                await downloadVipTicketImage(verifyData);
                fetchAvailability();
                closeForm();
                setSubmitSuccess(`Welcome ${fullName}, your VIP booking is confirmed.`);
              } else {
                setSubmitError(`Payment not done. Please contact ${supportPhone}.`);
              }
            } catch (err) {
              console.error(err);
              setSubmitError(`Payment done, but ticket generation failed. Please contact ${supportPhone}.`);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          setSubmitError(`Payment not done. Please contact ${supportPhone}.`);
        });
        rzp.open();
        return;
      }

      const endpoints = {
        free: `${backendBaseUrl}/api/astavarahi2/free-entry`,
        stall: `${backendBaseUrl}/api/astavarahi2/stall-booking`,
        sponsor: `${backendBaseUrl}/api/astavarahi2/sponsorship`,
      };

      const currentForm = formValues[type];
      const formRules = {
        name: [{ rule: 'required', message: 'Please fill in your full name.' }],
        phone: [
          { rule: 'required', message: 'Please enter your phone number.' },
          { rule: 'phone', message: 'Please enter a valid 10-digit phone number.' },
        ],
      };

      if (type === 'free') {
        formRules.devotees = [
          { rule: 'required', message: 'Please enter the number of devotees.' },
          { rule: 'positiveInteger', message: 'Please enter a valid number of devotees.' },
          { rule: 'custom', message: 'Maximum 5 devotees allowed per registration.', param: (value) => { const n = Number(value); return n >= 1 && n <= 5; } },
        ];
      }

      const formErrors = validateFields(currentForm, formRules);

      if (hasErrors(formErrors)) {
        setSubmitError(Object.values(formErrors)[0]);
        return;
      }

      const normalizedPhone = String(currentForm.phone || '').replace(/\D/g, '');
      const finalPhone = normalizedPhone.slice(-10);

      const payloads = {
        free: {
          fullName: formValues.free.name,
          phone: finalPhone,
          email: formValues.free.email,
          city: formValues.free.city,
          devotees: Number(formValues.free.devotees) > 5 ? 5 : Number(formValues.free.devotees),
        },
        stall: {
          fullName: formValues.stall.name,
          phone: finalPhone,
          email: formValues.stall.email,
          city: formValues.stall.city,
          businessName: formValues.stall.business,
          productType: formValues.stall.product,
          stallPreference: formValues.stall.stallPreference,
        },
        sponsor: {
          fullName: formValues.sponsor.name,
          phone: finalPhone,
          email: formValues.sponsor.email,
          city: formValues.sponsor.city,
          companyName: formValues.sponsor.company,
          sponsorshipTier: formValues.sponsor.sponsorshipTier,
          message: formValues.sponsor.message,
        },
      };

      const response = await fetch(endpoints[type], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloads[type]),
      });

      if (!response.ok) {
        const message = await response.json().catch(() => null);
        throw new Error(message?.message || 'Unable to submit form');
      }

      const result = await response.json();

      if (type === 'free') {
        await downloadTicketImage({
          ...result,
          type,
        });
      }

      fetchAvailability();
      closeForm();
      setSubmitSuccess(result?.message || 'Saved successfully');
    } catch (err) {
      const message = err?.message || 'Something went wrong. Please try again.';
      if (message !== 'Validation failed' && message !== 'Razorpay script load failed') {
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailability = (option) => {
    if (!option.total) return null;
    const current = counts[option.type];
    const percent = Math.max(0, Math.min(100, Math.round((current / option.total) * 100)));
    const used = Math.max(0, option.total - current);
    
    // Calculate status based on filled percentage (used / total)
    const filledPercent = (used / option.total) * 100;
    let status = 'Available';
    if (filledPercent >= 85) status = 'Almost full';
    else if (filledPercent >= 60) status = 'Filling fast';

    let unit = 'slots';
    if (option.type === 'stall') unit = 'stalls';
    if (option.type === 'vip') unit = 'passes';
    if (option.type === 'free') unit = 'slots';
    return {
      value: percent,
      label: `${current} ${unit} left`,
      used,
      status,
      total: option.total,
    };
  };

  const roundRect = (ctx, x, y, width, height, radius, fill, stroke) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  };

  const downloadTicketImage = async (ticket) => {
    if (!ticket?.barcodeUrl || !ticket?.ticketCode) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1440;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isVip = ticket.type === 'vip';
    const safeName = String(
      formValues?.[ticket.type]?.name ||
        formValues?.[ticket.type]?.fullName ||
        'ticket-holder',
    )
      .trim()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'ticket-holder';
    const fileName = `${safeName}_${ticket.ticketCode}.png`;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (isVip) {
      gradient.addColorStop(0, '#1f1147');
      gradient.addColorStop(0.45, '#4c1d95');
      gradient.addColorStop(1, '#f59e0b');
    } else {
      gradient.addColorStop(0, '#fff8e7');
      gradient.addColorStop(0.5, '#fef3c7');
      gradient.addColorStop(1, '#f59e0b');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = isVip ? 'rgba(17, 24, 39, 0.92)' : 'rgba(255, 251, 235, 0.94)';
    roundRect(ctx, 70, 70, 940, 1300, 36, true, false);

    ctx.fillStyle = isVip ? '#fbbf24' : '#b45309';
    roundRect(ctx, 110, 110, 860, 120, 28, true, false);

    ctx.textAlign = 'center';
    ctx.fillStyle = isVip ? '#ffffff' : '#fffaf0';
    ctx.font = 'bold 72px Arial';
    ctx.fillText(isVip ? 'VIP TICKET' : 'FREE ENTRY TICKET', canvas.width / 2, 190);

    ctx.fillStyle = isVip ? '#fef3c7' : '#1f2937';
    ctx.font = 'bold 50px Arial';
    ctx.fillText('Asta Varahi 2.0', canvas.width / 2, 290);

    ctx.font = '32px Arial';
    ctx.fillStyle = isVip ? '#e9d5ff' : '#4b5563';
    ctx.fillText('Sri Kottai Varahi Amman', canvas.width / 2, 350);

    ctx.fillStyle = isVip ? '#ffffff' : '#111827';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(`Ticket Code: ${ticket.ticketCode}`, canvas.width / 2, 465);

    ctx.font = '30px Arial';
    ctx.fillStyle = isVip ? '#fef3c7' : '#6b7280';
    ctx.fillText(isVip ? 'VIP access barcode for entry' : 'Free entry barcode for verification', canvas.width / 2, 525);

    ctx.fillStyle = isVip ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.8)';
    roundRect(ctx, 320, 575, 440, 440, 34, true, false);

    const qrImage = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = ticket.barcodeUrl;
    });

    const qrSize = 360;
    ctx.drawImage(qrImage, (canvas.width - qrSize) / 2, 615, qrSize, qrSize);

    ctx.strokeStyle = isVip ? '#fbbf24' : '#d97706';
    ctx.lineWidth = 4;
    ctx.strokeRect(360, 615, 360, 360);

    ctx.fillStyle = isVip ? '#ffffff' : '#374151';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(ticket.type === 'vip' ? 'Royal VIP Access Pass' : 'Free Darshan Pass', canvas.width / 2, 1075);
    ctx.font = '26px Arial';
    ctx.fillText('Present this ticket for verification', canvas.width / 2, 1130);

    ctx.fillStyle = isVip ? '#fde68a' : '#7c2d12';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Generated digitally by Asta Varahi 2.0', canvas.width / 2, 1240);

    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  const renderModal = () => {
    if (!activeForm) return null;
    const config = formConfig[activeForm];
    const values = formValues[activeForm];

    return (
      <div className="av-modal" role="dialog" aria-modal="true" aria-labelledby="av-modal-title">
        <div className="av-modal-backdrop" onClick={closeForm} role="presentation" />
        <div className="av-modal-content">
          <div className="av-modal-header">
            <h3 id="av-modal-title">{config.title}</h3>
            <button className="av-modal-close" type="button" onClick={closeForm} aria-label="Close form">
              ×
            </button>
          </div>
          <form className="av-modal-form" onSubmit={(event) => handleSubmit(event, activeForm)}>
            <div className="av-form-grid">
              {config.fields.map((field) => (
                <label key={field.name} className="av-form-field">
                  <span>{field.label}</span>
                  <input
                    type={field.type}
                    name={field.name}
                    min={field.min}
                    placeholder={field.placeholder}
                    value={values[field.name] || ''}
                    onChange={(event) => handleChange(activeForm, field.name, event.target.value)}
                    required={field.name !== 'gotra' && field.name !== 'specialRequest' && field.name !== 'stallPreference' && field.name !== 'message'}
                  />
                </label>
              ))}
            </div>
            <div className="av-form-actions">
              <button className="av-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
              <button className="av-btn av-btn-ghost" type="button" onClick={closeForm} disabled={isSubmitting}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <section ref={bookingSectionRef} id="booking" className="an-packages">
        <div className="an-packages__bg"></div>
        <div className="site-container an-packages__inner">
          <div className="an-packages__intro">
            <h2>Receive Varahi Amman's Blessings</h2>
            <p>
              Surrender at the lotus feet of Sri Kottai Varahi Amman and receive divine protection and grace.
            </p>
          </div>

          {submitError && (
            <div className="av-error" role="alert">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="av-success" role="status">
              {submitSuccess}
            </div>
          )}

          <div className="an-packages__grid">
            {bookingOptions.map((option) => {
              const availability = getAvailability(option);
              const isSponsor = option.type === 'sponsor';

              return (
                <article key={option.type} className={`an-package-card ${option.badge ? 'an-package-card--featured' : ''}`}>
                  <div className="an-package-top">
                    {option.price ? (
                      <div className="an-package-price-pill">{option.price}</div>
                    ) : (
                      <div className="an-package-placeholder-pill"></div>
                    )}
                    {option.badge && <div className="an-package-badge">{option.badge}</div>}
                  </div>
                  <h3>{option.title}</h3>
                  <div className="an-package-divider"></div>
                  <ul>
                    {option.features.map((feature, idx) => (
                      <li key={idx}>
                        <strong>{feature.title}</strong>
                        <p>{feature.description}</p>
                      </li>
                    ))}
                  </ul>

                  {availability && (
                    <ProgressBar 
                      filled={availability.used} 
                      remaining={availability.total - availability.used} 
                      total={availability.total}
                    />
                  )}

                  <button
                    className="an-btn"
                    type="button"
                    onClick={() => handleBook(option.type)}
                  >
                    {option.buttonLabel}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
        {renderModal()}
      </section>
    </>
  );
};

export default Booking;
