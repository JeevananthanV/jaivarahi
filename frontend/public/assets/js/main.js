if (typeof window !== 'undefined' && window.jQuery) {
(function ($) {
    'use strict';

    //-------------------------------------------------------------------------------
    // Preloader
    //-------------------------------------------------------------------------------
    (function() {
            const MIN_DISPLAY_TIME = 500; 
            const preloader = document.getElementById('jaivarahiPreloader');
            const body = document.body; 
            const startTime = performance.now();

            function finishLoading() {
                const currentTime = performance.now();
                const elapsedTime = currentTime - startTime;
                const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime);

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        if(preloader) preloader.classList.add('hidden');
                        body.classList.add('loaded');
                    }, remainingTime);
                });
            }

            window.addEventListener('load', finishLoading);
        })();
    //-------------------------------------------------------------------------------
    // Subheader Trigger
    //-------------------------------------------------------------------------------
    $(".subheader-toggler").on('click', function (e) {
        e.preventDefault();
        $(".sigma_subheader-extras").toggleClass('open');
    });

    //-------------------------------------------------------------------------------
    // Volunteers Socials Trigger
    //-------------------------------------------------------------------------------
    $("a.trigger-volunteers-socials").on('click', function (e) {
        e.preventDefault();
        $(this).closest('.sigma_sm').toggleClass('visible');
    });

    //-------------------------------------------------------------------------------
    // Cart Trigger
    //-------------------------------------------------------------------------------
    $(".sigma_cart-trigger").on('click', function (e) {
        e.preventDefault();
        $("body").toggleClass('cart-open');
    });

    //-------------------------------------------------------------------------------
    // Search Trigger
    //-------------------------------------------------------------------------------
    $(".sigma_search-trigger").on('click', function (e) {
        e.preventDefault();
        $(".sigma_search-form-wrapper").toggleClass('open');
    });

    //-------------------------------------------------------------------------------
    // Aside Menu
    //-------------------------------------------------------------------------------
    $(".aside-trigger-right").on('click', function () {
        var $el = $(".sigma_aside-right-panel");
        $el.toggleClass('open');
        if ($el.hasClass('open')) {
            setTimeout(function () {
                $el.find('.sidebar').fadeIn();
            }, 300);
        } else {
            $el.find('.sidebar').fadeOut();
        }
    });

    $(".aside-trigger-left").on('click', function () {
        $(".sigma_aside-left").toggleClass('open');
    });

    $(".sigma_aside .menu-item-has-children > a").on('click', function (e) {
        var submenu = $(this).next(".sub-menu");
        e.preventDefault();
        submenu.slideToggle(200);
    });

    //-------------------------------------------------------------------------------
    // Sticky Header
    //-------------------------------------------------------------------------------
    var header = $(".can-sticky");
    var headerHeight = header.innerHeight();

    function doSticky() {
        if (window.pageYOffset > headerHeight) {
            header.addClass("sticky");
        } else {
            header.removeClass("sticky");
        }
    }

    //-------------------------------------------------------------------------------
    // Tooltips
    //-------------------------------------------------------------------------------
    if (typeof $.fn.tooltip === 'function') {
        $('[data-toggle="tooltip"]').tooltip();
    }

    //-------------------------------------------------------------------------------
    // Magnific Popup
    //-------------------------------------------------------------------------------
    if (typeof $.fn.magnificPopup === 'function') {
        $('.popup-youtube, .popup-vimeo, .popup-video').magnificPopup({ type: 'iframe' });
        $('.gallery-thumb').magnificPopup({
            type: 'image',
            gallery: {
                enabled: true
            }
        });
    }

    //-------------------------------------------------------------------------------
    // ion Range Sliders (Price filter)
    //-------------------------------------------------------------------------------
    if (typeof $.fn.ionRangeSlider === 'function') {
        $(".js-range-slider").ionRangeSlider();
    }

    //-------------------------------------------------------------------------------
    // Countdown
    //-------------------------------------------------------------------------------
    function makeTimer() {
        // Set a future date (current date + 30 days)
        var now = new Date();
        var endTime = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

        endTime = (Date.parse(endTime) / 1000);
        now = (Date.parse(now) / 1000);
        var timeLeft = endTime - now;

        if (timeLeft <= 0) {
            // Reset to a new future date when countdown reaches zero
            endTime = new Date(new Date().getTime() + (30 * 24 * 60 * 60 * 1000));
            endTime = (Date.parse(endTime) / 1000);
            timeLeft = endTime - now;
        }

        var days = Math.floor(timeLeft / 86400);
        var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
        var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600)) / 60);
        var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));

        if (hours < "10") { hours = "0" + hours; }
        if (minutes < "10") { minutes = "0" + minutes; }
        if (seconds < "10") { seconds = "0" + seconds; }

        $(".days").html(days);
        $(".hours").html(hours);
        $(".minutes").html(minutes);
        $(".seconds").html(seconds);
    }

    // Only run countdown if elements exist
    if ($(".days").length) {
        setInterval(function () { makeTimer(); }, 1000);
        makeTimer(); // Run immediately
    }

    //-------------------------------------------------------------------------------
    // Counter
    //-------------------------------------------------------------------------------
    if (typeof $.fn.countTo === 'function') {
        $(".counter").each(function () {
            var $this = $(this);
            $this.one('inview', function (event, isInView) {
                if (isInView) {
                    $this.countTo({ speed: 2000 });
                }
            });
        });
    }

    //-------------------------------------------------------------------------------
    // Checkout Notices
    //-------------------------------------------------------------------------------
    $(".sigma_notice a").on('click', function (e) {
        e.preventDefault();
        $(this).closest('.sigma_notice').next().slideToggle();
    });

    //-------------------------------------------------------------------------------
    // Progress bar on view
    //-------------------------------------------------------------------------------
    $(".sigma_progress-round").each(function () {
        var animateTo = $(this).data('to'),
            $this = $(this);
        $this.one('inview', function (event, isInView) {
            if (isInView) {
                $this.css({ 'stroke-dashoffset': animateTo });
            }
        });
    });

    $(".sigma_progress").each(function () {
        var progressBar = $(this).find(".progress-bar");
        var progressCount = $(this).find(".sigma_progress-count");
        $(progressBar).one('inview', function (event, isInView) {
            if (isInView) {
                $(progressBar).animate({
                    width: $(progressBar).attr("aria-valuenow") + "%"
                }, function () {
                    $(progressCount).animate({
                        left: $(progressBar).attr("aria-valuenow") + "%",
                        opacity: 1
                    });
                });
            }
        });
    });

    //-------------------------------------------------------------------------------
    // Sliders
    //-------------------------------------------------------------------------------
    if (typeof $.fn.slick === 'function') {
        $(".sigma_testimonial-slider").slick({
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: true,
            prevArrow: $('.testimonial-section .slider-prev'),
            nextArrow: $('.testimonial-section .slider-next'),
            dots: false,
            autoplay: true,
            responsive: [
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });

        $(".sigma_testimonial-slider-1").slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            dots: true,
            autoplay: true
        });

        $(".basic-dot-slider").slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            dots: true,
            autoplay: true
        });

        $(".banner-3 .sigma_banner-slider, .banner-1 .sigma_banner-slider, .banner-2 .sigma_banner-slider").slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: true,
            dots: false,
            autoplay: false,
            responsive: [
                {
                    breakpoint: 991,
                    settings: {
                        arrows: false
                    }
                }
            ]
        });

        $('.sigma_product-single-thumb .slider').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: true,
            asNavFor: '.sigma_product-single-thumb .slider-nav'
        });

        $('.sigma_product-single-thumb .slider-nav').slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            asNavFor: '.sigma_product-single-thumb .slider',
            dots: false,
            centerMode: false,
            arrows: false,
            focusOnSelect: false
        });

        $(".portfolio-slider").slick({
            slidesToShow: 2,
            slidesToScroll: 1,
            arrows: true,
            dots: false,
            autoplay: false,
            prevArrow: $('.portfolio-section .slider-prev'),
            nextArrow: $('.portfolio-section .slider-next'),
            responsive: [
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 1
                    }
                }
            ]
        });
    }

    //-------------------------------------------------------------------------------
    // Masonry
    //-------------------------------------------------------------------------------
    if (typeof $.fn.imagesLoaded === 'function' && typeof $.fn.isotope === 'function') {
        $('.masonry').imagesLoaded(function () {
            var isotopeContainer = $('.masonry');
            isotopeContainer.isotope({ itemSelector: '.masonry-item' });
        });
    }

    //-------------------------------------------------------------------------------
    // Isotope
    //-------------------------------------------------------------------------------
    function doIsotope() {
        var $portfolioGrid = '';

        if (typeof $.fn.imagesLoaded === 'function' && typeof $.fn.isotope === 'function') {
            $('.masonry').imagesLoaded(function () {
                $portfolioGrid = $('.portfolio-filter').isotope({
                    itemSelector: '.col-lg-4',
                    percentPosition: true,
                    masonry: {
                        columnWidth: '.col-lg-4'
                    }
                });
            });

            $('.filter-items').on('click', '.portfolio-trigger', function () {
                var filterValue = $(this).attr('data-filter');
                $portfolioGrid.isotope({ filter: filterValue });
            });

            $('.portfolio-trigger').on('click', function (e) {
                $(this).closest('.filter-items').find('.active').removeClass('active');
                $(this).addClass('active');
                e.preventDefault();
            });
        }
    }

    doIsotope();

    //-------------------------------------------------------------------------------
    // Add / Subtract Quantity
    //-------------------------------------------------------------------------------
    $(".qty span").on('click', function () {
        var qty = $(this).closest('.qty').find('input');
        var qtyVal = parseInt(qty.val()) || 0;
        if ($(this).hasClass('qty-add')) {
            qty.val(qtyVal + 1);
        } else {
            qty.val(qtyVal > 1 ? qtyVal - 1 : 1);
        }
    });

    //-------------------------------------------------------------------------------
    // Initialize WOW.js if available
    //-------------------------------------------------------------------------------
    if (typeof window.WOW !== 'undefined') {
        new window.WOW().init();
    }

    //-------------------------------------------------------------------------------
    // Logo Click Handler
    //-------------------------------------------------------------------------------
    const HOME_PAGE_URL = "index.html";
    const spiritualLogo = document.getElementById("spiritualLogo");

    if (spiritualLogo) {
        spiritualLogo.addEventListener("click", () => {
            window.location.href = HOME_PAGE_URL;
        });
    } else {
        // console.warn("Element with ID 'spiritualLogo' not found.");
    }

    //-------------------------------------------------------------------------------
    // Mobile Menu Functionality
    //-------------------------------------------------------------------------------
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileNavClose = document.querySelector('.mobile-nav-close');
    const desktopMenuItems = document.querySelectorAll('.desktop-menu > .menu-item-has-children > .menu-link');

    // Check if touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    function openMobileMenu() {
        if (mobileNav && mobileNavOverlay && mobileMenuBtn) {
            mobileNav.classList.add('active');
            mobileNavOverlay.classList.add('active');
            mobileMenuBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        if (mobileNav && mobileNavOverlay && mobileMenuBtn) {
            mobileNav.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.style.overflow = '';

            // Close all dropdowns
            document.querySelectorAll('.mobile-nav-list .menu-item-has-children').forEach(item => {
                item.classList.remove('dropdown-open');
            });
        }
    }

    // Mobile menu event listeners
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }

    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileMenu);
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
    }

    // Mobile dropdown toggle
    const mobileMenuItems = document.querySelectorAll('.mobile-nav-list .menu-item-has-children > .menu-link');

    mobileMenuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const parent = this.parentElement;

            // Close other dropdowns
            document.querySelectorAll('.mobile-nav-list .menu-item-has-children').forEach(otherItem => {
                if (otherItem !== parent) {
                    otherItem.classList.remove('dropdown-open');
                }
            });

            // Toggle current dropdown
            parent.classList.toggle('dropdown-open');
        });
    });

    // Desktop dropdown for touch devices
    if (isTouchDevice) {
        desktopMenuItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const parent = this.parentElement;

                // Close other dropdowns
                document.querySelectorAll('.desktop-menu > .menu-item-has-children').forEach(otherItem => {
                    if (otherItem !== parent) {
                        otherItem.classList.remove('dropdown-open');
                    }
                });

                // Toggle current dropdown
                parent.classList.toggle('dropdown-open');
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.desktop-menu')) {
                document.querySelectorAll('.desktop-menu > .menu-item-has-children').forEach(item => {
                    item.classList.remove('dropdown-open');
                });
            }
        });
    }

    //-------------------------------------------------------------------------------
    // Back to Top Button - Spiritual Animation
    //-------------------------------------------------------------------------------
    const backToTopButton = document.getElementById('backToTop');

    if (backToTopButton) {
        // Show/hide the button based on scroll position
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        // Scroll to top when button is clicked
        backToTopButton.addEventListener('click', function (e) {
            e.preventDefault();

            // Add divine ascent class to trigger animation
            backToTopButton.classList.add('divine-ascent');

            // Scroll to top after animation starts
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 200); // Small delay to let animation start

            // Remove divine ascent class after animation completes
            setTimeout(() => {
                backToTopButton.classList.remove('divine-ascent');
            }, 1500); // Match animation duration
        });
    }
