import { useEffect, useState } from 'react';

function Preloader({ hidden, autoHide = false }) {
  const [internalHidden, setInternalHidden] = useState(false);

  useEffect(() => {
    // If parent controls it, do not use internal timer
    if (hidden !== undefined) return undefined;
    if (!autoHide) return undefined;

    const rafId = window.requestAnimationFrame(() => {
      setInternalHidden(true);
      document.body.classList.add('loaded');
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [autoHide, hidden]);

  const isHidden = hidden !== undefined ? hidden : internalHidden;

  return (
    <div
      id="jaivarahiPreloader"
      className={`jaivarahi-preloader${isHidden ? ' hidden' : ''}`}
      role="status"
      aria-label="Loading"
    >
      <div className="divine-light"></div>
      <div className="spiritual-stage">
        <div className="om-symbol" aria-hidden="true">
          &#2384;
        </div>
        <img
          src="/VARAHI%20LOGO.svg"
          alt="Jaivarahi Spiritual Logo"
          width="120"
          height="120"
          className="logo-img"
        />
      </div>
      <div className="mantra">Jai Kottai Varahi</div>
    </div>
  );
}

export default Preloader;
