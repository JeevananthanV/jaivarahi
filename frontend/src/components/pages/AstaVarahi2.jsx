import { useEffect, useMemo, useState } from 'react'
import About from '../components/Asta_Varahi_2_0/About_asta.jsx'
import Booking from '../components/Asta_Varahi_2_0/Booking.jsx'
import Cta from '../components/Asta_Varahi_2_0/Asta_varahi_2_Cta.jsx'
import Footer from '../components/common/Footer.jsx'
import Hero from '../components/Asta_Varahi_2_0/Hero.jsx'
import Preloader from '../components/common/Preloader.jsx'
import Navbar from '../components/common/Navbar.jsx'
import MobileNav from '../components/common/MobileNav.jsx'
import Speakers from '../components/Asta_Varahi_2_0/Speakers.jsx'
import Story from '../components/Asta_Varahi_2_0/Story.jsx'
import Schedule from '../components/Asta_Varahi_2_0/Schedule.jsx'
import Venue from '../components/Asta_Varahi_2_0/Venue.jsx'
import FloatActions from '../components/common/FloatActions.jsx'

function Home() {
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
      { label: 'Latest Updates', href: '/comingsoon' },
    ],
    [],
  )

  useEffect(() => {
    const handleAnchorClick = (event) => {
      const href = event.currentTarget.getAttribute('href')
      if (!href || href === '#') return

      if (href.startsWith('#')) {
        event.preventDefault()
        const target = document.querySelector(href)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }

    const anchors = document.querySelectorAll('a[href^="#"]')
    anchors.forEach((anchor) => anchor.addEventListener('click', handleAnchorClick))

    return () => {
      anchors.forEach((anchor) => anchor.removeEventListener('click', handleAnchorClick))
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

      <main id="main-content">
        <Hero />
        <About />
        <Booking />
        <Story />
        <Schedule />
        <Speakers />
        <Venue />
        <Cta />
      </main>
      <FloatActions />
      <Footer />
    </>
  )
}

export default Home

