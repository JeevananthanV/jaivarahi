import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx'
import { submitServiceBooking } from '../../api/serviceBookingAPI.js'
import { validateFields, hasErrors } from '../../utils/formValidation';

const Services = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: '',
    date: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    {
      label: 'Ubasana',
      href: '#',
      children: [
        { label: 'Varahi Malai', href: '/varahimalai' },
        { label: 'Who is varahi ?', href: '/who_is_varahi' },
        { label: 'Uchchishta Ganapati', href: '/Uchchishta_Ganapati' },
        { label: 'Sri Bala manthiram', href: '/sri_bala_manthiram' },
      ],
    },
    {
      label: 'Kosala',
      href: '#',
      children: [
        { label: 'Donation', href: '/payment' },
        { label: 'Donation Archive', href: '/payment' },
      ],
    },
    {
      label: 'Jothidam',
      href: '#',
      children: [
        { label: 'Astrology prediction', href: '/Jothidam' },
        { label: 'Sri Varahi Jothida Vidyalayam', href: '/comingsoon' },
      ],
    },
    {
      label: 'Events',
      href: '#',
      children: [
        { label: 'Asta Varahi Dharshanam', href: '/astavarahi' },
        { label: 'Asta Varahi 2.0', href: '/astavarahi2' },
        { label: 'Ashada Navarathiri', href: '/ashada_navarathiri' },
      ],
    },
    { label: 'Blog', href: '/blog' },
    { label: 'Latest Updates', href: '/comingsoon' },
  ];

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    setActiveMobileDropdown(null);
  };

  const toggleMobileDropdown = (label) => {
    setActiveMobileDropdown((current) => (current === label ? null : label));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitMessage.text) setSubmitMessage({ type: '', text: '' });
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: '', text: '' });

    const errors = validateFields(formData, {
      name: [{ rule: 'required', message: 'Name is required' }],
      phone: [{ rule: 'required', message: 'Phone number is required' },
              { rule: 'phone', message: 'Please enter a valid 10-digit phone number' }],
      service: [{ rule: 'required', message: 'Please select a service' }],
    });
    setFieldErrors(errors);
    if (hasErrors(errors)) {
      setSubmitMessage({ type: 'error', text: 'Please fix the errors below.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitServiceBooking({
        full_name: formData.name.trim(),
        phone: formData.phone.trim(),
        service_type: formData.service,
        preferred_date: formData.date || null,
        additional_details: formData.message.trim() || null,
      });

      if (response.success) {
        setSubmitMessage({ type: 'success', text: response.message || 'Booking submitted successfully!' });
        setFormData({ name: '', phone: '', service: '', date: '', message: '' });
      } else {
        setSubmitMessage({ type: 'error', text: response.message || 'Failed to submit booking.' });
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Temple Services | Jai Varahi Peedam</title>
        <meta
          name="description"
          content="Book sacred temple services, poojas, homams, go seva support, and special event rituals at Jai Varahi Peedam."
        />
      </Helmet>

      <Preloader />
      <Navbar items={navItems} onOpenMobile={() => setIsMobileOpen(true)} isMobileOpen={isMobileOpen} />
      <MobileNav
        items={navItems}
        isOpen={isMobileOpen}
        activeDropdown={activeMobileDropdown}
        onClose={closeMobileMenu}
        onToggleDropdown={toggleMobileDropdown}
      />

      <div
        className={`mobile-nav-overlay${isMobileOpen ? ' active' : ''}`}
        onClick={closeMobileMenu}
        role="presentation"
      />

      <main className="svc-page">
        <ServiceHero />
        <ServiceFeature />
        <ServiceCards />
        <ServiceBookingForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitMessage={submitMessage}
          fieldErrors={fieldErrors}
        />
        <ServiceGoSeva />
        <ServiceTestimonials />
        <ServiceFinalCta />
      </main>

      <FloatActions />
      <Footer />
    </>
  );
};

const whatsappBase = 'https://wa.me/919092878389?text=';

