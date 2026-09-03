import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import Preloader from '../components/common/Preloader.jsx'
import Navbar from '../components/common/Navbar.jsx'
import MobileNav from '../components/common/MobileNav.jsx'
import Slideshow from '../components/home/Slideshow.jsx'
import Marquee from '../components/home/Marquee.jsx'
import FounderVision from '../components/home/FounderVision.jsx'

const MainHeroBanner = lazy(() => import('../components/home/MainHeroBanner.jsx'))
const IndexCta = lazy(() => import('../components/home/IndexCta.jsx'))
const FloatActions = lazy(() => import('../components/common/FloatActions.jsx'))
const Footer = lazy(() => import('../components/common/Footer.jsx'))

function IndexHome() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null)
  const [showDeferred, setShowDeferred] = useState(false)
  

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

  // Individual component logic (Slideshow, Marquee, Overlay) has been successfully refactored into their respective components.

  useEffect(() => {
    let idleId
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => setShowDeferred(true), { timeout: 1500 })
    } else {
      idleId = window.setTimeout(() => setShowDeferred(true), 800)
    }

    return () => {
      if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId)
      } else {
        window.clearTimeout(idleId)
      }
    }
  }, [])

  const closeMobileMenu = () => {
    setIsMobileOpen(false)
    setActiveMobileDropdown(null)
  }

  const toggleMobileDropdown = (label) => {
    setActiveMobileDropdown((current) => (current === label ? null : label))
  }

  return (
    <>
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

      <main id="main-content" role="main">
        <Slideshow />
        <Marquee />
        <FounderVision />
        {showDeferred && (
          <Suspense fallback={null}>
            <MainHeroBanner />
            <IndexCta />
          </Suspense>
        )}
      </main>

      {showDeferred && (
        <Suspense fallback={null}>
          <FloatActions />
          <Footer />
        </Suspense>
      )}
    </>
  )
}

export default IndexHome

