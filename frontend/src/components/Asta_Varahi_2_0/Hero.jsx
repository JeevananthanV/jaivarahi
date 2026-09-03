import React, { useState, useEffect } from 'react';

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      bg: '/assets/img/banner/banner1.jpg',
      kicker: 'Asta Varahi 2.0',
      title: 'Divine Blessings & Spiritual Enlightenment',
      desc: 'Join us for the most auspicious spiritual event of the year. Experience divine blessings and spiritual enlightenment at our grand celebration in Vellore.',
      showTimer: true,
      meta: null,
      actions: (
        <div className="av-hero-actions">
          <a href="#tickets" className="av-btn av-btn-primary">Book Now</a>
          <a href="#about" className="av-btn av-btn-ghost">Learn More</a>
        </div>
      )
    },
    {
      bg: '/assets/img/banner/banner2.jpg',
      kicker: 'Sacred Gathering',
      title: 'Connect with Thousands of Devotees',
      desc: 'Experience the divine presence of Goddess Varahi alongside fellow devotees in this sacred gathering of faith and spirituality.',
      showTimer: false,
      meta: (
        <div className="av-hero-meta">
          <div className="av-hero-meta-item">
            <i className="fa-solid fa-calendar-days"></i> 27 May 2026
          </div>
          <div className="av-hero-meta-item">
            <i className="fa-solid fa-clock"></i> 12:30 PM Onwards
          </div>
          <div className="av-hero-meta-item">
            <i className="fa-solid fa-location-dot"></i> Arumparuthi, Vellore
          </div>
        </div>
      ),
      actions: (
        <div className="av-hero-actions">
          <a href="#tickets" className="av-btn av-btn-primary">Join the Gathering</a>
          <a href="#schedule" className="av-btn av-btn-ghost">View Schedule</a>
        </div>
      )
    },
    {
      bg: '/assets/img/banner/banner3.jpg',
      kicker: 'Temple Construction',
      title: 'Support the Temple Development',
      desc: 'Your generous donations will help in the ongoing temple construction and development projects to create a magnificent abode for Goddess Varahi.',
      showTimer: false,
      meta: null,
      actions: (
        <div className="av-hero-actions">
          <a href="#donation" className="av-btn av-btn-primary">Donate Now</a>
          <a href="#venue" className="av-btn av-btn-ghost">Visit Venue</a>
        </div>
      )
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <section className="av-hero" id="home" aria-label="Asta Varahi 2.0 highlights">
      <div className="av-hero-slider" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {slides.map((slide, index) => (
          <article
            key={index}
            className={`av-hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              '--av-bg': `url('${slide.bg}')`,
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              position: index === currentSlide ? 'relative' : 'absolute',
              top: 0, left: 0, width: '100%', height: '100%', zIndex: index === currentSlide ? 1 : 0
            }}
          >
            <div className="av-hero-overlay"></div>
            <div className="av-wrapper av-hero-content">
              <span className="av-hero-kicker">{slide.kicker}</span>
              <h1>{slide.title}</h1>
              {slide.meta}
              {slide.showTimer && <EventTimer />}
              <p>{slide.desc}</p>
              {slide.actions}
            </div>
          </article>
        ))}
      </div>
      <button className="av-hero-nav av-hero-prev" type="button" aria-label="Previous slide" onClick={prevSlide} style={{ zIndex: 10 }}>
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button className="av-hero-nav av-hero-next" type="button" aria-label="Next slide" onClick={nextSlide} style={{ zIndex: 10 }}>
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </section>
  );
}

const EventTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date("2026-05-27T00:00:00+05:30").getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(target - now, 0);
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60)
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <div className="av-hero-timer" aria-label="Event countdown">
      <div className="av-hero-timer-item">
        <span>{pad(timeLeft.days)}</span>
        <small>Days</small>
      </div>
      <div className="av-hero-timer-item">
        <span>{pad(timeLeft.hours)}</span>
        <small>Hours</small>
      </div>
      <div className="av-hero-timer-item">
        <span>{pad(timeLeft.mins)}</span>
        <small>Mins</small>
      </div>
      <div className="av-hero-timer-item">
        <span>{pad(timeLeft.secs)}</span>
        <small>Secs</small>
      </div>
    </div>
  );
};

export default Hero;
