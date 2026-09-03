import { useState } from 'react';
import SpecialRoyalForm from '../forms/SpecialRoyalForm.jsx';

function SpecialRoyal() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section id="special_Booking" className="an-special-royal">
      <div className="site-container an-special-royal__shell">
        <div className="an-special-royal__header">
          <p className="an-special-royal__eyebrow">Sarva Shakti Maha Yagna Seva</p>
          <h2>Divine One Day Pooja</h2>
          <p className="an-special-royal__lead">
            A sacred one-day divine offering to invoke the powerful grace of Sri Varahi Amman for
            protection, prosperity, and spiritual upliftment. Performed with devotion and Vedic rituals,
            this seva brings peace, abundance, and divine shielding to your family.
          </p>
        </div>
        <div className="an-special-royal__content">
          <div className="an-special-royal__card">
            <div className="an-special-royal__price">
              <span className="an-special-royal__price-label">Sri Varahi Divya Aradhana</span>
              <span className="an-special-royal__price-value">Rs. 21,000</span>
            </div>
            <ul className="an-special-royal__list">
              <li>Go Seva & Goshala Annadhanam (service to sacred cows)</li>
              <li>Sri Varahi Homam for protection and success</li>
              <li>Annadhanam - offering food with divine blessings</li>
              <li>Complete Prasadam Kit energized with sacred rituals</li>
              <li>Silver Varahi Shakti Dollar for spiritual protection</li>
            </ul>
            <div className="an-special-royal__actions">
              <button type="button" className="an-btn an-btn-primary" onClick={() => setShowForm((current) => !current)}>
                Book Sarva Shakti Seva
              </button>
              <a
                href="https://wa.me/919092878389?text=Hello%20I%20would%20like%20to%20know%20more%20about%20the%20Sri%20Varahi%20Divya%20Aradhana"
                target="_blank"
                rel="noopener noreferrer"
                className="an-btn site-cta__btn"
                aria-label="Contact us on WhatsApp to learn more about Sri Varahi Divya Aradhana"
              >
                Seek Varahi Arul
              </a>
            </div>
          </div>
          <div className="an-special-royal__visual">
            <div className="an-special-royal__image" role="img" aria-label="Divine yagna ceremony"></div>
            <div className="an-special-royal__badge">Sarva Shakti Seva</div>
            <div className="an-special-royal__spark an-special-royal__spark--one"></div>
            <div className="an-special-royal__spark an-special-royal__spark--two"></div>
          </div>
        </div>
        {showForm && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.65)',
            }}
            onClick={() => setShowForm(false)}
            role="presentation"
          >
            <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(100%, 980px)', maxHeight: '92vh', overflow: 'auto' }}>
              <SpecialRoyalForm eventTitle="Sri Varahi Divya Aradhana" onClose={() => setShowForm(false)} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default SpecialRoyal;
