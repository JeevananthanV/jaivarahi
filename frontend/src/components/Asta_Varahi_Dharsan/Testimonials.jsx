import React from 'react';

const Testimonials = ({ testimonials }) => {
  return (
    <section id="container" className="pb-4 av-testimonials-section">
      <div className="container">
        <div className="av-section-head text-center">
          <p className="av-section-kicker">WHAT PEOPLE SAY</p>
          <h2 className="av-section-title">Voices From The Community</h2>
          <p className="av-section-subtitle">Stories of grace, service, and shared devotion.</p>
        </div>
        <div className="row mb-5 av-testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div className="col-lg-4 col-md-6 mb-4" key={index}>
            <div className="testimonial-card av-testimonial-card">
              <div className="testimonial-content av-testimonial-content">
                <p>"{testimonial.text}"</p>
              </div>
              <div className="testimonial-author av-testimonial-author">
                <div className="author-avatar">
                  <img
                    src={testimonial.image}
                    alt={testimonial.role}
                    className="rounded-circle"
                    width="60"
                    height="60"
                    loading="lazy"
                  />
                </div>
                <div className="author-info av-author-info">
                  <h4>{testimonial.author}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
