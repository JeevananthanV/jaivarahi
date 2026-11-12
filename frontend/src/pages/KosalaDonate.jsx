import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx';
import { createDonationOrder, verifyDonationPayment } from '../api/paymentAPI.js';
import { validateFields, hasErrors } from '../utils/formValidation.js';
import {
  DonationTypeCard,
  DonationAmountSelector,
  DonorDetailsForm,
  DonationSummary,
  PaymentStatus,
  DonationReceipt,
} from '../components/kosala';

const CATEGORIES = [
  {
    id: 'cow_sponsorship',
    title: 'Cow Sponsorship (பசு தத்தெடுப்பு)',
    subtitle: 'Contribute toward complete ongoing feeding, shelter & care',
    badge: 'Most Sacred',
    icon: 'fas fa-heart',
    desc: 'Sponsor the holistic nurture of a sacred temple cow. Covers fresh green grass, cattle feed, shelter, daily bath, Go Pooja archanas, and monthly sankalpam prayers in your family’s name.',
    tiers: [
      { id: 't1', amount: 1500, label: '1 Month Care', note: 'Complete feed & shelter for 30 days' },
      { id: 't2', amount: 4500, label: '3 Months Care', note: 'Quarterly fodder & care sponsorship' },
      { id: 't3', amount: 9000, label: '6 Months Care', note: 'Half-yearly dedicated Gomatha seva' },
      { id: 't4', amount: 18000, label: '1 Year Full Adoption', note: 'Annual complete lifetime adoption' },
    ],
    allowCustom: true,
  },
  {
    id: 'fodder_feed',
    title: 'Fodder Donation (பசு தீவனம்)',
    subtitle: 'Support daily fresh green grass, straw & nutritious feed',
    badge: 'Daily Seva',
    icon: 'fas fa-seedling',
    desc: 'Provide nutritious daily fodder, fresh chopped green grass, dry straw, mineral salts, and jaggery feast to ensure optimal health for every Gomatha.',
    tiers: [
      { id: 'f1', amount: 300, label: '1 Day Fodder', note: 'Feeds cows with daily fresh grass' },
      { id: 'f2', amount: 1000, label: 'Weekly Feed Supply', note: 'Sustains weekly grain & dry fodder' },
      { id: 'f3', amount: 2500, label: 'Special Feasting Mash', note: 'Nutritious jaggery & grain feast' },
    ],
    allowCustom: true,
  },
  {
    id: 'medical_care',
    title: 'Medical Care (மருத்துவ சிகிச்சை)',
    subtitle: 'Support veterinary expenses, vaccines & elderly cow care',
    badge: 'Healing Seva',
    icon: 'fas fa-hand-holding-medical',
    desc: 'Support regular veterinary doctor checkups, seasonal Foot & Mouth Disease vaccinations, periodic deworming, and specialized care for elderly or rescued cows.',
    tiers: [
      { id: 'm1', amount: 500, label: 'First-Aid & Tonics', note: 'Essential mineral & digestion tonics' },
      { id: 'm2', amount: 1200, label: 'Vaccination & Deworming', note: 'Preventive herd healthcare' },
      { id: 'm3', amount: 3000, label: 'Elderly Cow Care', note: 'Special geriatric feed & medical visits' },
    ],
    allowCustom: true,
  },
  {
    id: 'general_gosala',
    title: 'General Gosala Support (பொது திருப்பணி)',
    subtitle: 'Contribute to overall gosala shelter needs & upkeep',
    badge: 'Universal',
    icon: 'fas fa-shield-alt',
    desc: 'Contribute to shelter roof expansion, solar fans, clean water troughs, organic dung composting, and caretaker worker support.',
    tiers: [
      { id: 'g1', amount: 500, label: '₹500', note: 'General shelter upkeep' },
      { id: 'g2', amount: 1000, label: '₹1,000', note: 'Facility & water management' },
      { id: 'g3', amount: 2000, label: '₹2,000', note: 'Sanitation & bedding' },
      { id: 'g4', amount: 5000, label: '₹5,000', note: 'Infrastructure & expansion' },
    ],
    allowCustom: true,
  },
  {
    id: 'cow_donation',
    title: 'Donate a Cow (நேரடி பசு தானம்)',
    subtitle: 'Coordinate physical donation of a milk cow / calf',
    badge: 'Direct Go Dhanam',
    icon: 'fas fa-gift',
    desc: 'Devotees wishing to gift a live cow to Sri Kottai Varahi Amman Temple Gosala can directly coordinate intake and shelter allocation with our temple office.',
    isPhysical: true,
  },
];