const makeWhatsAppLink = (text) => `${whatsappBase}${encodeURIComponent(text)}`;

const ServiceHero = () => (
  <section className="svc-hero svc-section">
    <div className="svc-container">
      <h1>Sacred Temple Services and Divine Offerings</h1>
      <p>Experience spiritual blessings through traditional poojas and rituals</p>
      <div className="svc-hero-actions">
        <a href="#svc-booking" className="svc-btn svc-btn-primary">
          <i className="fa-solid fa-bell" aria-hidden="true"></i> Book a Pooja
        </a>
        <a href="#svc-services" className="svc-btn svc-btn-outline">
          <i className="fa-solid fa-gem" aria-hidden="true"></i> Explore Services
        </a>
      </div>
    </div>
  </section>
);

const ServiceFeature = () => (
  <section className="svc-feature">
    <div className="svc-container svc-feature-wrap">
      <div>
        <h2 className="svc-feature-title">Divine Abishekam Offerings</h2>
        <p className="svc-feature-copy">
          Experience sacred Abishekam rituals performed with devotion, traditional mantras, and pure offerings.
        </p>
        <p className="svc-feature-copy">
          Each pooja is carefully arranged by our temple team, ensuring an auspicious and peaceful atmosphere.
        </p>
        <p className="svc-feature-copy">
          Book in advance to receive blessings for health, prosperity, and family well-being.
        </p>
        <div className="svc-feature-actions">
          <a
            href={makeWhatsAppLink('Hi, I would like to book a Pooja')}
            className="svc-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Book the Pooja
          </a>
        </div>
      </div>
      <div>
        <img className="svc-feature-image" src="/assets/img/god/Sri Bala.png" alt="Temple pooja offering" width="500" height="600" loading="lazy" decoding="async" />
      </div>
    </div>
  </section>
);

