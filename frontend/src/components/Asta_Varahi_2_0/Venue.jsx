function Venue() {
  return (
    <section className="av-section av-venue" id="venue">
      <div className="av-wrapper">
        <div className="av-venue-grid">
          <div className="av-venue-info">
            <h2>Venue Location</h2>
            <h3>Jai Varahi Peedam</h3>
            <p style={{color :'grey'}}>
              Nestled in the spiritual town of Arumparuthi, our peedam provides the perfect serene
              atmosphere for this divine conclave.
            </p>
            <ul className="av-contact-list">
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <a href="https://maps.app.goo.gl/nJ6oWGDua12BUthn8" target="_blank" rel="noopener noreferrer">
                  Arumparuthi, Vellore, Tamil Nadu
                </a>
              </li>
              <li><i className="fas fa-phone-alt"></i> +91 90928 78389</li>
              <li><i className="fas fa-envelope"></i> varahikottai@gmail.com</li>
            </ul>
            <a href="https://maps.app.goo.gl/nJ6oWGDua12BUthn8" target="_blank" rel="noopener noreferrer" className="av-btn av-btn-outline">
              Get Directions
            </a>
          </div>
          <div className="av-map">
            <iframe
              src="https://www.google.com/maps?q=12.9663046,79.2061324&z=16&output=embed"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Jai Varahi Peedam Map"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Venue
