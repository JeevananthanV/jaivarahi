import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../common/Header.jsx';
import Footer from '../common/Footer.jsx';
import FloatActions from '../common/FloatActions.jsx';
import { createDonationOrder, verifyDonationPayment, getPublicDonationArchive } from '../../api/paymentAPI.js';
import { validateFields, hasErrors } from '../../utils/formValidation.js';

// Modular Kosala Components
import {
  KosalaHero,
  KosalaStats,
  DonationTypeCard,
  DonationAmountSelector,
  DonorDetailsForm,
  DonationSummary,
  PaymentStatus,
  DonationReceipt,
  DonationArchiveTable,
  DonationArchiveFilters,
  CowProfileCard,
  CowSponsorshipCard,
  KosalaGallery,
  KosalaFAQ,
} from '../kosala';

const CATEGORIES = [
  {
    id: 'cow_sponsorship',
    title: 'Cow Sponsorship (பசு தத்தெடுப்பு)',
    subtitle: 'Contribute toward complete ongoing feeding, shelter & care',
    badge: 'Most Sacred',
    icon: 'fas fa-heart',
    desc: 'Sponsor the holistic nurture of a sacred temple cow. Your contribution covers fresh green grass, cattle feed, hygienic shelter, daily bath, Go Pooja archanas, and monthly sankalpam prayers in your family’s name.',
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
    desc: 'Provide nutritious daily fodder, fresh chopped green grass (maize, sorghum), dry paddy straw, mineral lick salts, and jaggery feast to ensure every Gomatha receives optimal health and energy.',
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
    desc: 'Support regular veterinary doctor checkups, seasonal Foot & Mouth Disease vaccinations, periodic deworming tonics, calcium supplements, and specialized intensive care for elderly and rescued cows.',
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
    desc: 'Contribute to the continuous improvement of the gosala facility: clean drinking water troughs, shelter roof expansion, solar fans, organic dung composting, and caretaker worker support.',
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
    desc: 'Devotees wishing to gift a live cow (preferably native Indian breed or milk cow) to Sri Kottai Varahi Amman Temple Gosala can directly coordinate intake and shelter allocation with our temple office.',
    isPhysical: true,
  },
];

const FEATURED_COWS = [
  {
    name: 'Kamadhenu (காமதேனு)',
    breed: 'Kangeyam Native',
    age: '4 Years',
    story: 'Gentle and affectionate mother cow residing at the temple since calfhood. Blessed with daily Go Pooja archanas.',
    isSponsored: true,
    healthStatus: 'Excellent • 100% Vaccinated',
  },
  {
    name: 'Nandhini (நந்தினி)',
    breed: 'Gir Cow',
    age: '3 Years',
    story: 'Protected temple Gomatha known for her serene presence during evening Aarti and pradakshina rituals.',
    isSponsored: false,
    healthStatus: 'Healthy • Dewormed Monthly',
  },
  {
    name: 'Surabhi (சுரபி)',
    breed: 'Umblachery Breed',
    age: '5 Years',
    story: 'Rescued and lovingly nurtured under Sri Varahi shelter. Receives daily green fodder and mineral nourishment.',
    isSponsored: true,
    healthStatus: 'Active & Thriving',
  },
];

const DAILY_SCHEDULE = [
  { time: '6:00 AM', title: 'Morning Fresh Green Fodder', desc: 'Fresh green grass and clean drinking water served to all cows.' },
  { time: '7:00 AM', title: 'Shed Cleaning & Health Check', desc: 'Caretakers wash sheds, inspect cattle well-being, and refresh bedding.' },
  { time: '9:00 AM', title: 'Vedic Go Pooja (Nandhini Pooja)', desc: 'Priests perform turmeric, kumkum and flower aradhana with sacred mantras.' },
  { time: '12:00 PM', title: 'Mid-Day Feed & Mineral Salts', desc: 'Concentrated cattle feed, bran mash, and mineral lick supplement.' },
  { time: '12:30 – 4:00 PM', title: 'Ventilated Shaded Rest Period', desc: 'Quiet resting period under sheltered, breeze-cooled shed spaces.' },
  { time: '5:00 PM', title: 'Evening Feeding & Hydration', desc: 'Evening green grass distribution and fresh water tank refills.' },
  { time: '7:00 PM', title: 'Night Welfare & Secure Closure', desc: 'Final caretaker inspection and night shelter safety check.' },
];

