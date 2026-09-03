import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/common/seo.jsx'
import Preloader from '../components/common/Preloader.jsx'
import Navbar from '../components/common/Navbar.jsx'
import MobileNav from '../components/common/MobileNav.jsx'
import FloatActions from '../components/common/FloatActions.jsx'
import Footer from '../components/common/Footer.jsx'

function TermsCondition() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null)

  const navItems = useMemo(
    () => [
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
          { label: 'Devotee Registration', href: '/devoteesdetails' },
        ],
      },
      {
        label: 'Services',
        href: '#',
        children: [
          { label: 'Temple Services & Homam', href: '/services' },
          { label: 'Book Pooja', href: '/book-pooja' },
          { label: 'Astrology prediction', href: '/Jothidam' },
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
    ],
    [],
  )

  const closeMobileMenu = () => {
    setIsMobileOpen(false)
    setActiveMobileDropdown(null)
  }

  const toggleMobileDropdown = (label) => {
    setActiveMobileDropdown((current) => (current === label ? null : label))
  }

  return (
    <>
      <Seo
        title="Terms & Conditions - Sri Kottai Varahi Temple / Jaivarahi Peedum Charitable Trust"
        description="Comprehensive Terms of Service, Pooja Booking, Donation, Prasadham Dispatch, and Refund Policies of jaiVarahi Peedam"
      />


      <Preloader autoHide />
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

      <main className="terms-page" id="main-content">
        <div className="hero-section">
          <h1>Terms & Conditions</h1>
          <p>Official Statutory Terms of Service, Devotee Governance & Temple Offerings Policy</p>
        </div>

        <div className="terms-container">
          <div className="terms-content">
            <span className="last-updated">
              📅 Last Updated & Enacted: August 2026
            </span>

            {/* Trust Badges */}
            <div className="trust-badge-bar">
              <div className="trust-badge-item">
                <span className="trust-badge-icon">🏛️</span>
                <span>Registered Charitable Trust</span>
              </div>
              <div className="trust-badge-item">
                <span className="trust-badge-icon">🔒</span>
                <span>256-Bit SSL Razorpay Gateway</span>
              </div>
              <div className="trust-badge-item">
                <span className="trust-badge-icon">📜</span>
                <span>80G Income Tax Exemption Compliant</span>
              </div>
              <div className="trust-badge-item">
                <span className="trust-badge-icon">🪔</span>
                <span>Authentic Vedic Sanatana Dharma Seva</span>
              </div>
            </div>

            {/* Section 1: Preamble */}
            <p className="terms-intro">
              For the purpose of these Terms and Conditions, the terms <strong>"Trust"</strong>, <strong>"Peedam"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, and <strong>"our"</strong> used anywhere on this website refer to{' '}
              <span className="highlight">JAI VARAHI PEEDAM / SRI KOTTAI VARAHI TEMPLE</span>, having its temple sanctum and registered administrative office at: <em>Sri Kottai Varahi Amman Temple Street, Arumparuthi, Katpadi, Vellore, Tamil Nadu – 632106, India</em>. 
              The terms <strong>"You"</strong>, <strong>"Your"</strong>, <strong>"Devotee"</strong>, <strong>"User"</strong>, or <strong>"Donor"</strong> shall mean any natural or legal person visiting our website (<a href="https://www.jaivarahi.org">www.jaivarahi.org</a>), accessing temple media, participating in Sankalpam registrations, booking poojas/homams, or contributing donations.
            </p>

            <h2>1. Acceptance of Terms & Website Access</h2>
            <ul className="terms-list">
              <li>By browsing, accessing, registering details, or performing monetary transactions on this portal, you unconditionally acknowledge having read, understood, and agreed to be legally bound by these Terms & Conditions.</li>
              <li>The information, spiritual schedules, homam timings, and content provided on this website are subject to regular updates and administrative enhancements without prior notice.</li>
              <li>Devotees must ensure that the contact numbers, email addresses, Gotram, Rasi, Nakshatram, and postal addresses entered during pooja or sankalpam bookings are precise and complete.</li>
            </ul>

            <h2>2. Online Donations & Tax Exemption (80G)</h2>
            <div className="policy-card">
              <h3>🙏 Voluntary Contributions & Sacred Allocations</h3>
              <p>All contributions received through the donation portal (<Link to="/payment">/payment</Link>) are voluntary religious and charitable offerings devoted exclusively to:</p>
              <ul className="terms-list">
                <li><strong>Nithya Annadhanam Seva</strong> (Free daily meals for devotees, sadhus, and the needy).</li>
                <li><strong>Sri Varahi Kosala Seva</strong> (Cow protection, medical care, and continuous cattle feeding).</li>
                <li><strong>Temple Maintenance & Renovation Trust</strong> (Vedic patashala, shrine development, and kumbabishekam).</li>
                <li><strong>Kovil Pooja & Special Festivals</strong> (Ashada Navarathiri, Chitra Pournami, and monthly Panchami Homams).</li>
              </ul>
              <p style={{ margin: 0, fontSize: "14px", color: "#6a5446" }}>
                <strong>80G Tax Exemption:</strong> Eligible donations qualify for income tax exemption under Section 80G of the Income Tax Act, 1961. Donors requiring exemption receipts must provide their valid PAN card number during checkout.
              </p>
            </div>

            <h2>3. Temple Pooja, Homam & Sankalpam Bookings</h2>
            <ul className="terms-list">
              <li><strong>Personalized Sankalpam:</strong> Devotee family members' names, Rasi, Nakshatram, and prayers will be recited during the respective Vedic rituals as booked through <Link to="/services">Temple Services</Link> or <Link to="/devoteesdetails">Devotee Details Registration</Link>.</li>
              <li><strong>Ritual Observance:</strong> All poojas are conducted strictly in accordance with traditional Agamic and Shakta scriptures under the guidance of <em>Pallur Varahi Dhasan</em> and ordained temple priests.</li>
              <li><strong>Physical Presence:</strong> Physical attendance at the temple sanctum is welcome but not mandatory for remote sankalpam bookings; divine prasadam and sanctified items will be sent via postal dispatch.</li>
            </ul>

            <h2>4. Prasadham Courier & Dispatch Policy</h2>
            <div className="policy-card">
              <h3>📦 Sacred Prasadham Shipping & Delivery</h3>
              <ul className="terms-list">
                <li>Following the completion of the homam or pooja, sacred prasadhams (Vibhuti, Kumkum, Raksha Thread, Homam Bhasmam, and energized Yantras where applicable) are packed with sacred care.</li>
                <li>Prasadham packets are dispatched via India Post (Registered/Speed Post) or reputed domestic courier services within <strong>3 to 7 working days</strong> following the ritual date.</li>
                <li>Devotees will receive dispatch confirmation via SMS / WhatsApp / Email. While the Trust takes utmost care in packing, transit delays caused by postal disruptions, force majeure, or remote geographical accessibility are beyond the Trust's direct control.</li>
              </ul>
            </div>

            <h2>5. Cancellation, Postponement & Refund Policy</h2>
            <ul className="terms-list">
              <li><strong>Non-Refundable Offerings:</strong> Monetary donations and pooja seva fees are regarded as religious offerings once remitted and are generally <strong>non-refundable</strong>, as ritual items, flowers, samithu, and grains are purchased in advance.</li>
              <li><strong>Date Rescheduling:</strong> In the event of unforeseen natural calamities, eclipses (Grahana kaalam), or temple festival rescheduling, the Trust reserves the right to perform the booked homam/pooja on the next auspicious date with intimation to the devotee.</li>
              <li><strong>Duplicate Transaction Resolution:</strong> If a technical glitch causes duplicate deductions on Razorpay, the extra amount will be refunded to the original payment source within <strong>5 to 7 banking working days</strong> upon verification.</li>
            </ul>

            <h2>6. Astrology (Jothidam) & Spiritual Guidance Disclaimer</h2>
            <p>
              Astrological predictions, horoscope readings, and parihara recommendations offered under <strong>Sri Varahi Jothidam</strong> are spiritual and traditional consultative services rooted in ancient Vedic astrology (Jyotisha Shastra). They are provided in good faith to assist spiritual well-being. Astrological consultations do not substitute for professional legal, medical, or financial advice.
            </p>

            <h2>7. Payment Gateway Security & Financial Data</h2>
            <p>
              Online transactions on this website are securely encrypted and processed directly via <strong>Razorpay Software Private Limited</strong>, a PCI-DSS Level 1 certified payment aggregator. 
              The Trust does <strong>NOT</strong> store, record, or have access to your sensitive banking details, credit/debit card numbers, CVVs, or Net Banking credentials. 
              All payment transactions remain governed by Razorpay's Merchant Terms & Policies, accessible at:{' '}
              <a
                href="https://merchant.razorpay.com/policy/QGWKs6BkZ7RWJg/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#7a0c0c", fontWeight: "600", textDecoration: "underline" }}
              >
                https://merchant.razorpay.com/policy/QGWKs6BkZ7RWJg/terms
              </a>.
            </p>

            <h2>8. Intellectual Property & Sacred Media Rights</h2>
            <ul className="terms-list">
              <li>All multimedia, temple photography, Sri Varahi audio songs, mantrams, Varahi Malai transliterations, blog literature, logos, and UI designs featured on this website are the proprietary property of <strong>Jai Varahi Peedam Charitable Trust</strong>.</li>
              <li>Reproduction, commercial exploitation, unauthorized mirroring, or redistribution of sacred audio/video recordings without prior written permission is strictly prohibited.</li>
            </ul>

            <h2>9. Limitation of Liability & Indian Jurisdiction</h2>
            <ul className="terms-list">
              <li>The Trust shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from technical downtime, network failures, or inability to access the website.</li>
              <li>These Terms and Conditions shall be governed by and construed in accordance with the <strong>Laws of the Republic of India</strong>.</li>
              <li>Any legal disputes, grievances, or claims arising in connection with the website or temple services shall be subject to the exclusive jurisdiction of the competent civil courts in <strong>Vellore, Tamil Nadu, India</strong>.</li>
            </ul>

            {/* Official Contact Card */}
            <div className="contact-box">
              <h3>🏛️ Jai Varahi Peedam – Contact Us & Administrative Office</h3>
              <p>For inquiries regarding Sankalpam bookings, 80G receipts, or Prasadham tracking, kindly reach our temple office:</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "16px" }}>
                <div>
                  <strong style={{ color: "#7a0c0c" }}>📍 Temple Address:</strong>
                  <p style={{ margin: "4px 0 0", fontSize: "14px" }}>
                    Jai Varahi Peedam,<br />
                    Sri Kottai Varahi Amman Temple Street,<br />
                    Arumparuthi, Katpadi,<br />
                    Vellore, Tamil Nadu – 632106, India.
                  </p>
                </div>
                <div>
                  <strong style={{ color: "#7a0c0c" }}>📞 Contact Channels:</strong>
                  <p style={{ margin: "4px 0 0", fontSize: "14px" }}>
                    Phone: +91 90928 78389<br />
                    Email: <a href="mailto:varahikottai@gmail.com" style={{ color: "#7a0c0c", fontWeight: "600" }}>varahikottai@gmail.com</a><br />
                    Hours: Monday – Sunday, 8:00 AM – 8:00 PM IST
                  </p>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="quick-action-cta">
                <Link to="/payment" className="cta-btn-primary">
                  <span>🙏</span> Make a Temple Donation
                </Link>
                <Link to="/services" className="cta-btn-secondary">
                  <span>🪔</span> Explore Pooja Services
                </Link>
                <Link to="/devoteesdetails" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#5c3514", fontWeight: "700", textDecoration: "underline", fontSize: "14px", padding: "10px 14px" }}>
                  ✍️ Devotee Sankalpam Registration →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>

      <FloatActions />
      <Footer />
    </>
  )
}

export default TermsCondition

