import React, { useEffect } from 'react';

const GuestScrolling = ({ guests }) => {
  // Multiply guests to create a seamless scrolling effect
  const displayGuests = [...guests, ...guests, ...guests];

  return (
    <section id="cg-scrolling">
      <div className="cg-showcase">
        <div className="cg-slider-track">
          {displayGuests.map((guest, index) => (
            <div className="cg-card" key={index}>
              <div className="cg-img-wrapper">
                <img src={guest.image} alt={guest.name} loading="lazy" />
              </div>
              <div className="cg-content">
                <span className="cg-tag">{guest.role}</span>
                <h3 className="cg-title">{guest.name}</h3>
                <p className="cg-desc">{guest.description}</p>
                <a href={guest.link} className="read-more" target="_blank" rel="noopener noreferrer">Read More</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuestScrolling;
