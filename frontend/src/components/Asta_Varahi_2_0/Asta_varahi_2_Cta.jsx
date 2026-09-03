function Cta() {
  return (
    <section
      className="site-cta site-cta--ashada-navarathiri"
      style={{ '--cta-bg-image': "url('/assets/img/puja/style-2/2.jpg')" }}
      aria-label="Ashada Navarathiri call to action"
    >
      <div className="site-cta__content">
        <h2>Celebrate Asta varahi Together</h2>
        <p>
          our shield of strength is waiting at Jai Varahi Peedam.
        </p>
        <div className="site-cta__actions">
          <a href="#tickets" className="site-cta__btn">
            Book Now
          </a>
          <a href="#schedule" className="site-cta__btn site-cta__btn--alt">
            View Schedule
          </a>
        </div>
      </div>
    </section>
  )
}

export default Cta
