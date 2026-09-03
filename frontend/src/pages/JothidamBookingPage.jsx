import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx';
import SeoEnhanced from '../components/common/SeoEnhanced.jsx';
import { pageFaqs } from '../data/faqData.js';
import JothidamBookingWizard from '../components/forms/JothidamBookingWizard.jsx';

const JothidamBookingPage = () => {
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
        { label: 'Book Consultation', href: '/Jothidam/book' },
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

  const handleBookingComplete = async (formData) => {
    const response = await fetch('/api/jothidam/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Booking failed');
    return data;
  };

  return (
    <>
      <SeoEnhanced
        title="Book Your Jothidam Consultation | Sri Varahi Vidyalayam"
        description="Book your astrology consultation online. Choose from Panchangam, Horoscope, Kochara, Match Making, or Muhurtham services."
        keywords="Book astrology consultation, Jothidam booking, Panchangam, Horoscope, Match Making, Muhurtham, Vellore astrology"
        canonical="https://www.jaivarahi.org/Jothidam/book"
        ogTitle="Book Your Jothidam Consultation"
        ogDescription="Book your astrology consultation online with Sri Varahi Jothida Vidyalayam."
        ogImage="https://www.jaivarahi.org/assets/img/images_new/VARAHI%20LOGO.svg"
        ogUrl="https://www.jaivarahi.org/Jothidam/book"
        faqs={pageFaqs.vidyalayam}
        author={{
          name: 'Swamy Pallur Varahidhasan',
          url: 'https://www.jaivarahi.org/about',
          jobTitle: 'Founder & Spiritual Head, Jai Varahi Peedam',
          description: 'Practitioner of Vedic traditions and Varahi Amman worship.',
        }}
      />

      <Preloader autoHide />
      <Navbar items={navItems} onOpenMobile={() => setIsMobileOpen(true)} isMobileOpen={isMobileOpen} />
      <MobileNav items={navItems} isOpen={isMobileOpen} activeDropdown={activeMobileDropdown} onClose={closeMobileMenu} onToggleDropdown={toggleMobileDropdown} />
      <div className={`mobile-nav-overlay${isMobileOpen ? ' active' : ''}`} onClick={closeMobileMenu} role="presentation" />

      <main id="main-content">
        <section className="jothidam-booking-hero" aria-label="Booking hero">
          <div className="container">
            <h1>Book Your Astrology Consultation</h1>
            <p>Choose from our expert astrology services and book your consultation online.</p>
          </div>
        </section>

        <section className="jothidam-booking-wizard-section" aria-label="Booking form">
          <div className="container">
            <JothidamBookingWizard onComplete={handleBookingComplete} />
          </div>
        </section>
      </main>

      <FloatActions />
      <Footer />
    </>
  );
};

export default JothidamBookingPage;