import React, { useEffect, useState } from 'react';
import SeoEnhanced from '../components/common/SeoEnhanced.jsx';
import { pageFaqs } from '../data/faqData.js';
import '../assets/css/asta-varahi.css';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import FloatActions from '../components/common/FloatActions.jsx';
import Footer from '../components/common/Footer.jsx';

// Data
import { astaVarahiDharshanData } from '../data/astaVarahiDharshanData.js';

// Components
import DharshanHero from '../components/Asta_Varahi_Dharsan/DharshanHero.jsx';
import DharshanPromo from '../components/Asta_Varahi_Dharsan/DharshanPromo.jsx';
import GuestScrolling from '../components/Asta_Varahi_Dharsan/GuestScrolling.jsx';
import OurImpacts from '../components/Asta_Varahi_Dharsan/OurImpacts.jsx';
import SponsorSection from '../components/Asta_Varahi_Dharsan/SponsorSection.jsx';
import Testimonials from '../components/Asta_Varahi_Dharsan/Testimonials.jsx';
import DharshanCta from '../components/Asta_Varahi_Dharsan/DharshanCta.jsx';

const AstaVarahi = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  ;

  // Same global navigation object
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

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    setActiveMobileDropdown(null);
  };

  const toggleMobileDropdown = (label) => {
    setActiveMobileDropdown((current) => (current === label ? null : label));
  };

  return (
    <>
      <SeoEnhanced
        title="Asta Varahi Dharshanam | Jai Varahi Peedam - Divine Festival Celebration"
        description="Join us for the most auspicious spiritual event of the year, Asta Varahi Dharshanam. Experience divine blessings, rituals, and community service at Jai Varahi Peedam, Vellore."
        keywords="Asta Varahi Dharshanam, Jai Varahi Peedam, Varahi Amman, Spiritual Event, Temple Festival, Community Service, Vellore"
        canonical="https://www.jaivarahi.org/astavarahi"
        ogTitle="Asta Varahi Dharshanam Preview - Jai Varahi Peedam"
        ogDescription="Experience the divine blessings of Sri Kottai Varahi Amman in our grand two-day celebration."
        ogImage="https://www.jaivarahi.org/assets/img/images_new/VARAHI%20LOGO.svg"
        ogUrl="https://www.jaivarahi.org/astavarahi"
        faqs={pageFaqs.astaVarahi}
        author={{
          name: 'Swamy Pallur Varahidhasan',
          url: 'https://www.jaivarahi.org/about',
          jobTitle: 'Founder & Spiritual Head, Jai Varahi Peedam',
          description: 'Practitioner of Vedic traditions and Varahi Amman worship with decades of experience in performing sacred poojas, homams, and providing Jothidam (astrology) guidance.',
        }}
      />

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

      <main id="main-content" role="main">
        <DharshanHero heroData={astaVarahiDharshanData.hero} />
        <DharshanPromo promoData={astaVarahiDharshanData.promo} />
        <GuestScrolling guests={astaVarahiDharshanData.guests} />
        <OurImpacts impactsData={astaVarahiDharshanData.impacts} />
        <SponsorSection sponsors={astaVarahiDharshanData.sponsors} />
        <Testimonials testimonials={astaVarahiDharshanData.testimonials} />
        <DharshanCta ctaData={astaVarahiDharshanData.cta} />
      </main>

      <FloatActions />
      <Footer />
    </>
  );
};

export default AstaVarahi;
