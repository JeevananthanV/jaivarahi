import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Globe, MessageCircleMore, Phone } from 'lucide-react';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx';

const ComingSoon = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);

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
        <title>Coming Soon - Jai Varahi Peedam</title>
        <meta
          name="description"
          content="Divine blessings are on their way. Jai Varahi Peedam new feature coming soon."
        />
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

      <main className="coming-soon-container">
        <div className="coming-soon-orbs" aria-hidden="true">
          <span className="coming-soon-orb coming-soon-orb--one" />
          <span className="coming-soon-orb coming-soon-orb--two" />
          <span className="coming-soon-orb coming-soon-orb--three" />
          <span className="coming-soon-orb coming-soon-orb--four" />
        </div>

        <div className="spiritual-bg" aria-hidden="true">
          <div className="om-symbol-bg">ॐ</div>
          <div className="om-symbol-bg">ॐ</div>
          <div className="om-symbol-bg">ॐ</div>
          <div className="om-symbol-bg">ॐ</div>
        </div>

        <section className="coming-soon-content" aria-label="Coming soon notice">
          <a href="/" className="coming-soon-logo-link">
            <img
              src="/assets/img/images_new/VARAHI LOGO.svg"
              alt="Jai Varahi Peedam"
              className="coming-soon-logo"
            />
          </a>

          <h1 className="coming-soon-title">Coming Soon</h1>
          <p className="coming-soon-subtitle">Divine blessings are on their way</p>

          <div className="social-links-section">
            <h2 className="social-links-title">Connect With Us</h2>
            <div className="social-links">
              <a
                href="https://www.facebook.com/PallurVarahiDhasan"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Globe size={18} aria-hidden="true" />
              </a>
              <a
                href="https://www.instagram.com/jai_varahi_peedam"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <MessageCircleMore size={18} aria-hidden="true" />
              </a>
              <a
                href="https://www.youtube.com/@kottaivarahiTV"
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <Globe size={18} aria-hidden="true" />
              </a>
              <a href="tel:+919092878389" className="social-link" aria-label="Phone">
                <Phone size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <FloatActions />
      <Footer />
    </>
  );
};

export default ComingSoon;
