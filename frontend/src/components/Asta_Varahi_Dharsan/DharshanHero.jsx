import React from 'react';

const DharshanHero = ({ heroData }) => {
  return (
    <section className="custom-hero" id="home">
      <div className="container">
        <div className="custom-hero-content">
          <h1>{heroData.title}</h1>
          <p>{heroData.description}</p>
          
          <div className="custom-hero-dates">
            {heroData.dates.map((date, index) => (
              <div className="custom-date-item" key={index}>
                <h3>{date.highlight}</h3>
                <p>{date.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DharshanHero;
