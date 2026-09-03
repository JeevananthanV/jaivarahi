import React from 'react';

const benefitsData = [
  {
    icon: 'fa-solid fa-shield-halved',
    title: 'Divine Protection',
    desc: 'Creates a powerful protection shield around the devotees to destroy harm, evil spirits, and negative energies.'
  },
  {
    icon: 'fa-solid fa-chart-line',
    title: 'Career & Business Success',
    desc: 'Aids in attaining success in business, securing career advancements, and winning over obstacles and competitors.'
  },
  {
    icon: 'fa-solid fa-users',
    title: 'Family Harmony',
    desc: 'Blesses individuals with happiness, mutual understanding, and positive energy during family reunions.'
  },
  {
    icon: 'fa-solid fa-hand-holding-heart',
    title: 'Eradication of Suffering',
    desc: 'Eradicates suffering, emotional pain, and overall negativity, bringing peace of mind.'
  },
  {
    icon: 'fa-solid fa-road-barrier',
    title: 'Overcoming Obstacles',
    desc: 'Assists devotees in breaking through and overcoming all kinds of physical, mental, and spiritual barriers in life.'
  },
  {
    icon: 'fa-solid fa-ring',
    title: 'Removal of Marriage Hurdles',
    desc: 'Removes marriage obstacles, helps find suitable life partners, and ensures successful joint endeavors.'
  },
  {
    icon: 'fa-solid fa-heart-pulse',
    title: 'Health & Healing',
    desc: 'Cures serious diseases, restores physical health, and promotes vitality and longevity.'
  },
  {
    icon: 'fa-solid fa-scale-balanced',
    title: 'Legal Victory',
    desc: 'Accomplishes ultimate victory and favorable outcomes in any ongoing court cases or legal disputes.'
  }
];

function HomamBenefits() {
  return (
    <section className="an-benefits-section" id="benefits">
      <div className="site-container">
        <div className="an-benefits-header">
          <span className="an-benefits-eyebrow">Divine Grace & Protection</span>
          <h2>Benefits of Varahi Homam</h2>
          <div className="an-benefits-divider"></div>
          <p>
            Invoking Goddess Sri Kottai Varahi Amman through sacred fire rituals brings profound spiritual, 
            material, and physical blessings to devotees and their families.
          </p>
        </div>

        <div className="an-benefits-grid">
          {benefitsData.map((benefit, index) => (
            <div key={index} className="an-benefit-card">
              <div className="an-benefit-icon-wrapper">
                <i className={benefit.icon}></i>
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomamBenefits;
