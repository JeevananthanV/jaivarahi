import React from 'react';

const DharshanPromo = ({ promoData }) => {
  return (
    <section className="custom-promo" id="about">
      <div className="container">
        <div className="custom-promo-content">
          <div className="custom-promo-text">
            <h2>{promoData.title}</h2>
            <p>{promoData.description}</p>

            <div className="custom-promo-features">
              {promoData.features.map((feature, index) => (
                <div className="custom-promo-feature" key={index}>
                  <i className={`fas ${feature.icon}`}></i>
                  <div>
                    <h4>{feature.title}</h4>
                    <p>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="custom-promo-video">
            <iframe src={promoData.videoUrl} title="Promo Video" allowFullScreen></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DharshanPromo;
