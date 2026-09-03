document.addEventListener("DOMContentLoaded", function () {
  // Get all required elements
  const brandSlider = document.querySelector(".jv-brand-slider");
  const brandCards = document.querySelectorAll(".jv-brand-card");
  const totalOriginalCards = brandCards.length / 2; // We have duplicated cards for smooth scrolling

  // Calculate and set the width for the slider and cards
  brandSlider.style.width = brandCards.length * 100 + "%";

  brandCards.forEach((card) => {
    card.style.minWidth = "768px";
    card.style.maxWidth = "950px";
  });

  // Update the animation keyframe for smooth scrolling
  const styleSheet = document.styleSheets[0];
  let keyframeRules;

  // Find the animation keyframes
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    if (
      styleSheet.cssRules[i].type === CSSRule.KEYFRAMES_RULE &&
      styleSheet.cssRules[i].name === "jv-slide"
    ) {
      keyframeRules = styleSheet.cssRules[i];
      break;
    }
  }

  // Calculate how much to slide (should be equal to the width of original cards)
  const slidePercentage = (totalOriginalCards / brandCards.length) * 100;

  // Update the animation keyframes if found
  if (keyframeRules) {
    // Find the 100% keyframe and update it
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
            // 1. Select Elements
            const track = document.querySelector('.cg-slider-track');
            const container = document.querySelector('.cg-showcase');
            const cards = document.querySelectorAll('.cg-card');

            // 2. Width Control Logic (As requested)
            // This ensures the cards have a width between 768px and 950px
            cards.forEach((card) => {
                // card.style.minWidth = "768px";
                card.style.maxWidth = "950px";
            });

            // 3. Smooth Scroll Loop Logic
            let scrollPos = 0;
            const baseSpeed = 1.5; // Pixels to move per frame
            let currentSpeed = baseSpeed;
            
            // Hover to Stop Logic
            container.addEventListener('mouseenter', () => {
                currentSpeed = 0; // Stop scrolling
            });

            container.addEventListener('mouseleave', () => {
                currentSpeed = baseSpeed; // Resume scrolling
            });

            function animate() {
                // Move the track
                scrollPos -= currentSpeed;
                
                // Calculate boundary
                // The track is duplicated (Original + Copy).
                // The loop resets when we scroll half the total width.
                const trackWidth = track.scrollWidth;
                const boundary = trackWidth / 2;

                // Seamless Reset Logic
                // If we pass the halfway point, jump back to start.
                if (Math.abs(scrollPos) >= boundary) {
                    scrollPos = 0;
                }

                // Apply transform (using translate3d for hardware acceleration)
                track.style.transform = `translate3d(${scrollPos}px, 0, 0)`;

                // Request the next frame
                requestAnimationFrame(animate);
            }

            // Start the animation loop
            requestAnimationFrame(animate);
        });