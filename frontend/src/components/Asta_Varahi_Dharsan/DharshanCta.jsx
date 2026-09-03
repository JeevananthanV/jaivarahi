import React from 'react';
import { Link } from 'react-router-dom';

const DharshanCta = ({ ctaData }) => {
  return (
    <section 
      className="site-cta site-cta--asta-varahi-dharsan" 
      style={{ '--cta-bg-image': `url('${ctaData.bgImage}')` }} 
      aria-label="Asta Varahi Dharshanam call to action"
    >
      <div className="site-cta__content">
        <h2>{ctaData.title}</h2>
        <p>{ctaData.description}</p>
        <div className="site-cta__actions">
          <Link to={ctaData.primaryButton.link} className="site-cta__btn">
            {ctaData.primaryButton.text}
          </Link>
          <Link to={ctaData.secondaryButton.link} className="site-cta__btn site-cta__btn--alt">
            {ctaData.secondaryButton.text}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DharshanCta;
