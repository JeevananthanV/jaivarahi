import React from 'react';

function Annadhanam() {
  const handleDonateClick = () => {
    window.location.href = '/payment';
  };

  return (
    <section className="an-section an-annadhanam" id="annadhanam">
      <div className="an-wrapper">
        <div className="an-annadhanam-grid">
          
          {/* Left Column: Content */}
          <div className="an-annadhanam-info">
            <span className="an-annadhanam-eyebrow">Nithya Maha Annadhanam Seva</span>
            <h2>Sponsor Annadhanam</h2>
            <h3>Serving Daily at 12:30 PM</h3>
            <div className="an-annadhanam-divider"></div>
            
            <p className="an-annadhanam-lead">
              Feed more than Hundreds of Devotees daily during the auspicious Ashada Navarathiri festival. 
              Serving food to visiting devotees is considered the highest form of charity (Dharma) in our tradition.
            </p>
            
            <p>
              By sponsoring Annadhanam, you directly participate in the temple's daily service, 
              earning the divine grace of Goddess Sri Kottai Varahi Amman. 
              Your contribution helps us provide clean, pure, and wholesome vegetarian meals (Prasadam) 
              to pilgrims traveling from far and wide.
            </p>

            <div className="an-annadhanam-stats">
              <div className="an-annadhanam-stat-item">
                <i className="fa-solid fa-bowl-rice"></i>
                <div>
                  <strong>Hundreds Fed Daily</strong>
                  <span>Wholesome hot meals served to all visitors.</span>
                </div>
              </div>
              <div className="an-annadhanam-stat-item">
                <i className="fa-solid fa-clock"></i>
                <div>
                  <strong>Daily 12:30 PM</strong>
                  <span>Serving starts promptly after noon poojas.</span>
                </div>
              </div>
            </div>

            <button 
              type="button" 
              className="an-btn an-btn-primary an-annadhanam-btn"
              onClick={handleDonateClick}
            >
              <i className="fa-solid fa-heart"></i> Sponsor Annadhanam Seva
            </button>
          </div>

          {/* Right Column: Images */}
          <div className="an-annadhanam-media">
            <div className="an-annadhanam-image-card card-primary">
               <img 
                src="/assets/img/gallery/annadhanam_hall.png" 
                alt="Devotees being served Annadhanam at the Temple Hall" 
                loading="lazy" 
              />
              <div className="an-annadhanam-image-badge">Devotees Dining </div>
            </div>
            <div className="an-annadhanam-image-card card-secondary">
             
              <img 
                src="/assets/img/gallery/annadhanam_food.png" 
                alt="Traditional South Indian Temple Prasadam served on Banana Leaf" 
                loading="lazy" 
              />
              <div className="an-annadhanam-image-badge">Sacred Prasadam</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Annadhanam;