//-------------------------------------------------------------------------------
// STEP 3: Mobile Nav Active Page Highlight
//-------------------------------------------------------------------------------
(function () {

    // Get current page name
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Loop through all mobile menu links
    document.querySelectorAll('.mobile-nav .menu-link').forEach(link => {

        const linkPage = link.getAttribute('href');

        // Skip empty or #
        if (!linkPage || linkPage === '#') return;

        // Match current page
        if (linkPage === currentPage) {

            // Highlight link
            link.classList.add('active');

            // Open parent dropdown if exists
            const parentDropdown = link.closest('.menu-item-has-children');
            if (parentDropdown) {
                parentDropdown.classList.add('dropdown-open');
            }
        }
    });

})();

    //-------------------------------------------------------------------------------
    // Animated Color Overlay
    //-------------------------------------------------------------------------------
    const overlay = document.querySelector('.animated-color-overlay');
    const container = overlay ? overlay.parentElement : null;

    if (overlay && container) {
        let lastScrollY = window.scrollY;
        let transitionTriggered = false;

        // Initialize at bottom (fully hidden)
        overlay.style.transform = "translateY(100%)";

        // Reset function
        function resetOverlay() {
            overlay.style.transition = "none";
            overlay.style.transform = "translateY(100%)"; // reset to bottom
            requestAnimationFrame(() => {
                overlay.style.transition = "transform 5s ease-out"; // set transition back
            });
            transitionTriggered = false;
        }

        window.addEventListener("scroll", () => {
            const rect = container.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const scrollingDown = window.scrollY > lastScrollY;

            // Reset when scrolling UP and the section is fully out of view
            if (!scrollingDown && (rect.bottom <= 0 || rect.top >= viewportHeight)) {
                resetOverlay();
            }

            if (scrollingDown && rect.top <= 0 && !transitionTriggered) {
                transitionTriggered = true;

                // Step 1: Rise from bottom (100%) to top (0%) over 5 seconds
                overlay.style.transform = "translateY(0%)";

                // Step 2: After reaching the top, settle at 35% from top
                overlay.addEventListener(
                    "transitionend",
                    function settle() {
                        // Change transition for the second, shorter animation
                        overlay.style.transition = "transform 2s ease-out";
                        overlay.style.transform = "translateY(35%)"; // reveals 65% of the background
                        // Remove the listener to prevent it from firing again
                        overlay.removeEventListener("transitionend", settle);
                    }
                );
            }

            lastScrollY = window.scrollY;
        });
    }

    //-------------------------------------------------------------------------------
    // Ripple Effect for Buttons
    //-------------------------------------------------------------------------------
    function createRipple(event) {
        const button = event.currentTarget;

        // Check if button already has a ripple
        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }

        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    // Add ripple to all icon buttons and donate buttons
    document.querySelectorAll('.icon-btn, .donate-btn').forEach(button => {
        button.addEventListener('click', createRipple);
    });

    //-------------------------------------------------------------------------------
    // Smooth Scroll for Anchor Links
    //-------------------------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    //-------------------------------------------------------------------------------
    // Window Resize Handler
    //-------------------------------------------------------------------------------
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            // Close mobile menu on resize to desktop
            if (window.innerWidth >= 993) {
                closeMobileMenu();
            }
        }, 250);
    });

    //-------------------------------------------------------------------------------
    // Scroll Event Handler
    //-------------------------------------------------------------------------------
    window.addEventListener('scroll', function () {
        doSticky();
    });

    //-------------------------------------------------------------------------------
    // Initial Function Calls
    //-------------------------------------------------------------------------------
    doSticky();

})(window.jQuery);
}

