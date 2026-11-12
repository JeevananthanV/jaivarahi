import React from 'react';

const GALLERY_IMAGES = [
  {
    src: '/assets/img/god/go_seva_cow.png',
    title: 'Gomatha Pooja & Aradhana',
    desc: 'Sacred worship of cows with turmeric, flowers, and mantras.',
  },
  {
    src: '/assets/img/donation/5.jpg',
    title: 'Green Fodder Feeding',
    desc: 'Freshly harvested nutritious sorghum & maize grass.',
  },
  {
    src: '/assets/img/donation/6.jpg',
    title: 'Temple Gosala Shelter',
    desc: 'Spacious, well-ventilated, hygienic living quarters.',
  },
  {
    src: '/assets/img/donation/7.jpg',
    title: 'Caretaker Seva',
    desc: 'Dedicated daily care, grooming, and health monitoring.',
  },
];

const KosalaGallery = () => {
  return (
    <section className="kosala-gallery-section">
      <div className="site-container">
        <div className="section-header-centered">
          <span className="section-tag">கோசாலை காட்சிகள்</span>
          <h2 className="section-heading">Gosala Care &amp; Devotional Gallery</h2>
          <p className="section-desc">
            Moments of devotion and dedicated service at Sri Kottai Varahi Amman Temple Cow Sanctuary.
          </p>
        </div>

        <div className="kosala-gallery-grid">
          {GALLERY_IMAGES.map((img, idx) => (
            <div
              key={idx}
              className="stat-card gallery-card"
            >
              <div className="gallery-card-img-wrap">
                <img
                  src={img.src}
                  alt={img.title}
                  className="gallery-card-img"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/img/god/go_seva_cow.png';
                  }}
                />
              </div>
              <div className="gallery-card-body">
                <h4 className="gallery-card-title">
                  {img.title}
                </h4>
                <p className="gallery-card-desc">
                  {img.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KosalaGallery;

