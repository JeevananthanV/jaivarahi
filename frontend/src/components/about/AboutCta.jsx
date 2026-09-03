import React from 'react';
import { Link } from 'react-router-dom';

const AboutCta = ({ ctaData }) => {
  return (
    <section className="about-cta" style={{ '--about-cta-bg-image': `url('${ctaData.bgImage}')` }} aria-label="About page call to action">
      <div className="about-cta__content">
        <h2>{ctaData.title}</h2>
        <p>{ctaData.description}</p>
        <div className="about-cta__actions">
          <Link to={ctaData.primaryButton.link} className="about-cta__btn">
            {ctaData.primaryButton.text}
          </Link>
          <Link to={ctaData.secondaryButton.link} className="about-cta__btn about-cta__btn--alt">
            {ctaData.secondaryButton.text}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutCta;