document.addEventListener('DOMContentLoaded', () => {
            const track = document.querySelector('.kv-marquee-track');
            
            if (!track) return;

            // Check for Reduced Motion preference in OS
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            let scrollPos = 0;
            const baseSpeed = 1; // Pixels per frame
            let currentSpeed = prefersReducedMotion ? 0 : baseSpeed;
            let boundary = 0;

            const updateBoundary = () => {
                boundary = track.scrollWidth / 2;
            };

            updateBoundary();
            window.addEventListener('resize', updateBoundary);
            if (typeof ResizeObserver !== 'undefined') {
                const marqueeResizeObserver = new ResizeObserver(updateBoundary);
                marqueeResizeObserver.observe(track);
            }

            function animate() {
                // 1. Move track
                scrollPos -= currentSpeed;

                // 3. Seamless Reset
                if (boundary > 0 && Math.abs(scrollPos) >= boundary) {
                    scrollPos = 0;
                }

                // 4. Apply transform
                track.style.transform = `translateX(${scrollPos}px)`;

                // 5. Loop (only if speed is not 0)
                if(currentSpeed !== 0 || scrollPos !== 0) {
                     requestAnimationFrame(animate);
                }
            }

            // Start animation (unless reduced motion)
            if (!prefersReducedMotion) {
                requestAnimationFrame(animate);
            }
            
            // Listen for changes in preference
            window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
                 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                     currentSpeed = 0;
                     track.style.transform = 'translateX(0)'; // Reset to start
                 } else {
                     currentSpeed = baseSpeed;
                     requestAnimationFrame(animate);
                 }
            });
        });

        // SLIDESHOW FUNCTIONALITY
        document.addEventListener('DOMContentLoaded', () => {
            // Updated Selectors to match new class names
            const slides = document.querySelectorAll('.slideshow-slide');
            const dotsContainer = document.getElementById('galleryDots');
            const prevBtn = document.querySelector('.prev-button');
            const nextBtn = document.querySelector('.next-button');
            
            // Safety Check: Stop if essential elements are missing
            if (!slides.length || !dotsContainer) return;
            
            let currentSlide = 0;
            let slideInterval;
            const intervalTime = 5000; 

            // Initialize Dots
            slides.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.classList.add('dot-marker'); // Updated class
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    goToSlide(index);
                    resetTimer();
                });
                dotsContainer.appendChild(dot);
            });

            const dots = document.querySelectorAll('.dot-marker');

            // Functions to switch slides
            function goToSlide(n) {
                slides[currentSlide].classList.remove('active');
                dots[currentSlide].classList.remove('active');

                currentSlide = (n + slides.length) % slides.length;

                slides[currentSlide].classList.add('active');
                dots[currentSlide].classList.add('active');
            }

            function nextSlide() {
                goToSlide(currentSlide + 1);
            }

            function prevSlide() {
                goToSlide(currentSlide - 1);
            }

            // Auto Play
            function startTimer() {
                slideInterval = setInterval(nextSlide, intervalTime);
            }

            function resetTimer() {
                clearInterval(slideInterval);
                startTimer();
            }

            // Event Listeners
            // Added check (if (nextBtn)) to prevent error if element doesn't exist
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    nextSlide();
                    resetTimer();
                });
            }

            // Added check (if (prevBtn)) to prevent error if element doesn't exist
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    prevSlide();
                    resetTimer();
                });
            }

            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') {
                    nextSlide();
                    resetTimer();
                } else if (e.key === 'ArrowLeft') {
                    prevSlide();
                    resetTimer();
                }
            });

            startTimer();
        });

        // 1. SPONSOR MARQUEE
        // Make sure your HTML has an element with ID="sponsorTrack"
        document.addEventListener("DOMContentLoaded", function () {
            const track = document.getElementById('sponsorTrack');
            if (!track) return;

            const originalContent = track.innerHTML;
            // Duplicate content 2 times to create a strip of 3 identical sets
            track.innerHTML = originalContent; 
            track.innerHTML += originalContent; 
            track.innerHTML += originalContent; 

            let scrollPos = 0;
            const speed = 1.5; // Adjust speed here
            let isPaused = false;

            function scrollSponsors() {
                if (!isPaused) {
                    scrollPos -= speed;
                    const singleSetWidth = track.scrollWidth / 3;
                    if (Math.abs(scrollPos) >= singleSetWidth) {
                        scrollPos = 0;
                    }
                    track.style.transform = `translateX(${scrollPos}px)`;
                }
                requestAnimationFrame(scrollSponsors);
            }

            scrollSponsors();
            track.addEventListener('mouseenter', () => isPaused = true);
            track.addEventListener('mouseleave', () => isPaused = false);
        });

        // 2. CHIEF GUEST MARQUEE
        // Make sure your HTML has an element with class="cg-slider-track"
        document.addEventListener("DOMContentLoaded", function () {
            const track = document.querySelector('.cg-slider-track');
            if (!track) return; 

            // NOTE: Ensure '.cg-slider-track' has CSS display: flex
            // e.g. .cg-slider-track { display: flex; gap: 20px; width: max-content; }

            const originalContent = track.innerHTML;
            // Duplicate content 2 times to create a strip of 3 identical sets
            track.innerHTML = originalContent; 
            track.innerHTML += originalContent; 
            track.innerHTML += originalContent; 

            let scrollPos = 0;
            const speed = 1.35; // Adjust speed here
            let isPaused = false;

            function scrollGuests() {
                if (!isPaused) {
                    scrollPos -= speed;
                    const singleSetWidth = track.scrollWidth / 3;
                    if (Math.abs(scrollPos) >= singleSetWidth) {
                        scrollPos = 0;
                    }
                    track.style.transform = `translateX(${scrollPos}px)`;
                }
                requestAnimationFrame(scrollGuests);
            }

            scrollGuests();
            track.addEventListener('mouseenter', () => isPaused = true);
            track.addEventListener('mouseleave', () => isPaused = false);
        });

        // Sri Bala page namespace hook
        document.addEventListener("DOMContentLoaded", function () {
            const sbmMain = document.querySelector('.sbm-page-main');
            if (!sbmMain) return;
            sbmMain.classList.add('sbm-ready');
        });

