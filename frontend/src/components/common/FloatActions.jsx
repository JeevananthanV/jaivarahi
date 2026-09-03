import { useEffect, useRef, useState } from 'react'

function FloatActions() {
  const [isVisible, setIsVisible] = useState(false)
  const backToTopRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.pageYOffset > 300)
    }

    window.addEventListener('scroll', onScroll)
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleBackToTop = (event) => {
    event.preventDefault()
    const button = backToTopRef.current
    if (!button) return

    button.classList.add('divine-ascent')

    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 200)

    window.setTimeout(() => {
      button.classList.remove('divine-ascent')
    }, 1500)
  }

  return (
    <>
      <a
        href="https://wa.me/919092878389?text=Hi, I'm interested in Donation"
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <i className="fab fa-whatsapp"></i>
      </a>
      <div
        className={`sigma_top style-5${isVisible ? ' show' : ''}`}
        id="backToTop"
        onClick={handleBackToTop}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            handleBackToTop(event)
          }
        }}
        ref={backToTopRef}
      >
        <i className="fa-solid fa-angle-double-up"></i>
      </div>
    </>
  )
}

export default FloatActions
