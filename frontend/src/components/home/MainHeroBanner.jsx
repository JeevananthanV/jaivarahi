import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function MainHeroBanner() {
  const overlayRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const overlay = overlayRef.current;
    const container = overlay ? overlay.parentElement : null;
    if (!overlay || !container) return undefined;

    let lastScrollY = window.scrollY;
    let transitionTriggered = false;

    overlay.style.transform = 'translateY(100%)';

    const resetOverlay = () => {
      overlay.style.transition = 'none';
      overlay.style.transform = 'translateY(100%)';
      window.requestAnimationFrame(() => {
        overlay.style.transition = 'transform 5s ease-out';
      });
      transitionTriggered = false;
    };

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollingDown = window.scrollY > lastScrollY;

      if (!scrollingDown && (rect.bottom <= 0 || rect.top >= viewportHeight)) {
        resetOverlay();
      }

      if (scrollingDown && rect.top <= 0 && !transitionTriggered) {
        transitionTriggered = true;
        overlay.style.transform = 'translateY(0%)';

        const handleTransitionEnd = () => {
          overlay.style.transition = 'transform 2s ease-out';
          overlay.style.transform = 'translateY(35%)';
          overlay.removeEventListener('transitionend', handleTransitionEnd);
        };

        overlay.addEventListener('transitionend', handleTransitionEnd);
      }

      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="main-hero-banner">
      <div className="hero-background-image"></div>

      <div className="animated-color-overlay-container">
        <div className="animated-color-overlay" ref={overlayRef}></div>
      </div>

      <div className="vision-content-card">
        <h2>Vision</h2>
        <p>
          Your donation helps create a powerful spiritual home for thousands of devotees. Contribute
          today. Be a part of Varahi Devi's divine mission. Together, let us build HER temple and spread HER
          blessings to the world.
        </p>
        <button className="primary-action-button" id="donate-bttn" onClick={() => navigate('/payment')}>
          Donate
        </button>
      </div>
    </section>
  );
}

export default MainHeroBanner;
