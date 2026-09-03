document.addEventListener("DOMContentLoaded", function () {
  // Function to animate counters
  function animateCounter(element, target) {
    const counter = element;
    const targetValue = parseInt(target);
    const duration = 2000; // Animation duration in milliseconds
    const step = Math.ceil(targetValue / (duration / 20)); // Increment step size

    let currentValue = 0;
    const timer = setInterval(() => {
      currentValue += step;
      if (currentValue >= targetValue) {
        counter.textContent = targetValue.toLocaleString() + "+";
        clearInterval(timer);
      } else {
        counter.textContent = currentValue.toLocaleString() + "+";
      }
    }, 20);
  }

  // Set up intersection observer for animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = counter.getAttribute("data-target");
          animateCounter(counter, target);
          observer.unobserve(counter);
        }
      });
    },
    { threshold: 0.5 }
  );

  // Observe all counter elements
  document.querySelectorAll(".stat-counter").forEach((counter) => {
    observer.observe(counter);
  });
});
