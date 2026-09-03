import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import MobileNav from '../components/common/MobileNav.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx'

const SriBalaManthiram = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null);
  ;

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


  return (
    <>
      <Helmet>
        <title>ஸ்ரீ பாலா திரிபுரசுந்தரி மந்திரம் | Bala Tripurasundari Mantra | Jaivarahi</title>
        <meta name="description" content="ஸ்ரீ பாலா திரிபுரசுந்தரி மந்திரங்கள், பீஜ மந்திரங்கள் (ஐம், க்லீம், சௌஹூம்), சித்தர்கள் வழிபாட்டு முறைகள் மற்றும் பராசக்தியின் அருளைப் பெறும் ஆன்மீக வழிகாட்டி." />
        <meta name="keywords" content="ஸ்ரீ பாலா, பாலா திரிபுரசுந்தரி, Bala Tripurasundari, Bala Mantra, பீஜ மந்திரம், சித்தர்கள், சக்தி வழிபாடு, தமிழ் மந்திரம், Jaivarahi" />
        <meta property="og:title" content="ஸ்ரீ பாலா திரிபுரசுந்தரி – திவ்ய மந்திர ஜபம்" />
        <meta property="og:description" content="பாலா திரிபுரசுந்தரியின் பீஜ மந்திரங்கள், ஜப விதிகள் மற்றும் ஆன்மீக பலன்கள்." />
        <meta property="og:url" content="https://jaivarahi.org/bala-tripurasundari" />
      </Helmet>

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

      <main className="ug-page-main sbm-page-main">
        <section className="ug-hero sbm-hero" aria-label="Uchchishta Ganapati">
            <img src="/assets/img/god/bala banner.jpeg" alt="Uchchishta Ganapati" className="ug-hero-image sbm-hero-image" />
            <div className="ug-hero-overlay sbm-hero-overlay"></div>
            <div className="site-container ug-hero-content sbm-hero-content">
                <h1>Sri Bala Mantra</h1>
                <h2 lang="ta" className="ug-tamil sbm-tamil">ஸ்ரீ பாலா மந்திரம்</h2>
                <a href="#sbm-mantra-list" className="ug-hero-cta sbm-hero-cta">Listen to Mantras</a>
            </div>
        </section>

        <section className="ug-intro sbm-intro section section-padding">
            <div className="site-container container sbm-intro-shell">
                <aside className="sbm-card sbm-intro-media" aria-label="Sri Bala visual">
                    <div className="sbm-intro-media-frame">
                        <img src="/assets/img/god/Sri Bala.png" alt="Sri Bala divine form" className="sbm-intro-image" />
                        <span className="sbm-intro-badge">
                            <a href="#sbm-mantra-list">Sri Bala Tripurasundari</a>
                        </span>
                    </div>
                    <p className="sbm-intro-note">Sacred Motherly Energy, Wisdom, and Protection.</p>
                </aside>

                <article className="sbm-card sbm-intro-content">
                    <h3 lang="ta" className="sbm-tamil">Sri Bala Dhyana Vilakkam</h3>
                    <p>மந்திரஜபத்தில் கணபதிக்கு அடுத்ததாக வருவது ஸ்ரீ பாலா மந்திரம். ஸ்ரீ ராஜராஜேஸ்வரியாகிய பராசக்தி தானே விரும்பி எடுத்துக்கொண்ட குழந்தைப்பருவ வடிவமே ஸ்ரீ பாலாதிரிபுரசுந்தரி.</p>
                    <p>எந்த யோகப்பயிற்சி முறையையும் பின்பற்றி சித்தர்கள் சித்தி அடைந்தாலும் அனைவரும் வழிபட்ட தெய்வம் அன்னை ஸ்ரீ பாலா திரிபுரசுந்தரியே என்று சித்தர் நூல்கள் கூறுகின்றன.</p>
                    <p>மேலும் சில சூபி ஞானியரின் பாடல்களும் நூல்களும் இதை ஒப்புக்கொள்கின்றன. புனித மறைகளும் சித்தர்களும் ஞானிகளும் இறைவன் நமக்குள்ளே தான் இருக்கிறான் என்று கூறுகின்றனர்.</p>
                    <p>உள்ளார்ந்த பக்தியுடன் அவளை தியானிக்கும்போது மன அமைதி, ஆன்மீக தெளிவு மற்றும் பாதுகாப்பு உணர்வு நம்முள் ஆழமாக வளர்கிறது.</p>
                </article>
            </div>

            <div className="site-container container sbm-intro-footer">
                <p className="sbm-intro-footer-text">சிவம் என்பது அசையப்பொருளாக உள்ளது அதுவே மூலசக்தி அதை இயங்க வைக்கும் ஆற்றலே அன்னை பராசக்தி மும்மூர்த்திகளின் செயல் ரூபமே சக்தி ஸ்தோத்திரங்கள் ஸ்லோகங்களை விட மூலமந்திர ஜெபம் அந்த குறிப்பிட்டதெய்வத்திற்கு அருகில் விரைவாய் அழைத்துச் செல்லும் பீஜம் என்றால் விதை எப்படி விதைக்குள் மரம் அடக்கமோ அப்படி பீஜத்திற்குள் தெய்வங்கள் அடக்கம் எனவே பீஜ மந்திரஜபம் உயர்வாக சொல்லப்படுகிறது.</p>
            </div>
        </section>

        <section className="ug-mantra sbm-mantra section section-padding" id="sbm-mantra-list">
            <div className="site-container container">
                <div className="ug-section-head sbm-section-head">
                    <h3 lang="ta" className="ug-tamil sbm-tamil">ஸ்ரீ பாலா திரிபுரசுந்தரி மந்திரங்கள் :-</h3>
                    <p>Audio recitations for daily chanting and sadhana practice.</p>
                </div>
                <div className="ug-mantra-grid sbm-mantra-grid">
                    <article className="ug-card sbm-card ug-mantra-card sbm-mantra-card">
                        <h4 lang="ta" className="ug-tamil sbm-tamil">1. ஸ்ரீ பாலா திரிபுரசுந்தரி திரியட்சரி</h4>
                        <p lang="ta" className="ug-tamil sbm-tamil">
                            மந்திரம்:- <br/>
                            ஓம் |ஐம்|க்லீம்|சௌம்|<br/>
                            இதில் சௌம் என்பதை "சௌஹூம்" என்று சொல்லுவது சிறந்தது <br/>
                            ஐம் - என்ற பீஜம் வாக்பீஜம் எனப்படுகிறது பிரம்மா சரஸ்வதி இவர்களின் அம்சம் இம்மந்திரம் நல்ல வாக்குவன்மை (பேச்சாற்றல்) வாக்குபலிதம் ஞானம் அறிவு இவற்றைத் தரும்
                            <br/>
                            க்லீம் என்ற பிஜம் காமராஜபீஜம் எனப்படும் இதில் விஷ்ணு லக்ஷ்மி காளி, மன்மதன் இவர்கள் அடக்கம் இம்மந்திரம் நல்ல செல்வம் செல்வாக்கு கௌரவம், வசீகரசக்தி உடல் மன பலம் இவற்றை தரும்
                            <br/>
                            சௌஹூம் - இப்பீஜத்தில் சிவன், பார்வதி முருகன் இவர்கள் அடக்கம் சௌம் என்ற பீஜத்தில் இருந்தே சௌபாக்கியம் என்ற வார்த்தை தோன்றியதாக வேதம் கூறுகிறது இப்பீஜம் சௌபாக்கியம் நிறைந்த வளமான வாழ்வினைத்தரும்.
                            <br/>
                            இவ்வாறு மும்மூர்த்திகளின் பீஜத்தையும் ஒருங்கே கொண்டவள் வாலைத்தாய் என்ற ஸ்ரீ பாலா திரிபுரசுந்தரி அன்னை இவள் மந்திரத்தை முறையாய் ஜெபித்து நல்வாழ்வு வாழ்ந்து ஆன்மீகத்திலும் வாழ்விலும் உயர்ந்த நிலையை அடையலாம்.
                        </p>
                        <audio src="/assets/audio/Uchchishta_Ganapati_Mandram_01.mp3" controls alt="nil"></audio>
                    </article>
                    <article className="ug-card sbm-card ug-mantra-card sbm-mantra-card">
                        <h4 lang="ta" className="ug-tamil sbm-tamil">2.ஸ்ரீ பாலா திரிபுரசுந்தரி சடாட்சரி</h4>
                        <p lang="ta" className="ug-tamil sbm-tamil">
                            மந்திரம்:- <br/>ஓம்|ஐம் க்லீம் சௌம்|சௌம் க்லீம் ஐம்||
                        </p>
                        <audio src="/assets/audio/Uchchishta_Ganapati_Mandram_02.mp3" controls></audio>
                    </article>
                    <article className="ug-card sbm-card ug-mantra-card sbm-mantra-card">
                        <h4 lang="ta" className="ug-tamil sbm-tamil">3.ஸ்ரீ பாலா திரிபுரசுந்தரி நவாட்சரி</h4>
                        <p lang="ta" className="ug-tamil sbm-tamil">
                            மந்திரம்:- <br/>
                            ஓம்|ஐம் க்லீம் சௌம்|சௌம் க்லீம் ஐம்||ஐம்க்லீம் சௌம்|
                        </p>
                        <audio src="/assets/audio/Uchchishta_Ganapati_Mandram_03.mp3" controls></audio>
                    </article>
                </div>
            </div>
        </section>

        <section className="ug-conclusion sbm-conclusion section section-padding">
            <div className="site-container container">
                <div className="sbm-conclusion-card">
                    <p className="sbm-conclusion-eyebrow">Spiritual Closing</p>
                    <h3 className="sbm-conclusion-title">Sri Bala Sadhana Conclusion</h3>
                    <p className="sbm-conclusion-text">முதலில் திரியட்சரம் ஜெபித்து சித்தியடைந்த பின் சடாட்சரியும் பின்னர் நவாட்சரியும் ஜெபிக்க உத்தமம்.</p>
                    <p className="sbm-conclusion-text">இந்த தாயை வாலை என்றும் பாலம்பிகா என்றும் அழைப்பர்.</p>
                    <p className="sbm-conclusion-text">சித்தர்கள் அனைவரும் தங்களின் பாடலில் வாலை கும்மி பாடி வணங்கி தொடங்குகின்றனர் வாலை தாய் அன்னை அதிபராசக்தியின் 10 வயது பால பருவமாக காட்சியளித்த தோற்றம் சித்தர்களின் தலைவன் முருக பெருமானை வணங்கி வந்தால் அன்னை வாலை</p>
                    <p className="sbm-conclusion-text">தாய் அருள் புரிந்து, சித்தி பெற முடியும் முக்தியடைய முடியும் சக்தியை பெற்று பரம்பொருளுடன் இணைந்து முக்தியடைய முடியும்</p>
                    <p className="sbm-conclusion-text">வாலையடி சித்தருக்கு தெய்வம் என்று சித்தர்களால் சிறப்பித்துக் கூறப்பட்ட அன்னை ஸ்ரீ பால திரிபுரசுந்தரியின் அருள் நம் அனைவரையும் வாழ்விலும் ஆன்மீகத்திலும் மென்மேலும் உயர வழிகாட்ட, உறுதுணையாய் நிற்க வேண்டுகிறேன்.</p>
                    <div className="sbm-conclusion-points">
                        <span>Daily Pooja</span>
                        <span>Guided Pooja</span>
                        <span>Steady Discipline</span>
                        <span>Divine Protection</span>
                    </div>
                    <p className="sbm-conclusion-sign">ஜெய் பாலா!!!</p>
                    <p className="sbm-conclusion-sign">ஜெய் வாராஹி!!!</p>
                </div>
            </div>
        </section>

        <section className="site-cta site-cta--sri-bala-manthiram" style={{ '--cta-bg-image': 'url(/assets/img/god/bala\\ banner.jpeg)' }} aria-label="Sri Bala Manthiram call to action">
            <div className="site-cta__content">
                <h2>Deepen Your Sri Bala Sadhana</h2>
                <p>Receive guidance for mantra practice, pooja participation, and devotional offerings.</p>
                <div className="site-cta__actions">
                    <a href="/payment" className="site-cta__btn">Join Now</a>
                    <a href="/calendar" className="site-cta__btn site-cta__btn--alt">View Dates</a>
                </div>
            </div>
        </section>
      </main>

      {/* Floating Action Button */}
      

      <FloatActions />
      <Footer />
    </>
  );
};

export default SriBalaManthiram;