// -------------------------------------------------------------------------------
// Asta Varahi Brand Scrolling (migrated from brand-scrolling.js)
// -------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const brandSlider = document.querySelector(".jv-brand-slider");
    const brandCards = document.querySelectorAll(".jv-brand-card");
    if (!brandSlider || !brandCards.length) return;

    const totalOriginalCards = brandCards.length / 2;

    brandSlider.style.width = brandCards.length * 100 + "%";

    brandCards.forEach((card) => {
        card.style.minWidth = "768px";
        card.style.maxWidth = "950px";
    });

    const styleSheet = document.styleSheets[0];
    let keyframeRules;

    for (let i = 0; i < styleSheet.cssRules.length; i++) {
        if (
            styleSheet.cssRules[i].type === CSSRule.KEYFRAMES_RULE &&
            styleSheet.cssRules[i].name === "jv-slide"
        ) {
            keyframeRules = styleSheet.cssRules[i];
            break;
        }
    }

    const slidePercentage = (totalOriginalCards / brandCards.length) * 100;

    if (keyframeRules) {
        for (let i = 0; i < keyframeRules.cssRules.length; i++) {
            const rule = keyframeRules.cssRules[i];
            if (rule.keyText === "100%") {
                rule.style.transform = `translateX(-${slidePercentage}%)`;
                break;
            }
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.cg-slider-track');
    const container = document.querySelector('.cg-showcase');
    const cards = document.querySelectorAll('.cg-card');
    if (!track || !container || !cards.length) return;

    cards.forEach((card) => {
        card.style.maxWidth = "950px";
    });

    let scrollPos = 0;
    const baseSpeed = 1.5;
    let currentSpeed = baseSpeed;

    container.addEventListener('mouseenter', () => {
        currentSpeed = 0;
    });

    container.addEventListener('mouseleave', () => {
        currentSpeed = baseSpeed;
    });

    function animate() {
        scrollPos -= currentSpeed;
        const trackWidth = track.scrollWidth;
        const boundary = trackWidth / 2;

        if (Math.abs(scrollPos) >= boundary) {
            scrollPos = 0;
        }

        track.style.transform = `translate3d(${scrollPos}px, 0, 0)`;
        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
});

// -------------------------------------------------------------------------------
// SPA-safe initializers (run immediately + on DOM changes)
// -------------------------------------------------------------------------------
(function () {
    function initSponsorScroll() {
        const track = document.getElementById('sponsorTrack');
        if (!track || track.dataset.sponsorInit === 'true') return;
        track.dataset.sponsorInit = 'true';

        const originalContent = track.innerHTML;
        track.innerHTML = originalContent;
        track.innerHTML += originalContent;
        track.innerHTML += originalContent;

        let scrollPos = 0;
        const speed = 1.5;
        let isPaused = false;

        function scrollSponsors() {
            if (!isPaused) {
                scrollPos -= speed;
                const singleSetWidth = track.scrollWidth / 3;
                if (Math.abs(scrollPos) >= singleSetWidth) {
                    scrollPos = 0;
                }
                track.style.transform = `translateX(${scrollPos}px)`;
            }
            requestAnimationFrame(scrollSponsors);
        }

        scrollSponsors();
        track.addEventListener('mouseenter', () => { isPaused = true; });
        track.addEventListener('mouseleave', () => { isPaused = false; });
    }

    function initGuestScroll() {
        const track = document.querySelector('.cg-slider-track');
        const container = document.querySelector('.cg-showcase');
        const cards = document.querySelectorAll('.cg-card');
        if (!track || !container || !cards.length || track.dataset.cgInit === 'true') return;
        track.dataset.cgInit = 'true';

        cards.forEach((card) => {
            card.style.maxWidth = '950px';
        });

        let scrollPos = 0;
        const baseSpeed = 1.5;
        let currentSpeed = baseSpeed;

        container.addEventListener('mouseenter', () => { currentSpeed = 0; });
        container.addEventListener('mouseleave', () => { currentSpeed = baseSpeed; });

        function animate() {
            scrollPos -= currentSpeed;
            const trackWidth = track.scrollWidth;
            const boundary = trackWidth / 2;

            if (Math.abs(scrollPos) >= boundary) {
                scrollPos = 0;
            }

            track.style.transform = `translate3d(${scrollPos}px, 0, 0)`;
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    function initBrandScroll() {
        const brandSlider = document.querySelector('.jv-brand-slider');
        const brandCards = document.querySelectorAll('.jv-brand-card');
        if (!brandSlider || !brandCards.length || brandSlider.dataset.brandInit === 'true') return;
        brandSlider.dataset.brandInit = 'true';

        const totalOriginalCards = brandCards.length / 2;
        brandSlider.style.width = brandCards.length * 100 + '%';

        brandCards.forEach((card) => {
            card.style.minWidth = '768px';
            card.style.maxWidth = '950px';
        });

        try {
            const styleSheet = document.styleSheets[0];
            let keyframeRules;

            for (let i = 0; i < styleSheet.cssRules.length; i++) {
                if (
                    styleSheet.cssRules[i].type === CSSRule.KEYFRAMES_RULE &&
                    styleSheet.cssRules[i].name === 'jv-slide'
                ) {
                    keyframeRules = styleSheet.cssRules[i];
                    break;
                }
            }

            const slidePercentage = (totalOriginalCards / brandCards.length) * 100;

            if (keyframeRules) {
                for (let i = 0; i < keyframeRules.cssRules.length; i++) {
                    const rule = keyframeRules.cssRules[i];
                    if (rule.keyText === '100%') {
                        rule.style.transform = `translateX(-${slidePercentage}%)`;
                        break;
                    }
                }
            }
        } catch {

            // Ignore stylesheet access errors (cross-origin or unavailable)
        }
    }

    function initAll() {
        initSponsorScroll();
        initGuestScroll();
        initBrandScroll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    const observer = new MutationObserver(() => {
        initAll();
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
