import React from 'react';

const AboutHero = ({ title, description }) => {
  return (
    <section 
      className="about-hero"
      aria-label="Page Introduction"
    >
      <div className="about-hero__content">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
};

export default AboutHero;
