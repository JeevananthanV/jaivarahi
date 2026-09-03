function IndexCta() {
  return (
    <section
      className="site-cta site-cta--index"
      style={{ '--cta-bg-image': "url('/assets/img/images_new/banner1.avif')" }}
      aria-label="Index page call to action"
    >
      <div className="site-cta__content">
        <h2>Begin Your Varahi Seva Today</h2>
        <p>Book pooja services, follow temple schedules, and support sacred rituals at Jai Varahi Peedam.</p>
        <div className="site-cta__actions">
          <a href="/devoteesdetails" className="site-cta__btn">
            Register Devotee Details
          </a>
          <a href="/calendar" className="site-cta__btn site-cta__btn--alt">
            View Calendar
          </a>
        </div>
      </div>
    </section>
  )
}

export default IndexCta


