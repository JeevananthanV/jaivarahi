import { Suspense, lazy, useMemo, useState } from 'react'
import Preloader from '../components/common/Preloader.jsx'
import Navbar from '../components/common/Navbar.jsx'
import MobileNav from '../components/common/MobileNav.jsx'
import FloatActions from '../components/common/FloatActions.jsx'
import Footer from '../components/common/Footer.jsx'
import MainHeroBanner from '../components/home/MainHeroBanner.jsx'
import Slideshow from '../components/home/Slideshow.jsx'
import Marquee from '../components/home/Marquee.jsx'
import SeoEnhanced from '../components/common/SeoEnhanced.jsx'
import { pageFaqs, howToData } from '../data/faqData.js'

const FounderVision = lazy(() => import('../components/home/FounderVision.jsx'))
const IndexCta = lazy(() => import('../components/home/IndexCta.jsx'))

function IndexHome() {
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
      <SeoEnhanced
        title="Jai Varahi Peedam | Varahi Amman Temple in Katpadi, Vellore"
        description="Jai Varahi Peedam is a Varahi Amman temple in Katpadi, Vellore. Book Pooja & Homa online, get Jothidam guidance, and support our temple's community mission."
        keywords="Varahi Amman, Jai Varahi Peedam, Temple Vellore, Varahi Pooja, Spiritual Healing, Astrology India"
        canonical="https://www.jaivarahi.org/"
        ogTitle="Jai Varahi Peedam | Varahi Amman Temple in Katpadi, Vellore"
        ogDescription="Jai Varahi Peedam is a Varahi Amman temple in Katpadi, Vellore. Book Pooja & Homa online, get Jothidam guidance, and support our temple's community mission."
        ogImage="https://www.jaivarahi.org/assets/img/images_new/VARAHI%20LOGO.svg"
        ogUrl="https://www.jaivarahi.org/"
        faqs={pageFaqs.home}
        howTo={howToData.bookPooja}
        author={{
          name: 'Swamy Pallur Varahidhasan',
          url: 'https://www.jaivarahi.org/about',
          jobTitle: 'Founder & Spiritual Head, Jai Varahi Peedam',
          description: 'Practitioner of Vedic traditions and Varahi Amman worship with decades of experience in performing sacred poojas, homams, and providing Jothidam (astrology) guidance.',
        }}
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

      <main id="main-content" role="main">
        <Slideshow />
        <Marquee />
        <Suspense fallback={null}>
          <FounderVision />
        </Suspense>
        <MainHeroBanner />
        <Suspense fallback={null}>
          <IndexCta />
        </Suspense>
      </main>

      <FloatActions />
      <Footer />
    </>
  )
}

export default IndexHome
