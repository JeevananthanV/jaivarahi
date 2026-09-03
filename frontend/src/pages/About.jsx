import React, { useEffect, useState } from 'react';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import FloatActions from '../components/common/FloatActions.jsx';
import Footer from '../components/common/Footer.jsx';
import AboutHero from '../components/about/AboutHero.jsx';
import AboutTextSection from '../components/about/AboutTextSection.jsx';
import TempleGallery from '../components/about/TempleGallery.jsx';
import Statistics from '../components/about/Statistics.jsx';
import TeamLeadership from '../components/about/TeamLeadership.jsx';
import AboutCta from '../components/about/AboutCta.jsx';
import SeoEnhanced from '../components/common/SeoEnhanced.jsx';
import { pageFaqs } from '../data/faqData.js';
import { aboutData } from '../data/aboutData.js';

const About = () => {
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

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  // Handle ripples
  useEffect(() => {
    const createRipple = (event) => {
      const button = event.currentTarget;
      const existingRipple = button.querySelector('.ripple');
      if (existingRipple) existingRipple.remove();

      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.add('ripple');

      button.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 600);
    };

    const buttons = document.querySelectorAll('.icon-btn, .donate-btn');
    buttons.forEach((button) => button.addEventListener('click', createRipple));

    return () => {
      buttons.forEach((button) => button.removeEventListener('click', createRipple));
    };
  }, []);

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
        title="About Jai Varahi Peedam - Sacred Temple & Community Service"
        description="Learn about Jai Varahi Peedam, a sacred Goddess Varahi Amman Temple in Vellore. Discover our mission in spiritual guidance, community service, astrology, and cultural preservation."
        keywords="Jai Varahi Peedam, Varahi Amman Temple, Vellore Temple, Spiritual Guidance, Jothidam, Astrology, Community Service, Varahi Pooja, Homams"
        canonical="https://www.jaivarahi.org/about"
        ogTitle="About Jai Varahi Peedam - Sacred Temple & Community Service"
        ogDescription="Jai Varahi Peedam is dedicated to Goddess Varahi Amman worship, offering traditional poojas, astrology, and impactful community welfare programs."
        ogImage="https://www.jaivarahi.org/assets/img/images_new/VARAHI%20LOGO.svg"
        ogUrl="https://www.jaivarahi.org/about"
        faqs={pageFaqs.about}
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
        <AboutHero title={aboutData.hero.title} description={aboutData.hero.description} />
        
        <div className="about-content">
          <AboutTextSection title={aboutData.intro.title} content={aboutData.intro.content} isIntro={true} />
          
          <TempleGallery images={aboutData.galleries.gallery1} ariaLabel="Temple Imagery" />
          
          {aboutData.sections.map((section, idx) => (
            <AboutTextSection key={idx} title={section.title} content={section.content} />
          ))}

          <Statistics stats={aboutData.stats} />

          {aboutData.moreSections.map((section, idx) => (
            <AboutTextSection key={idx} title={section.title} content={section.content} />
          ))}

          <TempleGallery images={aboutData.galleries.gallery2} ariaLabel="Community and Rituals Imagery" />

          {aboutData.eventsSections.map((section, idx) => (
            <AboutTextSection key={idx} title={section.title} content={section.content} />
          ))}

          <TeamLeadership team={aboutData.team} />

          <AboutTextSection title={aboutData.futurePlans.title} content={aboutData.futurePlans.content} />
        </div>

        <AboutCta ctaData={aboutData.cta} />
      </main>

      <FloatActions />
      <Footer />
    </>
  );
};

export default About;
