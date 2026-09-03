import React from 'react';

const EventHighlights = ({ highlights }) => {
  return (
    <section className="av-event-highlights-section">
      <div className="av-section-head av-section-head--tight text-center">
        <p className="av-section-kicker">EVENT HIGHLIGHTS</p>
        <h2 className="av-section-title">Moments From The Dharshanam</h2>
      </div>
      <div className="event-gallery-grid">
        {highlights.map((highlight, index) => (
          <article className="event-gallery-card" key={index}>
            <div className="event-gallery-media">
              <img
                src={highlight.src}
                alt={highlight.caption}
                className="event-gallery-image"
                loading="lazy"
              />
              <div className="event-gallery-overlay">
                <p className="event-gallery-caption">{highlight.caption}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default EventHighlights;