const KosalaDonate = () => {
  const navigate = useNavigate();

  const [selectedCatId, setSelectedCatId] = useState('cow_sponsorship');
  const [selectedTier, setSelectedTier] = useState('t1');
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorCity, setDonorCity] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [sankalpamNote, setSankalpamNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);

  const [physicalSubmitted, setPhysicalSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successModalData, setSuccessModalData] = useState(null);

  const currentCategory = CATEGORIES.find((c) => c.id === selectedCatId) || CATEGORIES[0];

  const getSelectedAmount = () => {
    if (currentCategory.isPhysical) return 0;
    if (isCustom) return Number(customAmount) || 0;
    const tier = currentCategory.tiers?.find((t) => t.id === selectedTier);
    return tier ? tier.amount : 0;
  };

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');

    if (currentCategory.isPhysical) {
      if (!donorName.trim() || !donorPhone.trim() || !donorCity.trim()) {
        setPaymentError('Please fill your name, phone number, and city for physical cow donation coordination.');
        return;
      }
      setPhysicalSubmitted(true);
      return;
    }

    const finalAmount = getSelectedAmount();
    const cleanPhone = donorPhone.replace(/\D/g, '');

    const errors = validateFields(
      { name: donorName, phone: cleanPhone, city: donorCity, amount: finalAmount },
      {
        name: [{ rule: 'required', message: 'Devotee name is required' }],
        phone: [
          { rule: 'required', message: 'Phone number is required' },
          { rule: 'phone', message: 'Enter a valid 10-digit mobile number' },
        ],
        city: [{ rule: 'required', message: 'City is required' }],
        amount: [
          { rule: 'required', message: 'Donation amount is required' },
          { rule: 'positiveNumber', message: 'Amount must be greater than zero' },
        ],
      }
    );

    if (donorEmail && donorEmail.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(donorEmail.trim())) {
        errors.email = 'Please enter a valid email address for PDF receipt';
      }
    }

    setFieldErrors(errors);
    if (hasErrors(errors)) return;

    try {
      setIsLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setPaymentError('Unable to load payment gateway. Please check your internet connection.');
        setIsLoading(false);
        return;
      }

      const orderRes = await createDonationOrder({
        amount: finalAmount,
        name: donorName,
        phone: cleanPhone,
        email: donorEmail ? donorEmail.trim() : undefined,
        city: donorCity,
      });

      if (!orderRes || !orderRes.order_id) {
        throw new Error(orderRes?.error || 'Failed to initialize donation order');
      }

      const options = {
        key: orderRes.key_id,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: 'Jai Varahi Peedam',
        description: `Kosala Go Seva - ${currentCategory.title}`,
        image: '/assets/img/images_new/VARAHI%20LOGO.svg',
        order_id: orderRes.order_id,
        prefill: {
          name: donorName,
          contact: cleanPhone,
          email: donorEmail ? donorEmail.trim() : undefined,
        },
        theme: {
          color: '#9a3b34',
        },
        handler: async (response) => {
          try {
            const verifyRes = await verifyDonationPayment({
              payload: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: finalAmount,
                name: donorName,
                phone: cleanPhone,
                donor_email: donorEmail ? donorEmail.trim() : null,
                email: donorEmail ? donorEmail.trim() : null,
                address: donorAddress,
                city: donorCity,
                category: selectedCatId,
                is_anonymous: isAnonymous ? 1 : 0,
                notes: sankalpamNote || null,
              },
            });

            if (verifyRes?.success) {
              const receiptNum = verifyRes.receipt_number || `JVP-GOSALA-${Date.now()}`;
              const emailParam = donorEmail ? encodeURIComponent(donorEmail.trim()) : '';
              const emailDispatched = verifyRes.email_dispatched ? 'true' : 'false';
              navigate(`/kosala/success?payment_id=${response.razorpay_payment_id}&receipt=${receiptNum}&amount=${finalAmount}&name=${encodeURIComponent(donorName)}&email=${emailParam}&email_dispatched=${emailDispatched}`);
            } else {
              setPaymentError(verifyRes?.error || 'Payment verification failed');
            }
          } catch (verErr) {
            console.error('Verification error:', verErr);
            navigate(`/kosala/failure?error=${encodeURIComponent(verErr.message || 'Verification failed')}&order_id=${response.razorpay_order_id}`);
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (failRes) => {
        setIsLoading(false);
        navigate(`/kosala/failure?error=${encodeURIComponent(failRes?.error?.description || 'Payment failed or cancelled')}&order_id=${orderRes.order_id}`);
      });
      rzp.open();
    } catch (err) {
      console.error('Donation checkout error:', err);
      setPaymentError(err.message || 'Failed to initiate donation');
      setIsLoading(false);
    }
  };

  return (
    <div className="kosala-page">
      <Helmet>
        <title>Donate for Cow Care | Kosala Go Seva — Jai Varahi Peedam</title>
        <meta
          name="description"
          content="Contribute online toward cow sponsorship, fresh green fodder, veterinary care, and goshala maintenance at Sri Jai Varahi Peedam."
        />
        <link rel="canonical" href="https://jaivarahi.org/kosala/donate" />
      </Helmet>

      <Header />

      <section className="kosala-donation-section" id="donate-section">
        <div className="site-container">
          <div className="section-header-centered">
            <span className="section-tag">புனித கோசேவை காணிக்கை</span>
            <h1 className="section-heading">Kosala Online Donation Checkout</h1>
            <p className="section-desc">
              Protect and nourish temple cows. All donations receive an authorized 80G tax receipt and sankalpam blessings.
            </p>
          </div>

          <div className="category-selector-pills">
            {CATEGORIES.map((cat) => (
              <DonationTypeCard
                key={cat.id}
                category={cat}
                isSelected={selectedCatId === cat.id}
                onSelect={(id) => {
                  setSelectedCatId(id);
                  setIsCustom(false);
                  const found = CATEGORIES.find((c) => c.id === id);
                  if (found?.tiers?.length) setSelectedTier(found.tiers[0].id);
                }}
              />
            ))}
          </div>

          <div className="donation-grid-layout">
            <div className="category-details-card">
              <div className="cat-title-row">
                <div className="cat-title">{currentCategory.title}</div>
                <span className="cat-badge">{currentCategory.badge}</span>
              </div>
              <p className="cat-desc">{currentCategory.desc}</p>

              <DonationAmountSelector
                category={currentCategory}
                selectedTier={selectedTier}
                onSelectTier={setSelectedTier}
                isCustom={isCustom}
                setIsCustom={setIsCustom}
                customAmount={customAmount}
                setCustomAmount={setCustomAmount}
                formatINR={formatINR}
              />
            </div>

            <div className="donor-form-card">
              <div className="form-header-title">
                <i className="fas fa-user-edit donor-form-icon"></i>
                <span>Devotee Information</span>
              </div>

              <form onSubmit={handleDonationSubmit}>
                <DonorDetailsForm
                  donorName={donorName}
                  setDonorName={setDonorName}
                  donorPhone={donorPhone}
                  setDonorPhone={setDonorPhone}
                  donorCity={donorCity}
                  setDonorCity={setDonorCity}
                  donorEmail={donorEmail}
                  setDonorEmail={setDonorEmail}
                  donorAddress={donorAddress}
                  setDonorAddress={setDonorAddress}
                  sankalpamNote={sankalpamNote}
                  setSankalpamNote={setSankalpamNote}
                  isAnonymous={isAnonymous}
                  setIsAnonymous={setIsAnonymous}
                  consentGiven={consentGiven}
                  setConsentGiven={setConsentGiven}
                  fieldErrors={fieldErrors}
                  isPhysical={currentCategory.isPhysical}
                />

                <DonationSummary
                  categoryTitle={currentCategory.title}
                  totalAmount={getSelectedAmount()}
                  formatINR={formatINR}
                  isPhysical={currentCategory.isPhysical}
                />

                <PaymentStatus
                  isLoading={isLoading}
                  paymentError={paymentError}
                  totalAmount={getSelectedAmount()}
                  formatINR={formatINR}
                  isPhysical={currentCategory.isPhysical}
                  physicalSubmitted={physicalSubmitted}
                  donorName={donorName}
                  donorPhone={donorPhone}
                />
              </form>
            </div>
          </div>
        </div>
      </section>

      <DonationReceipt
        receiptData={successModalData}
        onClose={() => setSuccessModalData(null)}
        formatINR={formatINR}
      />

      <Footer />
      <FloatActions />
    </div>
  );
};

export default KosalaDonate;
