import React from 'react';

const SponsorSection = ({ sponsors }) => {
  return (
    <section className="sponsor-section">
      <div className="sponsor-track" id="sponsorTrack">
        {sponsors.map((sponsor, index) => (
          <div className="sponsor" key={index}>
            <img src={sponsor.image} alt={sponsor.name} loading="lazy" />
            <span className="sponsor-role">{sponsor.role || <br />}</span>
          </div>
        ))}
        {/* Dummy duplicates to easily support continuous CSS animation if needed */}
        {sponsors.map((sponsor, index) => (
          <div className="sponsor" key={`dup-${index}`}>
            <img src={sponsor.image} alt={sponsor.name} loading="lazy" />
            <span className="sponsor-role">{sponsor.role || <br />}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SponsorSection;
