import React from 'react';

const TempleGallery = ({ images, ariaLabel }) => {
  return (
    <div className="about-gallery" aria-label={ariaLabel}>
      {images.map((img, index) => (
        <figure className="about-gallery__item" key={index}>
          <img src={img.src} alt={img.alt} loading="lazy" />
        </figure>
      ))}
    </div>
  );
};

export default TempleGallery;
