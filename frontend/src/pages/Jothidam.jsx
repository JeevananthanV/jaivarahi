import React, { useState } from 'react';
import SeoEnhanced from '../components/common/SeoEnhanced.jsx';
import { pageFaqs } from '../data/faqData.js';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx';

const Jothidam = () => {
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

  const services = [
    {
      id: 1,
      title: 'Panchangam',
      icon: 'fa-calendar-alt',
      desc: 'Daily calendar with auspicious times, horai, nakshatra details, and planetary positions for optimal planning.',
      details: [
        'Day Description – Tamil year, English year, Tithi, Nakshathram',
        'Sunrise, Sunset, Rahu Kaalam, Emaganda Kaalam, Kuligai',
        'Auspicious Time – Muhurtham timings based on Horai & Gowri',
        'Horai – 24-hour planetary timings'
      ]
    },
    {
      id: 2,
      title: 'Horoscope',
      icon: 'fa-star',
      desc: 'Personalized horoscope reports with detailed planetary positions, dasa periods, and life predictions.',
      details: [
        'Horoscope generation & interpretation',
        'Zodiac phases, Dasa varka chakram',
        'Saturn\'s Kocharam (Kandaga, Ezharai & Ashtama Sani)',
        'Full Desa periods (up to 120 years)'
      ]
    },
    {
      id: 3,
      title: 'Kochara',
      icon: 'fa-globe',
      desc: 'Planetary positions, nakshatra paadha saaram, lagnam timings, and sub-planetary influences.',
      details: [
        'Kocharam Details – Daily planetary positions & effects',
        'Kochara Kattam – Zodiac phase features',
        'Nakshatra Paadha Saaram – Nakshatra-specific predictions',
        'Sub-Planetary Influences – Uranus, Neptune, Pluto effects'
      ]
    },
    {
      id: 4,
      title: 'Match Making',
      icon: 'fa-heart',
      desc: 'Zodiac compatibility analysis, papasamyam, and detailed horoscope matching for marriage.',
      details: [
        'Male & female horoscope compatibility',
        'Paava chakras & Panchanga details',
        'Star match analysis',
        'Papasamyam assessment',
        'Desasanthi compatibility'
      ]
    },
    {
      id: 5,
      title: 'Muhurtham',
      icon: 'fa-clock',
      desc: 'Auspicious time selection for marriage, housewarming, business openings, and special events.',
      details: [
        'Marriage Muhurtham',
        'Housewarming (Vastu Pooja / Gruhapravesam)',
        'Naming ceremony',
        'Business openings'
      ]
    }
  ];

  return (
    <>
      <SeoEnhanced
        title="Sri Varahi Jothida Vidyalayam | Best Astrology Services in Vellore"
        description="Consult Sri Varahi Jothida Vidyalayam in Vellore for expert Vedic Astrology, Horoscope matching, Panchangam, and Muhurtham services. Founded by Swamy Pallur Varahidhasan."
        keywords="Sri Varahi Jothida Vidyalayam, Jothidam Vellore, Astrology Services, Horoscope Matching, Tamil Panchangam, Muhurtham, Swamy Pallur Varahidhasan, Vedic Astrology, Katpadi Astrologer"
        canonical="https://www.jaivarahi.org/Jothidam"
        ogTitle="Sri Varahi Jothida Vidyalayam | Authentic Astrology Services"
        ogDescription="Get accurate astrological guidance, horoscopes, and match-making services in Vellore."
        ogImage="https://www.jaivarahi.org/assets/img/images_new/VARAHI%20LOGO.svg"
        ogUrl="https://www.jaivarahi.org/Jothidam"
        faqs={pageFaqs.vidyalayam}
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

      <main id="main-content">
        {/* Hero Section */}
        <header className="hero-banner">
            <div className="hero-content">
                <h1 className="hero-title">Astrology Services by <span>Sri Varahi</span> Jothida Vidyalayam</h1>
                <p className="hero-description">Founded by Swamy Pallur Varahidhasan, we offer authentic astrological guidance to illuminate your life's path with ancient wisdom and cosmic insights.</p>
                <a href="tel:+919092878389" className="donate-btn">Call Now</a>
            </div>
        </header>

        {/* About Section */}
        <section className="about-section" style={{ boxShadow: 'none', paddingTop: '60px', border: 'none', borderRadius: '0' }} aria-label="About Sri Varahi Jothida Vidyalayam">
            <div className="container">
                <div className="about-container">
                    <div className="about-content">
                        <h2>About Sri Varahi Jothida Vidyalayam</h2>
                        <p>Located at Katpadi, Vellore, Tamil Nadu, Sri Varahi Jothida Vidyalayam is a renowned institute of astrology founded by the esteemed Swamy Pallur Varahidhasan. With decades of experience in Vedic astrology, our institute has been guiding individuals through life's challenges and opportunities.</p>
                        <p>We offer a wide range of astrology-related services to help individuals gain clarity and direction in their personal and professional lives. Our approach combines traditional astrological wisdom with modern insights to provide practical guidance.</p>
                    </div>
                    <div className="about-image">
                        <img src="/assets/img/banner/banner2.jpg" alt="Astrology Institute in Vellore - Sri Varahi Jothida Vidyalayam" loading="lazy" width="600" height="400" />
                    </div>
                </div>
            </div>
        </section>

        {/* Services Section */}
        <section className="services-section" aria-label="Astrology Services">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Our Astrology Services</h2>
                    <p>We offer comprehensive astrological services to guide you through life's journey with clarity and confidence.</p>
                </div>
                <div className="services-grid">
                    {services.map((service) => (
                      <article key={service.id} className="service-card" itemScope itemType="https://schema.org/Service">
                          <div className="service-icon">
                              <i className={`fas ${service.icon}`}></i>
                          </div>
                          <div className="service-content">
                              <h3 className="service-title" itemProp="name">{service.title}</h3>
                              <p className="service-description" itemProp="description">{service.desc}</p>
                              <div className="service-details">
                                  <h4>Complete Details:</h4>
                                  <ul>
                                      {service?.details?.map((detail, idx) => (
                                          <li key={idx}>{detail}</li>
                                      ))}
                                  </ul>
                              </div>
                              <a href="/Jothidam/book" className="primary-button booking-button">Book Now</a>
                          </div>
                      </article>
                    ))}
                </div>
            </div>
        </section>

        {/* Booking Section */}
        <section id="booking" className="booking-section" aria-label="Book Consultation">
            <div className="container">
                <div className="booking-container">
                    <div className="booking-header">
                        <h2>Book Your Consultation</h2>
                        <p>Connect with us through your preferred method to receive personalized astrological guidance</p>
                    </div>

                    <div className="booking-content">
                        <div className="booking-card">
                            <div className="booking-icon">
                                <i className="fas fa-phone-alt"></i>
                            </div>
                            <h3>Call Us</h3>
                            <p>Speak directly with our astrologers for immediate guidance and appointment scheduling.</p>
                            <div className="contact-item">
                                <i className="fas fa-mobile-alt"></i>
                                <span><a href="tel:+919092878389">+91-9092878389</a></span>
                            </div>
                            <div className="contact-item">
                                <i className="fas fa-mobile-alt"></i>
                                <span><a href="tel:+919500206199">+91-9500206199</a></span>
                            </div>
                            <a href="tel:+919092878389" className="primary-button">Call Now</a>
                        </div>

                        <div className="booking-card">
                            <div className="booking-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <h3>Email Us</h3>
                            <p>Send us your birth details and queries for detailed astrological analysis and recommendations.</p>
                            <div className="contact-item">
                                <i className="fas fa-envelope"></i>
                                <span><a href="mailto:varahikottai@gmail.com">varahikottai@gmail.com</a></span>
                            </div>
                            <a href="mailto:varahikottai@gmail.com" className="primary-button">Send Email</a>
                        </div>

                        <div className="booking-card">
                            <div className="booking-icon">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <h3>Visit Us</h3>
                            <p>Experience personalized consultation at our institute with our expert astrologers.</p>
                            <div className="contact-item">
                                <i className="fas fa-location-arrow"></i>
                                <span>29, Udaiyar Street,<br/>Arumparuthi, Katpadi,<br/>Vellore – Tamil Nadu</span>
                            </div>
                            <a href="https://maps.google.com/?q=Sri+Varahi+Jothida+Vidyalayam" target="_blank" rel="noopener noreferrer" className="primary-button">Get Directions</a>
                        </div>
                    </div>

                    <div className="booking-info">
                        <h3>Get Personalized Astrological Guidance</h3>
                        <p>Our experienced astrologers provide personalized consultations based on your birth chart and planetary positions. Whether you're facing challenges in career, relationships, health, or seeking spiritual guidance, our services can help you navigate life with clarity and confidence.</p>
                        <p>Book a consultation today to unlock the wisdom of the stars and align yourself with cosmic energies for a harmonious life journey.</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="site-cta site-cta--vidyalayam" style={{ '--cta-bg-image': 'url(/assets/img/images_new/banner1.avif)' }} aria-label="Vidyalayam call to action">
            <div className="site-cta__content">
                <h2>Book Your Astrology Consultation</h2>
                <p>Get personalized guidance for career, relationships, health, and spiritual growth.</p>
                <div className="site-cta__actions">
                <a href="/Jothidam/book" className="site-cta__btn">Book Online</a>
                <a href="tel:+919092878389" className="site-cta__btn">Call Now</a>
                <a href="/calendar" className="site-cta__btn site-cta__btn--alt">See Dates</a>
                </div>
            </div>
        </section>
      </main>

      <FloatActions />

      <Footer />
    </>
  );
};

export default Jothidam;
