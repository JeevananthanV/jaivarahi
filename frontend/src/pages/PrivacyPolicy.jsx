import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/common/seo.jsx'
import Preloader from '../components/common/Preloader.jsx'
import Navbar from '../components/common/Navbar.jsx'
import MobileNav from '../components/common/MobileNav.jsx'
import FloatActions from '../components/common/FloatActions.jsx'
import Footer from '../components/common/Footer.jsx'

function PrivacyPolicy() {
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
        title="Privacy Policy - Sri Kottai Varahi temple"
        description="Official Privacy Policy, Data Protection, Devotee Confidentiality, and 80G Statutory Governance of Jai Varahi Peedam."
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

      <main className="policy-page" id="main-content">
        <div className="hero-section">
          <h1>Privacy Policy</h1>
          <p>Official Statutory Privacy, Devotee Data Protection & Confidentiality Governance</p>
        </div>

        <div className="policy-container">
          <div className="policy-content">
            <span className="last-updated">
              📅 Last Updated & Enacted: August 2026
            </span>

            {/* Trust Badges */}
            <div className="trust-badge-bar">
              <div className="trust-badge-item">
                <span className="trust-badge-icon">🛡️</span>
                <span>DPDP Act 2023 & IT Act 2000 Compliant</span>
              </div>
              <div className="trust-badge-item">
                <span className="trust-badge-icon">🔒</span>
                <span>Zero Card / Bank Credential Storage</span>
              </div>
              <div className="trust-badge-item">
                <span className="trust-badge-icon">🕊️</span>
                <span>Sacred Sankalpam Confidentiality</span>
              </div>
              <div className="trust-badge-item">
                <span className="trust-badge-icon">📜</span>
                <span>Form 10BD 80G Statutory Protection</span>
              </div>
            </div>

            {/* Section 1: Preamble */}
            <p className="policy-intro">
              <strong>JAI VARAHI PEEDAM / SRI KOTTAI VARAHI TEMPLE </strong> (hereinafter referred to as <strong>"Trust"</strong>, <strong>"Peedam"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong>), located at <em>Sri Kottai Varahi Amman Temple Street, Arumparuthi, Katpadi, Vellore, Tamil Nadu – 632106, India</em>, operates the official temple website <a href="https://www.jaivarahi.org">www.jaivarahi.org</a> and its associated devotional seva portals. 
              This Privacy Policy details how we collect, process, safeguard, and maintain the confidentiality of personal, devotional, and financial information provided by devotees, donors, and visitors (<strong>"Devotee"</strong>, <strong>"User"</strong>, or <strong>"You"</strong>) in accordance with the <em>Information Technology Act, 2000</em>, the <em>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules)</em>, and the <em>Digital Personal Data Protection Act, 2023 (DPDP Act)</em> of India.
            </p>

            <h2>1. Information We Collect</h2>
            <p>To perform sacred poojas, facilitate online donations, dispatch divine prasadham, and manage devotee registrations, we collect the following categories of information:</p>
            
            <div className="policy-card">
              <h3>👤 A. Personal Identity & Contact Data</h3>
              <ul className="policy-list">
                <li>Primary devotee's Full Name, Gender, Date of Birth, and Age.</li>
                <li>Valid Email Address, Mobile Phone Number, and WhatsApp Number.</li>
                <li>Complete Postal Delivery Address with Landmark, City, State, and Pincode (for Prasadham shipping).</li>
              </ul>

              <h3>🪔 B. Sacred Devotional & Vedic Astrological Details</h3>
              <ul className="policy-list">
                <li>Vedic Astrological coordinates: <strong>Gotram</strong>, <strong>Nakshatram (27 Birth Stars)</strong>, and <strong>Rasi (12 Moon Signs)</strong>.</li>
                <li>Family members' names, relationship, individual Nakshatram, and date of birth for collective Sankalpam.</li>
                <li>Kuladeivam (Family Deity) details, anniversary dates, and specific prayer intentions or dosha pariharam requests.</li>
              </ul>

              <h3>📜 C. Statutory Taxation & Financial Records</h3>
              <ul className="policy-list">
                <li><strong>Permanent Account Number (PAN)</strong>: Mandatorily collected for donors claiming 80G tax exemption certificates under Income Tax Department Form 10BD compliance.</li>
                <li>Donation amounts, purpose of contribution (Annadhanam, Kosala, Temple Renovation), and Razorpay transaction reference IDs.</li>
              </ul>
            </div>

            <h2>2. Purpose & Lawful Basis of Processing</h2>
            <p>We process your personal and devotional data solely for legitimate religious, charitable, and statutory purposes:</p>
            <ul className="policy-list">
              <li><strong>Vedic Sankalpam Recitation:</strong> Chanting the names, Gotrams, and Nakshatrams of you and your family members during daily Nithya Poojas, monthly Panchami Homams, and special temple festivals.</li>
              <li><strong>Sacred Prasadham Fulfillment:</strong> Packaging and delivering sanctified Vibhuti, Kumkum, Raksha, and energized Yantras directly to your designated residential address via India Post / Courier.</li>
              <li><strong>Statutory Tax Receipts:</strong> Issuing formal donation receipts and reporting eligible contributions to the Income Tax Department for Section 80G exemption.</li>
              <li><strong>Astrology & Spiritual Consultations:</strong> Reviewing horoscopes and providing traditional spiritual counsel under <em>Sri Varahi Jothidam</em>.</li>
              <li><strong>Temple Updates & Reminders:</strong> Notifying registered devotees regarding auspicious thithis, upcoming Homams, and temple welfare activities.</li>
            </ul>

            <h2>3. Zero Storage of Banking & Card Credentials</h2>
            <div className="policy-card">
              <h3>💳 Payment Gateway & PCI-DSS Compliance</h3>
              <p>
                All online payments on this portal are handled exclusively through <strong>Razorpay Software Private Limited</strong>, an RBI-authorized, PCI-DSS Level 1 certified payment processor utilizing 256-bit SSL encryption.
              </p>
              <ul className="policy-list">
                <li><strong>Zero Credential Retention:</strong> The Trust does <strong>NOT</strong> collect, view, log, or store credit/debit card numbers, CVV security codes, Net Banking passwords, or UPI MPINs on our servers.</li>
                <li><strong>Tokenized Verification:</strong> Our backend receives only an encrypted confirmation token and transaction ID to generate your verified seva receipt.</li>
              </ul>
            </div>

            <h2>4. Devotee Data Protection & Non-Disclosure (No Sale of Data)</h2>
            <ul className="policy-list">
              <li><strong>Strict Confidentiality:</strong> We hold devotee spiritual intentions, family details, and financial contributions in the highest sanctity. We do <strong>NOT</strong> sell, rent, trade, or commercialize your personal information to any third-party marketing or advertising networks under any circumstance.</li>
              <li><strong>Limited Third-Party Disclosures:</strong> Information is shared solely with:
                <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                  <li><em>Logistics Partners (India Post / Courier)</em>: Only recipient name, delivery address, and phone number necessary for physical prasadham transit.</li>
                  <li><em>Income Tax Department of India</em>: Mandated annual filing of Form 10BD for donor tax exemption under Section 80G.</li>
                  <li><em>Law Enforcement Authorities</em>: Only when strictly mandated by applicable Indian laws or judicial orders.</li>
                </ul>
              </li>
            </ul>

            <h2>5. Data Security & Storage Architecture</h2>
            <p>
              The Trust implements rigorous technical and administrative security measures to protect devotee data from unauthorized access, accidental loss, alteration, or disclosure:
            </p>
            <ul className="policy-list">
              <li><strong>Transport Layer Security:</strong> All web traffic is encrypted end-to-end via <strong>HTTPS / TLS 1.3</strong> protocol.</li>
              <li><strong>Role-Based Access Control (RBAC):</strong> Backend access to devotee directories and donation ledgers is restricted strictly to authenticated temple administrative personnel with JWT tokens and cryptographic hashing (bcrypt).</li>
              <li><strong>Database Protection:</strong> Production database is secured with connection pooling, idle timeouts, and parameterized SQL statements to eliminate injection vulnerabilities.</li>
            </ul>

            <h2>6. Devotee Rights under Digital Personal Data Protection Act (DPDP Act 2023)</h2>
            <p>Under Indian data protection laws, devotees and registered users possess the following legal rights regarding their personal data:</p>
            <ul className="policy-list">
              <li><strong>Right to Access:</strong> You may request a summary of the personal and family details held in your devotee profile.</li>
              <li><strong>Right to Correction & Updating:</strong> You may correct or update erroneous contact numbers, addresses, or Nakshatram details by reaching our support desk.</li>
              <li><strong>Right to Grievance Redressal:</strong> You have the right to register concerns or complaints directly with our Data Grievance Officer.</li>
              <li><strong>Right to Erasure:</strong> You may request the deletion of non-statutory personal records, subject to legal and financial retention requirements (e.g., maintaining 7-year statutory audit records for tax laws).</li>
            </ul>

            <h2>7. Cookies & Session Management</h2>
            <p>
              Our website uses essential session cookies to remember your language preference (Tamil / English), preserve login states for administrators, and prevent cross-site request forgery (CSRF). We do not deploy third-party intrusive tracking cookies.
            </p>

            <h2>8. Minors & Family Registration</h2>
            <p>
              Our website permits parents or legal guardians to register minor children's names, dates of birth, and birth stars solely for the religious purpose of temple pooja sankalpam and seeking divine blessings. We do not intentionally collect data directly from unaccompanied minors.
            </p>

            {/* Official Contact & Grievance Redressal Card */}
            <div className="contact-box">
              <h3>🏛️ Jai Varahi Peedam – Contact Us & Grievance Redressal</h3>
              <p>In compliance with the Information Technology Act 2000 and DPDP Act 2023, if you have any questions, privacy concerns, or requests regarding your data, please contact our temple administration:</p>
              
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
                <Link to="/devoteesdetails" className="cta-btn-primary">
                  <span>✍️</span> Devotee Registration Portal
                </Link>
                <Link to="/payment" className="cta-btn-secondary">
                  <span>🙏</span> Contribute Online Donation
                </Link>
                <Link to="/terms-condition" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#5c3514", fontWeight: "700", textDecoration: "underline", fontSize: "14px", padding: "10px 14px" }}>
                  📜 View Terms & Conditions →
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

export default PrivacyPolicy

