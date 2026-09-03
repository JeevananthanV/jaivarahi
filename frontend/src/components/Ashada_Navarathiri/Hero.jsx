import { useEffect, useState } from 'react'

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      bg: '/assets/img/banner/banner1.jpg',
      kicker: 'Ashada Navarathiri 2026',
      title: 'Sacred Eleven Nights of Divine Blessings',
      desc: 'Experience eleven days of powerful homams, sacred abhishekams, annadhanam, and divine worship under the grace of Sri Kottai Varahi Amman.',
      meta: (
        <div className="an-hero-meta">
          <div className="an-hero-meta-item">
            <i className="fa-solid fa-calendar-days"></i> 13 July - 23 July 2026
          </div>
          <div className="an-hero-meta-item">
            <i className="fa-solid fa-location-dot"></i> Arumparuthi, Vellore
          </div>
          <div className="an-hero-meta-item">
            <i className="fa-solid fa-clock"></i> Morning 9:30 AM
          </div>
          <div className="an-hero-meta-item">
            <i className="fa-solid fa-bowl-food"></i> Daily Annadhanam 12:30 PM
          </div>
        </div>
      ),
      trustBadges: (
        <div className="an-hero-badges" aria-label="Trust badges">
          <span className="an-hero-badge">🕉 11 Divine Days</span>
          <span className="an-hero-badge">🔥 Daily Varahi Homams</span>
          <span className="an-hero-badge">🍛 Free Annadhanam</span>
          <span className="an-hero-badge">🐄 Goshala Seva</span>
          <span className="an-hero-badge">🙏 Family Sankalpam</span>
        </div>
      ),
      actions: (
        <div className="an-hero-actions">
          <a href="#booking" className="an-btn an-btn-primary">Participate Now</a>
          <a href="#ashada-schedule" className="an-btn an-btn-ghost">View Schedule</a>
        </div>
      )
    },
    {
      bg: '/assets/img/banner/banner2.jpg',
      kicker: 'Daily Rituals & Programs',
      title: 'Plan Every Day of the Festival',
      desc: 'Explore the detailed pooja timings, cultural programs, and special offerings curated for each night.',
      meta: <EventTimer />,
      actions: (
        <div className="an-hero-actions">
          <a href="#ashada-schedule" className="an-btn an-btn-primary">View Schedule</a>
          <a href="#ashada-details" className="an-btn an-btn-ghost">View Event Details</a>
        </div>
      )
    },
    {
      bg: '/assets/img/banner/banner3.jpg',
      kicker: 'Support the Temple',
      title: 'Offer Seva & Donation to the Goddess',
      desc: "Your contribution supports annadanam, abhishekam materials, and the temple's daily sacred services.",
      meta: null,
      actions: (
        <div className="an-hero-actions">
          <a href="/payment" className="an-btn an-btn-primary">Donate Now</a>
        </div>
      )
    }
  ]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))

  return (
    <section className="an-hero" aria-label="Ashada Navarathiri highlights">
      <div className="an-hero-slider" style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {slides.map((slide, index) => (
          <article
            key={index}
            className={`an-hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              '--an-bg': `url('${slide.bg}')`,
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              position: index === currentSlide ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: index === currentSlide ? 1 : 0,
            }}
          >
            <div className="an-hero-overlay"></div>
            <div className="site-container an-hero-content">
              <span className="an-hero-kicker">{slide.kicker}</span>
              <h1>{slide.title}</h1>
              <p>{slide.desc}</p>
              {slide.meta}
              {slide.trustBadges}
              {slide.actions}
            </div>
          </article>
        ))}
      </div>
      <button className="an-hero-nav an-hero-prev" type="button" aria-label="Previous slide" onClick={prevSlide} style={{ zIndex: 10 }}>
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button className="an-hero-nav an-hero-next" type="button" aria-label="Next slide" onClick={nextSlide} style={{ zIndex: 10 }}>
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </section>
  )
}

const EventTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date("2026-07-14T12:30:00+05:30").getTime();
    
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
    <div className="an-hero-timer" aria-label="Event countdown">
      <div className="an-hero-timer-item">
        <span>{pad(timeLeft.days)}</span>
        <small>Days</small>
      </div>
      <div className="an-hero-timer-item">
        <span>{pad(timeLeft.hours)}</span>
        <small>Hours</small>
      </div>
      <div className="an-hero-timer-item">
        <span>{pad(timeLeft.mins)}</span>
        <small>Mins</small>
      </div>
      <div className="an-hero-timer-item">
        <span>{pad(timeLeft.secs)}</span>
        <small>Secs</small>
      </div>
    </div>
  );
};

export default Hero


