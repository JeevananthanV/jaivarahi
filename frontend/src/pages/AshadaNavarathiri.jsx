import React, { useEffect, useMemo, useState } from 'react'
import SeoEnhanced from '../components/common/SeoEnhanced.jsx';
import { pageFaqs } from '../data/faqData.js';
import Preloader from '../components/common/Preloader.jsx'
import Navbar from '../components/common/Navbar.jsx'
import MobileNav from '../components/common/MobileNav.jsx'
import Footer from '../components/common/Footer.jsx'
import FloatActions from '../components/common/FloatActions.jsx'

import Hero from '../components/Ashada_Navarathiri/Hero.jsx'
import Details from '../components/Ashada_Navarathiri/Details.jsx'
import Packages from '../components/Ashada_Navarathiri/Packages.jsx'
import SpecialRoyal from '../components/Ashada_Navarathiri/SpecialRoyal.jsx'
import Schedule from '../components/Ashada_Navarathiri/Schedule.jsx'
import Venue from '../components/Ashada_Navarathiri/Venue.jsx'
import DonationProgress from '../components/Ashada_Navarathiri/DonationProgress.jsx'
import Cta from '../components/Ashada_Navarathiri/Cta.jsx'
import Gallery from '../components/Ashada_Navarathiri/Gallery.jsx'
import HomamBenefits from '../components/Ashada_Navarathiri/HomamBenefits.jsx'
import Annadhanam from '../components/Ashada_Navarathiri/Annadhanam.jsx'
import GuruBlessings from '../components/Ashada_Navarathiri/GuruBlessings.jsx'



function AshadaNavarathiri() {
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
    const overlay = document.querySelector('.animated-color-overlay')
    const container = overlay ? overlay.parentElement : null
    if (!overlay || !container) return undefined

    let lastScrollY = window.scrollY
    let transitionTriggered = false

    overlay.style.transform = 'translateY(100%)'

    const resetOverlay = () => {
      overlay.style.transition = 'none'
      overlay.style.transform = 'translateY(100%)'
      window.requestAnimationFrame(() => {
        overlay.style.transition = 'transform 5s ease-out'
      })
      transitionTriggered = false
    }

    const onScroll = () => {
      const rect = container.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const scrollingDown = window.scrollY > lastScrollY

      if (!scrollingDown && (rect.bottom <= 0 || rect.top >= viewportHeight)) {
        resetOverlay()
      }

      if (scrollingDown && rect.top <= 0 && !transitionTriggered) {
        transitionTriggered = true
        overlay.style.transform = 'translateY(0%)'

        const handleTransitionEnd = () => {
          overlay.style.transition = 'transform 2s ease-out'
          overlay.style.transform = 'translateY(35%)'
          overlay.removeEventListener('transitionend', handleTransitionEnd)
        }

        overlay.addEventListener('transitionend', handleTransitionEnd)
      }

      lastScrollY = window.scrollY
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
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
      <SeoEnhanced
        title="Ashada Navarathiri | Jai Varahi Peedam - Divine Festival Celebration"
        description="Join Ashada Navarathiri at Jai Varahi Peedam, Arumparuthi. Eleven nights of worship, rituals, and cultural activities dedicated to Goddess Varahi. Book your pooja packages now."
        keywords="Ashada Navarathiri, Jai Varahi Peedam, Varahi Temple, Arumparuthi, Vellore, Navarathiri festival, Goddess Varahi, Hindu festival, Pooja packages, Abhishekam"
        canonical="https://www.jaivarahi.org/ashada_navarathiri"
        ogTitle="Ashada Navarathiri | Jai Varahi Peedam"
        ogDescription="Eleven nights of divine worship at Jai Varahi Peedam. Join us for Ashada Navarathiri celebrations with special poojas, abhishekam, and homams."
        ogImage="https://www.jaivarahi.org/assets/img/images_new/VARAHI%20LOGO.svg"
        ogUrl="https://www.jaivarahi.org/ashada_navarathiri"
        faqs={pageFaqs.ashadaNavarathiri}
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

      <main id="main-content">
        <Hero />
        <Details />
        <GuruBlessings />
        <Packages />
        <SpecialRoyal />
        <HomamBenefits />
        <Schedule />
        <Gallery />
        <Venue />
        <Annadhanam />
        <DonationProgress />
        <Cta />
      </main>

      <FloatActions />
      <Footer />
    </>
  )
}

export default AshadaNavarathiri

