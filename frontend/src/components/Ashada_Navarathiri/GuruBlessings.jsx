import React from 'react';

function GuruBlessings() {
  return (
    <section className="an-section an-guru-blessings" id="guru-blessings">
      <div className="an-wrapper">
        <div className="an-guru-grid">
          
          {/* Left Column: Image */}
          <div className="an-guru-media">
            <div className="an-guru-image-frame">
              <img 
                src="/assets/img/images_new/guruji.jpg" 
                alt="Swamy Pallur Varahidhasan, Founder of Jai Varahi Peedam" 
                loading="lazy" 
              />
              <div className="an-guru-frame-border"></div>
              <div className="an-guru-glow"></div>
            </div>
            <div className="an-guru-title-card">
              <h3>Swamy Pallur Varahidhasan</h3>
              <span>Founder & Spiritual Guide</span>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="an-guru-content">
            <span className="an-guru-eyebrow">Divine Guidance</span>
            <h2>Guru's Blessings & Vision</h2>
            <div className="an-guru-divider"></div>
            
            <div className="an-guru-intro">
              <p>
                Under the spiritual guidance of <strong>Swamy Pallur Varahidhasan</strong>, Jai Varahi Peedam 
                stands as a beacon of devotion and cosmic protection. Dedicated to the deep spiritual upasana 
                of Goddess Sri Kottai Varahi Amman, Guruji has spent decades guiding devotees, removing their 
                worldly hurdles, and leading them on the path of dharma and spiritual awakening.
              </p>
            </div>

            {/* <div className="an-guru-message-box">
              <i className="fa-solid fa-quote-left quote-icon"></i>
              <blockquote>
                "During this highly auspicious Ashada Navarathiri, the protective energies of Goddess Varahi Amman 
                are at their highest peak. I bless all devotees to participate in these eleven days of powerful homams. 
                May Her divine shield protect your family, dispel negativity, and bring success, health, and infinite 
                positivity into your life."
              </blockquote>
              <span className="quote-author">— Swamy Pallur Varahidhasan</span>
            </div> */}

            <div className="an-guru-mission">
              <h4>Guruji's Sacred Mission</h4>
              <ul className="an-guru-mission-list">
                <li>
                  <i className="fa-solid fa-om"></i>
                  <div>
                    <strong>Vedic Revival</strong>
                    <span>Preserving and practicing traditional Vedic temple rituals and homams.</span>
                  </div>
                </li>
                <li>
                  <i className="fa-solid fa-hand-holding-heart"></i>
                  <div>
                    <strong>Humanitarian Service</strong>
                    <span>Feeding hundreds daily through Nithya Annadhanam and caring for cows through Goshala Seva.</span>
                  </div>
                </li>
                <li>
                  <i className="fa-solid fa-compass"></i>
                  <div>
                    <strong>Spiritual Remediation</strong>
                    <span>Providing astrology (Jothidam) guidance and planetary remedies to alleviate human suffering.</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default GuruBlessings;
