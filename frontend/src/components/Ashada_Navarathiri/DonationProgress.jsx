function DonationProgress() {
  return (
    <section className="donation-section donation-section--progress">
      <div className="animated-color-overlay-container">
        <div className="animated-color-overlay"></div>
      </div>
      <div className="site-container donation-section__grid">
        <div className="donation-image">
          <img src="/assets/img/varahi_blue_print.jpg" alt="Temple Construction" />
          <div className="donation-badge">Temple Renovation</div>
        </div>
        <div className="donation-content">
          <p className="donation-kicker">Surrender to the Divine Karya</p>
          <h2>Manifest the Sacred Abode of Sri Varahi</h2>
          <p>
            Become a chosen instrument in the divine sankalpam of Sri Kottai Varahi Amman. Your
            samarpanam at her lotus feet awakens her fierce shakti, establishing a divya kshetram of
            protection, abundance, and eternal divine presence.
          </p>

          <div className="donation-progress">
            <div className="donation-progress__meta">
              <span>Divya Udayam (Sacred Progress)</span>
              <strong>45%</strong>
            </div>
            <div className="donation-progress__bar">
              <span></span>
            </div>
            <div className="donation-progress__note">
              With every offering, this divine karya unfolds toward its destined manifestation.
            </div>
          </div>

          <div className="donation-options"></div>

          <button
            onClick={() => {
              window.location.href = '/payment'
            }}
            className="donate-btn"
          >
            Contribute Now
          </button>
        </div>
      </div>
    </section>
  )
}

export default DonationProgress

