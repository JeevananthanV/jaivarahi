import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx'


const VarahiMalai = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  ;
  
  const [language, setLanguage] = useState('en');
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    let isMounted = true;

    const loadSongs = async () => {
      try {
        const module = await import('../data/songs.json');
        if (!isMounted) return;
        setSongs(module.default?.songs || []);
      } catch (error) {
        if (isMounted) {
          setSongs([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const timer = window.setTimeout(loadSongs, 300);

    return () => {
      isMounted = false;
      window.clearTimeout(timer);
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
      <Helmet>
        <title>Varahi Malai | Varahi Manthram & Tamil Devotional Songs</title>
        <meta name="description" content="Listen to sacred Varahi Malai and Varahi Manthram. A divine collection of Tamil devotional songs, stotrams, and prayers dedicated to Goddess Varahi Amman." />
        <meta name="keywords" content="Varahi Malai, Varahi Manthram, Varahi Songs, Goddess Varahi Stotram, Tamil Devotional Songs, Jai Varahi Peedam, Varahi Amman Pooja, Lalitha Sahasranamam" />
        <meta property="og:title" content="Varahi Malai | Varahi Manthram & Tamil Devotional Songs" />
        <meta property="og:description" content="Stream powerful Varahi Manthrams and sacred songs at Jai Varahi Peedam." />
        <meta property="og:url" content="https://www.jaivarahi.org/varahimalai" />
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

      <main id="main-content">
        <div id="songs-wrapper" className="container">
          <div className="language_Selector">
              <label htmlFor="language">Select Language: </label>
              <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="en">English</option>
                  <option value="ta">தமிழ்</option>
              </select>
          </div>

          {isLoading ? (
            <article className="loading-container">
                <div className="loading-spinner" aria-hidden="true"></div>
                <p>Loading Varahi Manthrams and Songs...</p>
            </article>
          ) : (
            songs.map((song, index) => (
              <div className="song-container animate-in" key={index}>
                  <div className="song-text">
                      <h2 className="song-title">{song[language]?.title}</h2>
                      <p className="song-content">{song[language]?.content}</p>
                  </div>
                  <div className="song-video">
                      <iframe 
                          width="100%" 
                          height="315" 
                          src={`https://www.youtube.com/embed/${song.videoId}`}
                          title="YouTube video player" 
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen>
                      </iframe>
                  </div>
              </div>
            ))
          )}
        </div>
        
        <section className="site-cta site-cta--varahimalai" style={{ '--cta-bg-image': 'url(/assets/img/images_new/banner2.avif)' }} aria-label="Varahimalai call to action">
            <div className="site-cta__content">
                <h2>Continue With Varahi Manthram</h2>
                <p>Read, chant, and share sacred hymns with the devotional community.</p>
                <div className="site-cta__actions">
                <a href="/who_is_varahi" className="site-cta__btn">Read More</a>
                <a href="/payment" className="site-cta__btn site-cta__btn--alt">Support Mission</a>
                </div>
            </div>
        </section>
      </main>

      

      <FloatActions />
      <Footer />
    </>
  );
};

export default VarahiMalai;