const ServiceCards = () => {
  const sections = [
    {
      id: 'svc-services',
      title: 'Abishekam Services',
      items: [
        { title: 'Nithya Abishekam', image: '/assets/img/god/Sri Bala.png' },
        { title: 'Sahasra Abishekam', image: '/assets/img/god/Sri Bala.png' },
        { title: 'Turmeric Abishekam', image: '/assets/img/god/Sri Bala.png' },
        { title: 'Ghee Abishekam', image: '/assets/img/god/Sri Bala.png' },
        { title: 'Honey Abishekam', image: '/assets/img/god/Sri Bala.png' },
        { title: 'Milk Abishekam', image: '/assets/img/god/Sri Bala.png' },
      ],
    },
    {
      title: 'Archana Services',
      items: [
        { title: 'Varahi Sahasranamam', image: '/assets/img/god/varahi.png' },
        { title: 'Varahi Ashtothram', image: '/assets/img/god/varahi.png' },
        { title: 'Katkamala', image: '/assets/img/god/varahi.png' },
        { title: 'Mahalakshmi Ashtothram', image: '/assets/img/god/lakshmi.png' },
      ],
    },
    {
      title: 'Homam Rituals',
      items: [
        { title: 'Panchami Homam', image: '/assets/img/god/homam.png' },
        { title: 'Pournami Homam', image: '/assets/img/god/homam.png' },
        { title: 'Ashtami Homam', image: '/assets/img/god/homam.png' },
        { title: 'Amavasai Homam', image: '/assets/img/god/homam.png' },
      ],
    },
    {
      title: 'Special Occasions',
      items: [
        { title: 'Navaratri Festival', subtitle: 'Aashada and Sharadha', image: '/assets/img/god/festival.png' },
        { title: 'Varushabishekam', subtitle: 'Sandi Homam', image: '/assets/img/god/festival.png' },
      ],
    },
    {
      title: 'Special Pooja',
      items: [
        { title: 'Birthday Pooja', image: '/assets/img/god/special.png' },
        { title: 'Wedding Day Pooja', image: '/assets/img/god/special.png' },
        { title: 'Shashtiabdhapoorthi', subtitle: '60th Wedding Anniversary', image: '/assets/img/god/special.png' },
      ],
    },
    {
      title: 'Gomatha Pooja Services',
      items: [
        { title: 'Cow Donation', image: '/assets/img/god/cow.png', actionText: 'enquire about Cow Donation' },
        { title: 'Cow Maintenance', image: '/assets/img/god/cow.png', actionText: 'enquire about Cow Maintenance' },
        { title: 'Cow Adoption', image: '/assets/img/god/cow.png', actionText: 'enquire about Cow Adoption' },
        { title: 'Cow Pooja', subtitle: 'Nandhini Pooja', image: '/assets/img/god/cow.png' },
      ],
    },
  ];

  return sections.map((section) => (
    <section key={section.title} className="site-container" id={section.id || undefined}>
      <h2 className="section-title">{section.title}</h2>
      <div className="card-grid">
        {section.items.map((item) => {
          const message = item.actionText
            ? `Hi, I would like to ${item.actionText}`
            : `Hi, I would like to book ${item.title}`;
          const whatsappLink = makeWhatsAppLink(message);

          return (
            <article key={item.title} className="puja-card">
              <img src={item.image} alt={item.title} width="350" height="250" loading="lazy" decoding="async" />
              <a className="card-badge" href={whatsappLink} target="_blank" rel="noopener noreferrer">
                Book via WhatsApp
              </a>
              <div className="card-overlay" aria-hidden="true"></div>
              <div className="card-content">
                <h3 className="card-title">{item.title}</h3>
                {item.subtitle && <p className="card-subtitle">{item.subtitle}</p>}
                <div className="card-cta">
                  <a className="book-btn" href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    Book Now
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  ));
};

const ServiceBookingForm = ({ formData, handleInputChange, handleSubmit, isSubmitting, submitMessage, fieldErrors = {} }) => (
  <section className="svc-section" id="svc-booking">
    <div className="svc-container svc-form-wrap">
      <h2 className="svc-title">Book a Temple Service</h2>
      <p className="svc-subtitle">
        Share your preferred service and date. Our temple team will confirm the details with you.
      </p>
      <div className="svc-event-types">
        <span className="svc-chip">Abishekam</span>
        <span className="svc-chip">Homam</span>
        <span className="svc-chip">Archana</span>
        <span className="svc-chip">Special Pooja</span>
      </div>
      <form className="svc-form-grid" onSubmit={handleSubmit} noValidate>
        <div className="svc-form-group">
          <label htmlFor="svc-name">Full Name</label>
          <input
            id="svc-name"
            name="name"
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={handleInputChange}
            required
            autoComplete="name"
          />
          {fieldErrors.name && <div style={{ color: '#ff453b', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.name}</div>}
        </div>
        <div className="svc-form-group">
          <label htmlFor="svc-phone">Phone Number</label>
          <input
            id="svc-phone"
            name="phone"
            type="tel"
            placeholder="Your number"
            value={formData.phone}
            onChange={handleInputChange}
            required
            autoComplete="tel"
            inputMode="tel"
          />
          {fieldErrors.phone && <div style={{ color: '#ff453b', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.phone}</div>}
        </div>
        <div className="svc-form-group">
          <label htmlFor="svc-service">Service Type</label>
          <select
            id="svc-service"
            name="service"
            value={formData.service}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a service</option>
            <option value="Abishekam">Abishekam</option>
            <option value="Archana">Archana</option>
            <option value="Homam">Homam</option>
            <option value="Special Pooja">Special Pooja</option>
            <option value="Go Seva">Go Seva</option>
          </select>
          {fieldErrors.service && <div style={{ color: '#ff453b', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.service}</div>}
        </div>
        <div className="svc-form-group">
          <label htmlFor="svc-date">Preferred Date</label>
          <input
            id="svc-date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleInputChange}
          />
        </div>
        <div className="svc-form-group svc-full">
          <label htmlFor="svc-message">Additional Details</label>
          <input
            id="svc-message"
            name="message"
            type="text"
            placeholder="Special request or note"
            value={formData.message}
            onChange={handleInputChange}
          />
        </div>
        <div className="svc-form-group svc-full">
          <button className="svc-btn svc-btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Booking'}
          </button>
        </div>
      </form>
      {submitMessage.text && (
        <div
          className={`svc-form-message ${submitMessage.type === 'success' ? 'success' : 'error'}`}
          role="alert"
        >
          {submitMessage.text}
        </div>
      )}
    </div>
  </section>
);

const ServiceGoSeva = () => (
  <section className="svc-section svc-go-seva" id="svc-go-seva">
    <div className="svc-container">
      <h2 className="svc-title">Sacred Go Seva and Donation</h2>
      <p className="svc-subtitle">Support temple cows through adoption, donation, and maintenance offerings.</p>
      <div className="svc-go-grid">
        <article className="svc-go-card">
          <h3>Adoption</h3>
          <p>Sponsor a cow and receive regular seva updates and special temple prayers in your family name.</p>
        </article>
        <article className="svc-go-card">
          <h3>Donation</h3>
          <p>Contribute toward fodder, shelter upgrades, and daily welfare of goshalas maintained by the trust.</p>
        </article>
        <article className="svc-go-card">
          <h3>Maintenance</h3>
          <p>Offer monthly support for veterinary care, nutrition, and continued sacred Go Pooja services.</p>
        </article>
      </div>
      <p className="svc-go-action">
        <a href="#svc-booking" className="svc-btn svc-btn-primary">Support Go Seva</a>
      </p>
    </div>
  </section>
);

const ServiceTestimonials = () => {
  const testimonials = [
    {
      quote: '"The birthday pooja was beautifully arranged. Our whole family felt peaceful and blessed throughout the day."',
      name: '- S. Karthik, Vellore',
    },
    {
      quote: '"We booked Pournami homam and saw a clear positive change in our home atmosphere and focus."',
      name: '- Meena R., Katpadi',
    },
    {
      quote: '"Go seva adoption updates are transparent and sincere. Happy to support such a dharmic initiative."',
      name: '- Raghavan Family',
    },
  ];

  const [index, setIndex] = useState(0);
  const total = testimonials.length;

  const prev = () => setIndex((current) => (current - 1 + total) % total);
  const next = () => setIndex((current) => (current + 1) % total);

  return (
    <section className="svc-section svc-testimonials" id="svc-testimonials">
      <div className="svc-container">
        <h2 className="svc-title">Devotee Testimonials</h2>
        <p className="svc-subtitle">Experiences shared by devotees after participating in temple services.</p>
        <div className="svc-testimonial-slider" aria-live="polite">
          <div className="svc-testimonial-track" style={{ transform: `translateX(${index * -100}%)` }}>
            {testimonials.map((item) => (
              <article key={item.name} className="svc-testimonial-card">
                <p className="svc-testimonial-quote">{item.quote}</p>
                <p className="svc-testimonial-name">{item.name}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="svc-testimonial-nav">
          <button className="svc-testimonial-btn" onClick={prev} aria-label="Previous testimonial">
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          </button>
          <button className="svc-testimonial-btn" onClick={next} aria-label="Next testimonial">
            <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </section>
  );
};

const ServiceFinalCta = () => (
  <section className="svc-section svc-final-cta">
    <div className="svc-container">
      <h2 className="svc-title">Receive Divine Blessings Today</h2>
      <div className="svc-final-actions">
        <a href="#svc-booking" className="svc-btn svc-btn-primary">
          <i className="fa-solid fa-gem" aria-hidden="true"></i> Book a Ritual
        </a>
        <a href="tel:+919092878389" className="svc-btn svc-btn-outline">
          <i className="fa-solid fa-hands-praying" aria-hidden="true"></i> Contact Temple
        </a>
      </div>
    </div>
  </section>
);

export default Services;
