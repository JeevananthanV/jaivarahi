import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx'

const UchchishtaGanapati = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  ;

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    {
      label: 'Ubasana',
      href: '#',
      children: [
        { label: 'Varahi Malai', href: '/varahimalai' },
        { label: 'Who is varahi ?', href: '/who_is_varahi' },
        { label: 'Uchchishta Ganapati', href: '/Uchchishta_Ganapati' },
        { label: 'Sri Bala manthiram', href: '/sri_bala_manthiram' },
      ],
    },
    {
      label: 'Kosala',
      href: '#',
      children: [
        { label: 'Donation', href: '/payment' },
        { label: 'Donation Archive', href: '/payment' },
      ],
    },
    {
      label: 'Jothidam',
      href: '#',
      children: [
        { label: 'Astrology prediction', href: '/Jothidam' },
        { label: 'Sri Varahi Jothida Vidyalayam', href: '/comingsoon' },
      ],
    },
    {
      label: 'Events',
      href: '#',
      children: [
        { label: 'Asta Varahi Dharshanam', href: '/astavarahi' },
        { label: 'Asta Varahi 2.0', href: '/astavarahi2' },
        { label: 'Ashada Navarathiri', href: '/ashada_navarathiri' },
      ],
    },
    { label: 'Blog', href: '/blog' },
    { label: 'Latest Updates', href: '/comingsoon' },
  ];

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    setActiveMobileDropdown(null);
  };

  const toggleMobileDropdown = (label) => {
    setActiveMobileDropdown((current) => (current === label ? null : label));
  };


  return (
    <>
      <Helmet>
        <title>Uchchishta Ganapati | Sacred Chant Collection</title>
        <meta name="description" content="Listen to Uchchishta Ganapati Mantras and learn about the 32 forms of Lord Ganesha." />
      </Helmet>

      <Preloader autoHide />
      <Navbar items={navItems} onOpenMobile={() => setIsMobileOpen(true)} isMobileOpen={isMobileOpen} />
      <MobileNav
        items={navItems}
        isOpen={isMobileOpen}
        activeDropdown={activeMobileDropdown}
        onClose={closeMobileMenu}
        onToggleDropdown={toggleMobileDropdown}
      />
      <div
        className={`mobile-nav-overlay${isMobileOpen ? ' active' : ''}`}
        onClick={closeMobileMenu}
        role="presentation"
      />

      <main className="ug-page-main">
        {/* HERO */}
        <section className="ug-hero" aria-label="Uchchishta Ganapati">
            <img src="/assets/img/ganapathi/Untitled design.jpg.jpeg" alt="Uchchishta Ganapati" className="ug-hero-image" />
            <div className="ug-hero-overlay"></div>
            <div className="site-container ug-hero-content">
            <p className="ug-eyebrow">Sacred Chant Collection</p>
            <h1>Uchchishta Ganapati Mantra</h1>
            <h2 lang="ta" className="ug-tamil">உச்சிஷ்ட கணபதி தியானம்</h2>
            <a href="#ug-mantra-list" className="ug-hero-cta">Listen to Mantras</a>
            </div>
        </section>

        {/* INTRO */}
        <section className="ug-intro section section-padding">
            <div className="site-container container ug-grid-2">
            <aside className="ug-card ug-video-card" aria-label="Video placeholder">
                <img src="/assets/img/ganapathi/Untitled design 1.jpg.jpeg" alt="uchchishta ganapathi image " className="ug-video-image" />
            </aside>
            <article className="ug-card ug-intro-text">
                <h3 lang="ta" className="ug-tamil">தியான விளக்கம்</h3>
                <p lang="ta" className="ug-tamil">
                பாசம் அங்குசம் மோதகம்பாத்திரம் தந்தம் இவைகளை தாங்கிய கரங்களை உடையவரும், சிவந்தநிறம் உடையவரும், தன்மனைவியான நீலசரஸ்வதியை தனது இடது தொடையில் அமர்த்தி அவளது முலைகளை பிசைத்துக் கொண்டிருப்பவரும், தன் தும்பிகையால் அவளது யோனியை சுவைத்துக் கொண்டிருப்பவரும் நீலசரஸ்வதியின் கையை தனது ஆண்குறியில் வைத்து காமலீலை புரிபவருமான உச்சிஷ்ட கணபதியை தியானிக்கின்றேன்.
                </p>
                <a className="ug-hero-cta" href="https://wa.me/919092878389?text=Hi, I'm interested in homam" target="_blank" rel="noopener noreferrer">Book for Homam</a>
            </article>
            </div>
        </section>

        {/* MANTRA LIST */}
        <section className="ug-mantra section section-padding" id="ug-mantra-list">
            <div className="site-container container">
            <div className="ug-section-head">
                <h3 lang="ta" className="ug-tamil">மந்திரங்கள்</h3>
                <p>Audio recitations for daily chanting and sadhana practice.</p>
            </div>
            <div className="ug-mantra-grid">
                <article className="ug-card ug-mantra-card">
                <h4 lang="ta" className="ug-tamil">உச்சிஷ்ட கணபதி மந்திரம் 01</h4>
                <p lang="ta" className="ug-tamil">
                    ஓம் நமோ பகவதே ஏகதம்ஷ்ட்ராய ஹஸ்திமுகாய லம்போதராய உச்சிஷ்ட மகாத்மனே ஆம் க்ரோம் ஹ்ரீம் கம் கே கே ஸ்வாஹா
                </p>
                <audio src="/Uchchishta_Ganapati_Mandram_01.mp3" controls alt="nil"></audio>
                </article>
                <article className="ug-card ug-mantra-card">
                <h4 lang="ta" className="ug-tamil">உச்சிஷ்ட கணபதி மந்திரம் 02</h4>
                <p lang="ta" className="ug-tamil">
                    ஓம் ஹ்ரீம் ஹஸ்தி முகாய லம்போதராய உச்சிஷ்ட மஹாத்மனே க்ராம் க்ரீம் க்க்க்கேக்க்க்க்கே உச்சிஷ்டாய ஸ்வாஹா
                </p>
                <audio src="/Uchchishta_Ganapati_Mandram_02.mp3" controls></audio>
                </article>
                <article className="ug-card ug-mantra-card">
                <h4 lang="ta" className="ug-tamil">உச்சிஷ்ட கணபதி மந்திரம் 03</h4>
                <p lang="ta" className="ug-tamil">
                    ஓம் ஐம் ஹ்ரீம் சரீம் ஓம் ஹஸ்திமுகாய லம்போதராய உச்சிஷ்ட மகாத்மனே ஆம் க்ரோம் ஹ்ரீம் க்லீம் க்லௌம் கம் கே கே உச்சிஷ்டாய ஸ்வாஹா
                </p>
                <audio src="/Uchchishta_Ganapati_Mandram_04.mp3" controls></audio>
                </article>
                <article className="ug-card ug-mantra-card">
                <h4 lang="ta" className="ug-tamil">உச்சிஷ்ட கணபதி மந்திரம் 04</h4>
                <p lang="ta" className="ug-tamil">
                    ஓம் ஹ்ரீம் கம் உச்சிஷ்ட கணபதயே கே கே ஸ்வாஹா
                </p>
                <audio src="/Uchchishta_Ganapati_Mandram_03.mp3" controls></audio>
                </article>
                <article className="ug-card ug-mantra-card ug-mantra-card-wide">
                <h4 lang="ta" className="ug-tamil">நீலசரஸ்வதி மந்திரம்</h4>
                <p lang="ta" className="ug-tamil">
                    ஓம் ஹ்ரீம் ஐம் ஹூம் நீலசரஸ்வதி ஃபட் ஸ்வாஹா
                </p>
                <audio src="/Uchchishta_Ganapati_Neelasarasvati_Mandram.mp3" controls></audio>
                </article>
            </div>
            </div>
        </section>

        {/* GANESH FORMS */}
        <section className="ug-ganesh-forms section-padding">
            <div className="container">
            <header className="forms-header text-center">
                <h1 className="section-title">The 32 Forms of Lord Ganesha</h1>
                <p className="section-intro">
                Lord Ganesha, the remover of obstacles and the embodiment of wisdom and prosperity, manifests in 32 divine forms. Each form represents a unique spiritual energy, blessing devotees with protection, knowledge, courage, success, and fulfillment.
                </p>
            </header>

            <div className="ganesha-grid">
                {[
                { name: "Bala Ganapati", desc: "The child form of Ganesha symbolizing purity, innocence, and new beginnings." },
                { name: "Taruna Ganapati", desc: "The youthful form representing growth, vitality, and energetic progress." },
                { name: "Bhakti Ganapati", desc: "The devotional form that blesses devotees with faith, surrender, and spiritual love." },
                { name: "Veera Ganapati", desc: "The warrior form symbolizing strength, courage, and protection from negative forces." },
                { name: "Shakti Ganapati", desc: "Depicted with divine feminine energy, representing union, creativity, and cosmic balance." },
                { name: "Dwija Ganapati", desc: "The ‘twice-born’ form symbolizing knowledge, wisdom, and sacred learning." },
                { name: "Siddhi Ganapati", desc: "The giver of success and accomplishments in spiritual and worldly pursuits." },
                { name: "Ucchishta Ganapati", desc: "A tantric form symbolizing fulfillment of desires, mastery of arts, and deeper spiritual knowledge." },
                { name: "Vighna Ganapati", desc: "The remover of obstacles and protector against difficulties." },
                { name: "Kshipra Ganapati", desc: "The quick-acting form who grants wishes and responds rapidly to prayers." },
                { name: "Heramba Ganapati", desc: "The compassionate five-faced protector who guards devotees from fear." },
                { name: "Lakshmi Ganapati", desc: "Associated with prosperity, wealth, and abundance." },
                { name: "Maha Ganapati", desc: "The great and supreme form representing total power and fulfillment." },
                { name: "Vijaya Ganapati", desc: "The victorious form that ensures success in endeavors." },
                { name: "Nritya Ganapati", desc: "The dancing form symbolizing joy, celebration, and creative expression." },
                { name: "Urdhva Ganapati", desc: "The elevated form signifying spiritual upliftment and growth." },
                { name: "Ekakshara Ganapati", desc: "The embodiment of the sacred syllable ‘Om,’ representing ultimate reality." },
                { name: "Vara Ganapati", desc: "The boon-giving form who fulfills sincere prayers." },
                { name: "Tryakshara Ganapati", desc: "The three-lettered mantra form symbolizing divine sound vibration." },
                { name: "Kshipra Prasada Ganapati", desc: "The easily pleased form who quickly grants blessings." },
                { name: "Haridra Ganapati", desc: "The turmeric-hued form associated with auspiciousness and healing." },
                { name: "Ekadanta Ganapati", desc: "The single-tusked form representing sacrifice and determination." },
                { name: "Srishti Ganapati", desc: "The creator form symbolizing innovation and new ventures." },
                { name: "Uddanda Ganapati", desc: "The powerful and commanding form representing discipline and divine authority." },
                { name: "Rinamochana Ganapati", desc: "The liberator from debts and karmic burdens." },
                { name: "Dhundhi Ganapati", desc: "The seeker form who helps devotees find truth and inner clarity." },
                { name: "Dvimukha Ganapati", desc: "The two-faced form symbolizing duality and balanced perception." },
                { name: "Trimukha Ganapati", desc: "The three-faced form representing time – past, present, and future." },
                { name: "Sinha Ganapati", desc: "The lion-mounted form symbolizing bravery and royal strength." },
                { name: "Yoga Ganapati", desc: "The meditative form representing spiritual discipline and inner peace." },
                { name: "Durga Ganapati", desc: "The fierce form combining strength and protection from evil forces." },
                { name: "Sankatahara Ganapati", desc: "The reliever of troubles and remover of sorrows." }
                ].map((item, i) => (
                <div className="ganesh-card" key={i}>
                    <div className="card-number">{String(i + 1).padStart(2, '0')}</div>
                    <h3 className="card-title">{item.name}</h3>
                    <p className="card-desc">{item.desc}</p>
                </div>
                ))}
            </div>

            <footer className="forms-footer text-center">
                <p className="forms-conclusion">
                <strong>Conclusion:</strong> The 32 forms of Lord Ganesha reflect the vast spiritual dimensions of Vinayagar. Whether one seeks wisdom, prosperity, courage, or liberation, each form offers unique divine blessings to guide the devotee’s journey.
                </p>
            </footer>
            </div>
        </section>

        {/* CTA SECTION */}
        <section className="site-cta site-cta--uchchishta-ganapati" style={{ '--cta-bg-image': 'url(/assets/img/images_new/banner1.avif)' }} aria-label="Uchchishta Ganapati call to action">
            <div className="site-cta__content">
            <h2>Invoke Ganapati Grace</h2>
            <p>Join sacred worship and connect with mantra, offerings, and special pooja schedules.</p>
            <div className="site-cta__actions">
                <a href="/payment" className="site-cta__btn">Join Now</a>
                <a href="/calendar" className="site-cta__btn site-cta__btn--alt">View Dates</a>
            </div>
            </div>
        </section>
      </main>

      

      <FloatActions />
      <Footer />
    </>
  );
};

export default UchchishtaGanapati;

