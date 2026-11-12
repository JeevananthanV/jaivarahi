import React from 'react';
import { Link } from 'react-router-dom';

const AboutCta = ({ ctaData }) => {
  return (
    <section className="about-cta" style={{ '--about-cta-bg-image': `url('${ctaData.bgImage}')` }} aria-label="About page call to action">
      <div className="about-cta__content">
        <h2>{ctaData.title}</h2>
        <p>{ctaData.description}</p>
        <div className="about-cta__actions">
          <Link to="/book-pooja" className="about-cta__btn">
            Book Pooja
          </Link>
          <Link to="/payment" className="about-cta__btn about-cta__btn--alt">
            Donate Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutCta;
