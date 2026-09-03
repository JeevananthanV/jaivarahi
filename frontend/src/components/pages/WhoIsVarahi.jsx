import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx'


const WhoIsVarahi = () => {
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
        <link rel="canonical" href="https://www.jaivarahi.org/who_is_varahi" />
        <title>Who Is Goddess Varahi? Power of Varahi Worship | Varahi Devi</title>
        <meta name="description" content="Learn who Goddess Varahi is, her divine powers, Varahi worship significance, Varahi Darshan, and teachings guided by Swamy Pallur Varahidhasan." />
        <meta name="keywords" content="Goddess Varahi, Varahi Devi, Varahi Worship, Varahi Darshan, Sapta Matrikas, Varahi Amma, Swamy Pallur Varahidhasan" />
        <meta property="og:title" content="Who Is Goddess Varahi? | Understanding the Power of Varahi Worship" />
        <meta property="og:description" content="The supreme protector, warrior Shakti, and secret guardian of true devotees. Learn the philosophy of worship." />
        <meta property="og:url" content="https://www.jaivarahi.org/who_is_varahi" />
      </Helmet>

      <Preloader />
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

      <main>
        {/* HERO SECTION */}
        <header className="hero-landing">
            <div className="hero-content-box">
                <h1>Who Is Goddess Varahi?</h1>
                <p>Understanding the Power of Varahi Worship</p>
                <p style={{ fontSize: '1rem', marginTop: '1rem' }}>
                    The supreme protector, warrior Shakti, and secret guardian of <span className="hero-highlight">true devotees</span>.
                </p>
            </div>
        </header>

        {/* CORE STORY LAYOUT */}
        <section className="core-story-layout">
            <div className="wrapper-main">
                <div className="story-grid">
                    <div className="story-text">
                        <h2>Who Is Goddess Varahi?</h2>
                        <p>
                            Goddess Varahi represents fearless divine authority combined with motherly protection. Depicted with face of a boar and the body of a powerful mother goddess, she symbolizes strength, vigilance, and uncompromising justice.
                        </p>
                        <p>
                            Unlike commonly worshipped deities, Varahi Amma is regarded as a Gupta Devata (secret deity). Her worship is deeply rooted in discipline, surrender, and spiritual responsibility rather than ritual display.
                        </p>
                    </div>
                    <div className="custom-promo-video">
                        <iframe src="https://www.youtube.com/embed/zVPCXZWOLwQ" title="Asta Varahi 2.0 Promo Video" allowFullScreen></iframe>
                    </div>
                </div>
            </div>
        </section>

        {/* INTRODUCTION BLOCK */}
        <section className="intro-block">
            <div className="wrapper-main intro-content">
                <h2>Understanding Goddess Varahi</h2>
                <p>
                    Goddess Varahi Devi is one of the Sapta Matrikas, seven divine mother goddesses of Hindu tradition. She embodies the Shakti (divine power) of Lord Varaha, boar incarnation of Lord Vishnu, who restored cosmic balance by lifting Mother Earth from darkness.
                </p>
                <p>
                    Varahi Devi is revered as a supreme guardian deity whose worship grants protection, courage, discipline, and victory over negative forces. Her presence is subtle yet powerful, guiding devotees through both visible and unseen challenges.
                </p>
            </div>
        </section>

        {/* PHILOSOPHY SECTION */}
        <section className="philosophy-module">
            <div className="wrapper-main">
                <h2>The Sacred Path of Varahi Worship</h2>
                <p style={{ maxWidth: '800px', margin: '1rem auto' }}>
                    True Varahi worship is not merely ritualistic—it is a sacred bond between the devotee and the Divine Mother. Varahi Amma responds not to fear or show, but to sincerity, discipline, and surrender.
                </p>
                <ul className="philosophy-list">
                    <li>Inner fearlessness</li>
                    <li>Mental discipline</li>
                    <li>Spiritual clarity</li>
                    <li>Divine protection</li>
                </ul>
                <p style={{ marginTop: '2rem' }}>She transforms the devotee from within, guiding them toward dharma and self-control.</p>
            </div>
        </section>

        {/* DIVINE POWERS SECTION */}
        <section className="power-grid-system">
            <div className="wrapper-main text-center">
                <h2>Varahi Devi Is Revered As:</h2>
                <div className="grid-4-col">
                    <div className="feature-card">
                        <i className="fas fa-shield-halved card-icon"></i>
                        <h3>Protector Goddess</h3>
                        <p>Shields devotees from enemies, black magic, and negative energies.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-khanda card-icon"></i>
                        <h3>Warrior Form of Shakti</h3>
                        <p>Grants courage, confidence, and victory in difficult situations.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-eye card-icon"></i>
                        <h3>Guardian Through Darshan</h3>
                        <p>Watches over sincere devotees and guides them silently.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-hand-sparkles card-icon"></i>
                        <h3>Supreme Tantric Deity</h3>
                        <p>Holds a secret yet exalted position in Shakta and Tantric traditions.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* CTA SECTION */}
        <section className="site-cta site-cta--who-is-varahi" style={{ '--cta-bg-image': 'url(/assets/img/images_new/banner2.avif)' }} aria-label="Who is Varahi call to action">
            <div className="site-cta__content">
                <h2>Start Authentic Varahi Worship</h2>
                <p>Learn the path, follow sacred discipline, and receive practical devotional guidance.</p>
                <div className="site-cta__actions">
                <a href="/varahimalai" className="site-cta__btn">Explore Mantras</a>
                <a href="/payment" className="site-cta__btn site-cta__btn--alt">Support Peedam</a>
                </div>
            </div>
        </section>
      </main>

      

      <FloatActions />
      <Footer />
    </>
  );
};

export default WhoIsVarahi;
