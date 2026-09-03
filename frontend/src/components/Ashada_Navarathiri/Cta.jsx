function Cta() {
  return (
    <section
      className="site-cta site-cta--ashada-navarathiri"
      style={{ '--cta-bg-image': "url('/assets/img/puja/style-2/2.jpg')" }}
      aria-label="Ashada Navarathiri call to action"
    >
      <div className="site-cta__content">
        <h2>Celebrate Ashada Navarathiri Together</h2>
        <p>
          Join eleven nights of sacred rituals, homams, and devotional offerings at Jai Varahi Peedam.
        </p>
        <div className="site-cta__actions">
          <a href="#booking" className="site-cta__btn">
            Book Now
          </a>
          <a href="#ashada-schedule" className="site-cta__btn site-cta__btn--alt">
            View Schedule
          </a>
        </div>
      </div>
    </section>
  )
}

export default Cta
