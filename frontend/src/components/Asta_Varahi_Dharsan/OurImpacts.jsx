import React, { useEffect, useRef } from 'react';
import EventHighlights from './EventHighlights.jsx';

const OurImpacts = ({ impactsData }) => {
  const statsRef = useRef(null);

  useEffect(() => {
    // A simple Intersection Observer to animate counters
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.stat-counter');
          counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            // Simplified animation for React
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                counter.innerText = target + "+";
                clearInterval(timer);
              } else {
                counter.innerText = Math.ceil(current);
              }
            }, 30);
          });
          observer.disconnect();
        }
      });
    });

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="our-impacts" className="av-impact-section">
      <div className="container" ref={statsRef}>
        {/* Impact Statistics */}
        <div className="av-section-head">
          <p className="av-section-kicker">OUR IMPACTS IN NUMBERS</p>
          <h2 className="av-section-title">Our Impacts</h2>
          <p className="av-section-subtitle">A snapshot of the service and blessings shared with the community.</p>
        </div>
        <div className="stats-container av-impact-stats stats-grid">
          {impactsData.stats.map((stat, index) => (
            <div className="stat-card av-stat-card" key={index}>
              <div className="stat-icon av-stat-icon">
                <i className="icon">{stat.icon}</i>
              </div>
              <div className="stat-counter" data-target={stat.target}>0</div>
              <div className="stat-title av-stat-title">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* What We Planned vs Achieved */}
        <div className="av-section-head av-section-head--tight">
          <p className="av-section-kicker">OUR IMPACTS</p>
          <h2 className="av-section-title">Planned vs Achieved</h2>
        </div>
        <div>
          
        </div>
        <div className="av-comparison-grid mb-5">
          <div className="impact-card av-impact-card h-100">
            <div className="impact-card-header av-impact-card-header">
              <h2 className="text-center">What We Planned</h2>
            </div>
            <div className="impact-card-body av-impact-card-body">
              <ul className="impact-list av-impact-list">
                {impactsData.planned.map((item, index) => (
                  <li key={index}>
                    <i className={`fa-solid ${item.icon}`}></i> {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="impact-card av-impact-card h-100">
            <div className="impact-card-header av-impact-card-header av-impact-card-header--success">
              <h2 className="text-center">What We Achieved</h2>
            </div>
            <div className="impact-card-body av-impact-card-body">
              <ul className="impact-list av-impact-list av-impact-list--success">
                {impactsData.achieved.map((item, index) => (
                  <li key={index}>
                    <i className={`fa-solid ${item.icon}`}></i> {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Event Highlights */}
        <EventHighlights highlights={impactsData.highlights} />
      </div>
    </section>
  );
};

export default OurImpacts;
