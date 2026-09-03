import { useEffect, useMemo, useState } from 'react'
import About from '../Asta_Varahi_2_0/About_asta.jsx'
import Booking from '../Asta_Varahi_2_0/Booking.jsx'
import Cta from '../Asta_Varahi_2_0/Asta_varahi_2_Cta.jsx'
import Footer from '../common/Footer.jsx'
import Hero from '../Asta_Varahi_2_0/Hero.jsx'
import Preloader from '../common/Preloader.jsx'
import Navbar from '../common/Navbar.jsx'
import MobileNav from '../common/MobileNav.jsx'
import Speakers from '../Asta_Varahi_2_0/Speakers.jsx'
import Story from '../Asta_Varahi_2_0/Story.jsx'
import Schedule from '../Asta_Varahi_2_0/Schedule.jsx'
import Venue from '../Asta_Varahi_2_0/Venue.jsx'
import FloatActions from '../common/FloatActions.jsx'

function Home() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeMobileDropdown, setActiveMobileDropdown] = useState(null)
  const [isPreloaderHidden, setIsPreloaderHidden] = useState(false)

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
    document.body.classList.add('av-page')
    return () => document.body.classList.remove('av-page')
  }, [])

  useEffect(() => {
    const minDisplayTime = 500
    const startTime = performance.now()

    const finishLoading = () => {
      const elapsed = performance.now() - startTime
      const remaining = Math.max(0, minDisplayTime - elapsed)

      window.setTimeout(() => {
        setIsPreloaderHidden(true)
        document.body.classList.add('loaded')
      }, remaining)
    }

    if (document.readyState === 'complete') {
      finishLoading()
      return undefined
    }

    window.addEventListener('load', finishLoading)
    return () => window.removeEventListener('load', finishLoading)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  useEffect(() => {
    const createRipple = (event) => {
      const button = event.currentTarget
      const existingRipple = button.querySelector('.ripple')
      if (existingRipple) {
        existingRipple.remove()
      }

      const ripple = document.createElement('span')
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2

      ripple.style.width = `${size}px`
      ripple.style.height = `${size}px`
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      ripple.classList.add('ripple')

      button.appendChild(ripple)
      window.setTimeout(() => ripple.remove(), 600)
    }

    const buttons = document.querySelectorAll('.icon-btn, .donate-btn')
    buttons.forEach((button) => button.addEventListener('click', createRipple))

    return () => {
      buttons.forEach((button) => button.removeEventListener('click', createRipple))
    }
  }, [])

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
      <Preloader hidden={isPreloaderHidden} />
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

