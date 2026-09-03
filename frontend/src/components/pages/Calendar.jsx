import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import Footer from '../components/common/Footer.jsx';
import CalendarHeader from '../components/calendar/CalendarHeader.jsx';
import CalendarGrid from '../components/calendar/CalendarGrid.jsx';
import EventDetails from '../components/calendar/EventDetails.jsx';
import FloatActions from '../components/common/FloatActions.jsx'

const Calendar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  ;

  // Calendar State
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [eventsData, setEventsData] = useState({});
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mobile Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    // Default to today's real date on first load
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
  }, []);

  useEffect(() => {
    // Load events from JSON
    const fetchEvents = async () => {
      try {
        // Fetch static JSON
        const eventsUrl = `${import.meta.env.BASE_URL}data/events.json`;
        const response = await fetch(eventsUrl); // Public folder at build, BASE_URL-safe
        if (!response.ok) {
           // Fallback to local import if fetch fails (in development)
           const data = await import('../data/events.json').then(module => module.default || module);
           setEventsData(data);
           setLoading(false);
           return;
        }
        const data = await response.json();
        setEventsData(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load events.json from public directory, using local JS import fallback', err);
        try {
          // Native import fallback
          const localData = await import('../data/events.json').then(module => module.default || module);
          setEventsData(localData);
          setLoading(false);
        } catch (e) {
          setError(e.message);
          setLoading(false);
        }
      }
    };

    fetchEvents();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handlePrevYear = () => setCurrentYear(y => y - 1);
  const handleNextYear = () => setCurrentYear(y => y + 1);
  const handleYearChange = (year) => setCurrentYear(year);

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    
    // Select today
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    handleDayClick(dateStr);
  };

  const handleDayClick = (dateStr) => {
    setSelectedDateStr(dateStr);
    if (window.innerWidth <= 768) {
      setIsModalOpen(true);
    }
  };

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
        <title>Jai Varahi Peedam - Spiritual Calendar</title>
        <meta name="description" content="Amavasai, Pournami, Panchami, Ashtami, Nakshatra & Homam, and special pooja dates at Sri Kottai Varahi Temple, Jai Varahi Peedam." />
        <meta name="keywords" content="Varahi, Amavasai, Pournami, Panchami, Ashtami, Homam, Nakshatra, Pooja, Pallur, Temple, Calendar" />
        <meta property="og:title" content="Jai Varahi Peedam Calendar" />
        <meta property="og:description" content="Amavasai, Pournami, Panchami, Ashtami, Nakshatra & Homam, and special pooja dates" />
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

      <main id="main-content">
        <CalendarHeader 
          currentYear={currentYear}
          currentMonth={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onPrevYear={handlePrevYear}
          onNextYear={handleNextYear}
          onYearChange={handleYearChange}
          onGoToToday={handleGoToToday}
        />
        
        <div className="container">
          <CalendarGrid 
            currentYear={currentYear}
            currentMonth={currentMonth}
            eventsData={eventsData}
            onDayClick={handleDayClick}
            selectedDateStr={selectedDateStr}
          />
          
          {/* Desktop Event details, sticky panel */}
          <EventDetails 
            selectedDateStr={selectedDateStr}
            eventsData={eventsData}
            loading={loading}
            error={error}
          />
        </div>
        
        <section className="site-cta site-cta--calendar" style={{ '--cta-bg-image': `url('/assets/img/images_new/banner1.avif')` }} aria-label="Calendar page call to action">
          <div className="site-cta__content">
            <h2>Plan Your Temple Visits</h2>
            <p>Track pooja and homam dates, then book participation and offerings in advance.</p>
            <div className="site-cta__actions">
              <Link to="/payment" className="site-cta__btn">Book Offering</Link>
              <Link to="/about" className="site-cta__btn site-cta__btn--alt">Learn More</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Modal for Event Details */}
      {isModalOpen && (
        <div className="event-details-modal" role="dialog" aria-modal="true" style={{ display: 'flex' }}>
          <div className="modal-content-container">
            <div className="modal-header-section">
              <h2>Event Details</h2>
              <button className="modal-close-button" onClick={() => setIsModalOpen(false)} aria-label="Close modal">&times;</button>
            </div>
            
            <EventDetails 
              selectedDateStr={selectedDateStr}
              eventsData={eventsData}
              loading={loading}
              error={error}
            />
          </div>
        </div>
      )}

      <FloatActions />
      <Footer />
    </>
  );
};

export default Calendar;
