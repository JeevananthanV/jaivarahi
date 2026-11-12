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
          <Link to="/book-pooja" className="site-cta__btn">
            Book Pooja
          </Link>
          <Link to="/payment" className="site-cta__btn site-cta__btn--alt">
            Donate Now
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DharshanCta;