const Kosala = ({ initialTab = 'donate' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Tab State: 'donate' vs 'archive'
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes('/archive') || location.search.includes('tab=archive') || location.hash === '#archive'
      ? 'archive'
      : initialTab
  );

  const handleSwitchToDonate = () => {
    setActiveTab('donate');
    if (location.pathname !== '/kosala') {
      navigate('/kosala');
    }
    setTimeout(() => {
      document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSwitchToArchive = () => {
    setActiveTab('archive');
    if (location.pathname !== '/kosala/archive') {
      navigate('/kosala/archive');
    }
    setTimeout(() => {
      document.getElementById('archive-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Contribution state
  const [selectedCatId, setSelectedCatId] = useState('cow_sponsorship');
  const [selectedTier, setSelectedTier] = useState('t1');
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  // Devotee details
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorCity, setDonorCity] = useState('');
  const [sankalpamNote, setSankalpamNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Physical cow donation state
  const [physicalSubmitted, setPhysicalSubmitted] = useState(false);

  // Payment states
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successModalData, setSuccessModalData] = useState(null);

  // Archive states
  const [archiveData, setArchiveData] = useState([]);
  const [archiveTotal, setArchiveTotal] = useState(0);
  const [archiveStats, setArchiveStats] = useState({ total_cows: 24, adopted_cows: 18, total_donations: 0, total_amount: 0 });
  const [archivePage, setArchivePage] = useState(1);
  const [archiveTotalPages, setArchiveTotalPages] = useState(1);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveCategory, setArchiveCategory] = useState('all');
  const [archiveLoading, setArchiveLoading] = useState(false);

  // Sync tab with URL
  useEffect(() => {
    if (location.pathname.includes('/archive') || location.search.includes('tab=archive') || location.hash === '#archive') {
      setActiveTab('archive');
    } else {
      setActiveTab('donate');
    }
  }, [location.pathname, location.search, location.hash]);


  // Load Archive Data
  const fetchArchive = async () => {
    setArchiveLoading(true);
    try {
      const res = await getPublicDonationArchive({
        page: archivePage,
        limit: 10,
        category: archiveCategory,
        search: archiveSearch,
      });
      if (res?.success) {
        setArchiveData(res.rows || []);
        setArchiveTotal(res.total || 0);
        setArchiveTotalPages(res.totalPages || 1);
        if (res.stats) setArchiveStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to fetch public donation archive:', err);
    } finally {
      setArchiveLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, [archivePage, archiveCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setArchivePage(1);
    fetchArchive();
  };

  const currentCategory = CATEGORIES.find((c) => c.id === selectedCatId) || CATEGORIES[0];

  const getSelectedAmount = () => {
    if (currentCategory.isPhysical) return 0;
    if (isCustom) return Number(customAmount) || 0;
    const tier = currentCategory.tiers?.find((t) => t.id === selectedTier);
    return tier ? tier.amount : 0;
  };

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
                city: donorCity,
                category: selectedCatId,
                is_anonymous: isAnonymous ? 1 : 0,
                notes: sankalpamNote || null,
              },
            });

            if (verifyRes?.success) {
              setSuccessModalData({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                receiptNumber: verifyRes.receipt_number || `JVP-GOSALA-${Date.now()}`,
                amount: finalAmount,
                donorName: isAnonymous ? 'Anonymous Sevarthi' : donorName,
                donorEmail: donorEmail ? donorEmail.trim() : '',
                emailDispatched: verifyRes.email_dispatched,
                category: currentCategory.title,
              });

              setDonorName('');
              setDonorPhone('');
              setDonorEmail('');
              setDonorCity('');
              setSankalpamNote('');
              fetchArchive();
            } else {
              setPaymentError(verifyRes?.error || 'Payment verification failed');
            }
          } catch (verErr) {
            console.error('Verification error:', verErr);
            setPaymentError(verErr.message || 'Payment verification failed');
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
        setPaymentError(failRes?.error?.description || 'Payment was cancelled or failed');
        setIsLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Donation checkout error:', err);
      setPaymentError(err.message || 'Failed to initiate donation');
      setIsLoading(false);
    }
  };

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = (val) =>
    val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="kosala-page">
      <Header />

      {/* ─── 01. Hero Section ──────────────────────────────────────── */}
      <KosalaHero
        onDonateClick={handleSwitchToDonate}
        onArchiveClick={handleSwitchToArchive}
      />

      {/* ─── Tab Switcher ─────────────────────────────────────────── */}
      <div className="kosala-nav-tabs-wrapper">
        <div className="site-container">
          <div className="kosala-nav-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'donate' ? 'active' : ''}`}
              onClick={handleSwitchToDonate}
            >
              <i className="fas fa-hand-holding-heart"></i>
              <span>Contribute &amp; Sponsor (தானம்)</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'archive' ? 'active' : ''}`}
              onClick={handleSwitchToArchive}
            >
              <i className="fas fa-book-open"></i>
              <span>Donation Archive (வரவு பதிவேடு)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 02. About Kosala Section ────────────────────────────── */}
      <section className="kosala-about-section" id="about-kosala">
        <div className="site-container">
          <div className="section-header-centered">
            <span className="section-tag">புனித கோசாலை நோக்கமும் சேவையும்</span>
            <h2 className="section-heading">Vedic Go Samrakshana &amp; Cow Sanctuary</h2>
            <p className="section-desc">
              Sri Jai Varahi Peedam Kosala is dedicated to the revered worship, lifelong protection, and nutritious sustenance of Gomatha — the divine embodiment of all 33 crore celestial devatas.
            </p>
          </div>

          <div className="about-mission-grid">
            <div className="about-mission-card">
              <div className="about-mission-icon">
                <i className="fas fa-om"></i>
              </div>
              <h3 className="about-mission-title">Vedic Go Samrakshana</h3>
              <p className="about-mission-text">
                Every cow is revered as a sacred mother. Daily morning Go Pooja (Nandhini Pooja) is performed with turmeric, kumkum, and Vedic mantras to invoke peace and prosperity for all devotees.
              </p>
            </div>

            <div className="about-mission-card">
              <div className="about-mission-icon">
                <i className="fas fa-leaf"></i>
              </div>
              <h3 className="about-mission-title">Pure Green Nutrition</h3>
              <p className="about-mission-text">
                Our resident cattle are fed daily with chopped organic green fodder, sun-dried paddy straw, bran mash, mineral lick salts, and fresh clean drinking water in hygienic troughs.
              </p>
            </div>

            <div className="about-mission-card">
              <div className="about-mission-icon">
                <i className="fas fa-stethoscope"></i>
              </div>
              <h3 className="about-mission-title">Holistic Veterinary Care</h3>
              <p className="about-mission-text">
                Regular visits by qualified veterinary surgeons ensure preventive vaccinations against seasonal Foot &amp; Mouth Disease, periodic deworming, and specialized care for elderly or rescued cows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 03. Verified Stats Overview ──────────────────────────── */}
      <KosalaStats stats={archiveStats} />

      {/* ─── 03. TAB 1: DONATE & SPONSOR ──────────────────────────── */}
      {activeTab === 'donate' && (
        <section className="kosala-donation-section" id="donate-section">
          <div className="site-container">
            <div className="section-header-centered">
              <span className="section-tag">புனித கோசேவை காணிக்கை</span>
              <h2 className="section-heading">Choose Your Cow Care Offering</h2>
              <p className="section-desc">
                Select your preferred way to protect and nourish temple cows. Every rupee goes directly to food,
                healthcare, shelter maintenance, and daily Vedic Go Pooja.
              </p>
            </div>

            {/* Donation Type Cards (Pills) */}
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
              {/* Left Column: Category Details & Amount Selector */}
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

              {/* Right Column: Donor Information Form */}
              <div className="donor-form-card">
                <div className="form-header-title">
                  <i className="fas fa-user-edit donor-form-icon"></i>
                  <span>Devotee Information (பக்தர் விவரங்கள்)</span>
                </div>

                <form onSubmit={handleDonationSubmit}>
                  <DonorDetailsForm
                    donorName={donorName}
                    setDonorName={setDonorName}
                    donorPhone={donorPhone}
                    setDonorPhone={setDonorPhone}
                    donorEmail={donorEmail}
                    setDonorEmail={setDonorEmail}
                    donorCity={donorCity}
                    setDonorCity={setDonorCity}
                    sankalpamNote={sankalpamNote}
                    setSankalpamNote={setSankalpamNote}
                    isAnonymous={isAnonymous}
                    setIsAnonymous={setIsAnonymous}
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

            {/* Featured Cow Adoption Callout */}
            <CowSponsorshipCard
              onAdoptClick={() => {
                setSelectedCatId('cow_sponsorship');
                setSelectedTier('t4');
                setIsCustom(false);
                document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Individual Cow Profiles */}
            <div className="kosala-cows-wrapper">
              <div className="section-header-centered header-compact">
                <span className="section-tag">கோசாலை பசுக்கள்</span>
                <h3 className="section-heading heading-sub">Temple Gomatha Profiles</h3>
                <p className="section-desc">Meet some of the gentle sacred cows nurtured at Sri Kottai Varahi Peedam.</p>
              </div>

              <div className="cow-profiles-grid">
                {FEATURED_COWS.map((cow, i) => (
                  <CowProfileCard
                    key={i}
                    cow={cow}
                    onSponsorClick={(c) => {
                      setSelectedCatId('cow_sponsorship');
                      setSelectedTier('t1');
                      setIsCustom(false);
                      setSankalpamNote(`Sponsorship dedicated for ${c.name}`);
                      document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 04. TAB 2: PUBLIC DONATION ARCHIVE ───────────────────── */}
      {activeTab === 'archive' && (
        <section className="kosala-archive-section" id="archive-section">
          <div className="site-container">
            <div className="section-header-centered">
              <span className="section-tag">கோசாலை வெளிப்படைத்தன்மை பதிவேடு</span>
              <h2 className="section-heading">Public Donation Archive &amp; Receipts</h2>
              <p className="section-desc">
                Transparency builds faith. View official records of verified contributions supporting cow care,
                and download digital receipts for authorized transactions.
              </p>
            </div>

            <div className="archive-card-wrapper">
              <DonationArchiveFilters
                search={archiveSearch}
                setSearch={setArchiveSearch}
                onSearchSubmit={handleSearchSubmit}
                category={archiveCategory}
                setCategory={setArchiveCategory}
                onCategoryChange={() => setArchivePage(1)}
                onDonateClick={handleSwitchToDonate}
              />

              <DonationArchiveTable
                archiveData={archiveData}
                archiveTotal={archiveTotal}
                archiveLoading={archiveLoading}
                archivePage={archivePage}
                archiveTotalPages={archiveTotalPages}
                setArchivePage={setArchivePage}
                formatINR={formatINR}
                formatDate={formatDate}
              />
            </div>
          </div>
        </section>
      )}

      {/* ─── 05. Daily Schedule Timeline ──────────────────────────── */}
      <section className="kosala-routine-section">
        <div className="site-container">
          <div className="section-header-centered">
            <span className="section-tag">தினசரி பசு பராமரிப்பு அட்டவணை</span>
            <h2 className="section-heading">Daily Care &amp; Veterinary Schedule</h2>
            <p className="section-desc">
              Every cow at Jai Varahi Peedam follows a loving, disciplined Vedic routine overseen by dedicated caretakers
              and resident priests.
            </p>
          </div>

          <div className="routine-timeline-grid">
            {DAILY_SCHEDULE.map((item, idx) => (
              <div className="routine-step-card" key={idx}>
                <span className="routine-time">{item.time}</span>
                <div className="routine-title">{item.title}</div>
                <div className="routine-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 06. Gallery ──────────────────────────────────────────── */}
      <KosalaGallery />

      {/* ─── 07. FAQ Section ──────────────────────────────────────── */}
      <KosalaFAQ />

      {/* ─── 08. Contact Temple CTA ───────────────────────────────── */}
      <section className="kosala-contact-section" id="contact-temple">
        <div className="site-container">
          <div className="kosala-contact-card">
            <div className="section-header-centered mb-0">
              <span className="section-tag">திருக்கோயில் உதவி &amp; தொடர்பு</span>
              <h2 className="section-heading">Connect with Kosala Temple Office</h2>
              <p className="section-desc">
                Have questions regarding direct cow dhanam, ongoing sponsorships, 80G tax certificates, or want to schedule a personal temple visit? Our sevarthi assistance team is here to guide you.
              </p>
            </div>

            <div className="contact-channels-grid">
              <a href="tel:+919092878389" className="contact-channel-item">
                <div className="contact-channel-icon">
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div>
                  <div className="contact-channel-label">Temple Helpline</div>
                  <div className="contact-channel-val">+91 90928 78389</div>
                </div>
              </a>

              <a href="https://wa.me/919092878389?text=Namaskaram%2C%20I%20would%20like%20to%20know%20more%20about%20Kosala%20Cow%20Donations." target="_blank" rel="noopener noreferrer" className="contact-channel-item">
                <div className="contact-channel-icon">
                  <i className="fab fa-whatsapp"></i>
                </div>
                <div>
                  <div className="contact-channel-label">WhatsApp Seva</div>
                  <div className="contact-channel-val">Chat with Office</div>
                </div>
              </a>

              <a href="mailto:contact@jaivarahi.org" className="contact-channel-item">
                <div className="contact-channel-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <div className="contact-channel-label">Email Enquiries</div>
                  <div className="contact-channel-val">contact@jaivarahi.org</div>
                </div>
              </a>

              <div className="contact-channel-item">
                <div className="contact-channel-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <div>
                  <div className="contact-channel-label">Gosala Timings</div>
                  <div className="contact-channel-val">6:00 AM – 8:00 PM Daily</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 09. Success Receipt Modal ────────────────────────────── */}
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

export default Kosala;
