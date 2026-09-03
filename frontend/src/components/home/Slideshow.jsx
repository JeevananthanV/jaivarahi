import React, { useEffect } from 'react';

function Slideshow() {
  useEffect(() => {
    const slides = document.querySelectorAll('.slideshow-slide');
    const dotsContainer = document.getElementById('galleryDots');
    const prevBtn = document.querySelector('.prev-button');
    const nextBtn = document.querySelector('.next-button');

    if (!slides.length || !dotsContainer) return undefined;

    let currentSlide = 0;
    let slideInterval;

    dotsContainer.innerHTML = '';

    const goToSlide = (target) => {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');
      currentSlide = (target + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    };

    const nextSlide = () => goToSlide(currentSlide + 1);
    const prevSlide = () => goToSlide(currentSlide - 1);

    const startTimer = () => {
      slideInterval = window.setInterval(nextSlide, 5000);
    };

    const resetTimer = () => {
      window.clearInterval(slideInterval);
      startTimer();
    };

    const dots = Array.from(slides).map((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('dot-marker');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(index);
        resetTimer();
      });
      dotsContainer.appendChild(dot);
      return dot;
    });

    const handleNext = () => {
      nextSlide();
      resetTimer();
    };

    const handlePrev = () => {
      prevSlide();
      resetTimer();
    };

    const handleKey = (event) => {
      if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    if (nextBtn) nextBtn.addEventListener('click', handleNext);
    if (prevBtn) prevBtn.addEventListener('click', handlePrev);
    document.addEventListener('keydown', handleKey);

    startTimer();

    return () => {
      window.clearInterval(slideInterval);
      if (nextBtn) nextBtn.removeEventListener('click', handleNext);
      if (prevBtn) prevBtn.removeEventListener('click', handlePrev);
      document.removeEventListener('keydown', handleKey);
      dotsContainer.innerHTML = '';
    };
  }, []);

  return (
    <section className="slideshow-wrapper" id="mainGallery">
      <div className="slideshow-slide active">
        <div className="slide-image">
          <picture>
            <source
              type="image/webp"
              srcSet="/assets/img/banner/banner1-mobile-480.webp 480w, /assets/img/banner/banner1-mobile-768.webp 768w, /assets/img/banner/banner1.webp 1920w"
              sizes="100vw"
            />
            <img
              src="/assets/img/banner/banner1.jpg"
              srcSet="/assets/img/banner/banner1-mobile-480.jpg 480w, /assets/img/banner/banner1-mobile-768.jpg 768w, /assets/img/banner/banner1.jpg 1920w"
              sizes="100vw"
              alt="Jai Varahi temple spiritual banner"
              width="1920"
              height="1080"
              fetchPriority="high"
              loading="eager"
              decoding="async"
              onLoad={(e) => e.currentTarget.closest('.slide-image')?.classList.add('is-loaded')}
            />
          </picture>
        </div>
        <div className="slide-dimmer"></div>

        <div className="slide-content">
          <div className="content-box">
            <h1 className="headline-text">Some Important Life Lessons From Varahi</h1>
            <p className="subheadline-text">
              Goddess Varahi teaches us courage, wisdom, and the strength to overcome darkness. Her divine
              lessons inspire us to walk a path of righteousness, protect dharma, and lead a life of inner
              power and peace.
            </p>
            <div className="button-group">
              <a href="/devoteesdetails" className="custom-btn main-button">
                Devotee Registration{' '}
                <svg className="icon-svg" aria-hidden="true">
                  <use href="#icon-arrow-right"></use>
                </svg>
              </a>
              <a href="/about" className="custom-btn outline-button">
                View Services{' '}
                <svg className="icon-svg" aria-hidden="true">
                  <use href="#icon-arrow-right"></use>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="slideshow-slide">
        <div className="slide-image">
          <picture>
            <source
              type="image/webp"
              srcSet="/assets/img/banner/banner2-mobile-480.webp 480w, /assets/img/banner/banner2-mobile-768.webp 768w, /assets/img/banner/banner2.webp 1920w"
              sizes="100vw"
            />
            <img
              src="/assets/img/banner/banner2.jpg"
              srcSet="/assets/img/banner/banner2-mobile-480.jpg 480w, /assets/img/banner/banner2-mobile-768.jpg 768w, /assets/img/banner/banner2.jpg 1920w"
              sizes="100vw"
              alt="Devotees of Varahi spiritual banner"
              width="1920"
              height="1080"
              loading="lazy"
              decoding="async"
              onLoad={(e) => e.currentTarget.closest('.slide-image')?.classList.add('is-loaded')}
            />
          </picture>
        </div>
        <div className="slide-dimmer"></div>

        <div className="slide-content">
          <div className="content-box">
            <h1 className="headline-text">We are devotees who believe in Varahi.</h1>
            <p className="subheadline-text">
              At the heart of our devotion is Goddess Varahi &mdash; a fierce yet compassionate embodiment
              of Shakti. We celebrate the rich spiritual heritage of Hinduism and follow the divine paths of
              Lord Rama and Vishnu Deva. Our mission is to inspire peace, faith, and fulfillment.
            </p>
            <div className="button-group">
              <a href="/devoteesdetails" className="custom-btn main-button">
                Join Devotee Family{' '}
                <svg className="icon-svg" aria-hidden="true">
                  <use href="#icon-arrow-right"></use>
                </svg>
              </a>
              <a href="/about" className="custom-btn outline-button">
                View Services{' '}
                <svg className="icon-svg" aria-hidden="true">
                  <use href="#icon-arrow-right"></use>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="navigation-controls">
        <button className="nav-arrow prev-button" aria-label="Previous Slide">
          <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button className="nav-arrow next-button" aria-label="Next Slide">
          <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>

      <div className="pagination-dots" id="galleryDots"></div>
    </section>
  );
}

export default Slideshow;
