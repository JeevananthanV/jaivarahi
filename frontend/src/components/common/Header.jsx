import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Main Navbar */}
      <nav className="main-navigation">
        <div className="site-container">
          <div className="site-branding">
            <Link to="/">
              <img src="/assets/img/images_new/VARAHI LOGO.svg" alt="Jai Varahi Peedam" className="site-logo" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="desktop-navigation">
            <ul className="desktop-menu">
              <li className="menu-item"><Link to="/" className="menu-link">Home</Link></li>
              <li className="menu-item"><Link to="/about" className="menu-link">About</Link></li>
              <li className="menu-item menu-item-has-children">
                <Link to="#" className="menu-link">Ubasana</Link>
                <ul className="desktop-dropdown">
                  <li className="menu-item"><Link to="/varahimalai" className="menu-link">Varahi Malai</Link></li>
                  <li className="menu-item"><Link to="/who_is_varahi" className="menu-link">Who is varahi ?</Link></li>
                  <li className="menu-item"><Link to="/Uchchishta_Ganapati" className="menu-link">Uchchishta Ganapati</Link></li>
                  <li className="menu-item"><Link to="/sri_bala_manthiram" className="menu-link">Sri Bala manthiram</Link></li>
                </ul>
              </li>
              <li className="menu-item menu-item-has-children">
                <Link to="#" className="menu-link">Kosala</Link>
                <ul className="desktop-dropdown">
                  <li className="menu-item"><Link to="/payment" className="menu-link">Donation</Link></li>
                  <li className="menu-item"><Link to="/payment" className="menu-link">Donation Archive</Link></li>
                </ul>
              </li>
              <li className="menu-item menu-item-has-children">
                <Link to="#" className="menu-link">Jothidam</Link>
                <ul className="desktop-dropdown">
                  <li className="menu-item"><Link to="/Jothidam" className="menu-link">Astrology prediction</Link></li>
                  <li className="menu-item"><Link to="/comingsoon" className="menu-link">Sri Varahi Jothida Vidyalayam</Link></li>
                </ul>
              </li>
              <li className="menu-item menu-item-has-children">
                <Link to="#" className="menu-link">Events</Link>
                <ul className="desktop-dropdown">
                  <li className="menu-item"><Link to="/astavarahi" className="menu-link">Asta Varahi Dharshanam</Link></li>
                  <li className="menu-item"><Link to="/astavarahi2" className="menu-link">Asta Varahi 2.0</Link></li>
                  <li className="menu-item"><Link to="/ashada_navarathiri" className="menu-link">Ashada Navarathiri</Link></li>
                </ul>
              </li>
              <li className="menu-item"><Link to="/blog" className="menu-link">Blog</Link></li>
              <li className="menu-item"><Link to="/comingsoon" className="menu-link">Latest Updates</Link></li>
            </ul>
          </div>

          {/* Desktop Actions */}
          <div className="desktop-actions">
            <a href="tel:+919092878389" className="icon-btn" aria-label="Call"><i className="fas fa-phone-alt"></i></a>
            <Link to="/payment" className="donate-btn">Donate Now</Link>
            <Link to="/calendar" className="icon-btn" aria-label="Calendar">
              <i className="fas fa-calendar-days"></i>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-nav-header">
          <div className="site-branding">
            <Link to="/payment" className="donate-btn" onClick={() => setMobileMenuOpen(false)}>Donate Now</Link>
          </div>
        </div>
        
        <ul className="mobile-nav-list" onClick={(e) => {
          if (e.target.tagName === 'A') {
            setMobileMenuOpen(false);
          }
        }}>
          <li className="menu-item"><Link to="/" className="menu-link">Home</Link></li>
          <li className="menu-item"><Link to="/about" className="menu-link">About</Link></li>
          <li className="menu-item menu-item-has-children">
            <Link to="#" className="menu-link">Ubasana</Link>
            <ul className="mobile-dropdown">
              <li className="menu-item"><Link to="/varahimalai" className="menu-link">Varahi Malai</Link></li>
              <li className="menu-item"><Link to="/who_is_varahi" className="menu-link">Who is varahi ?</Link></li>
              <li className="menu-item"><Link to="/Uchchishta_Ganapati" className="menu-link">Uchchishta Ganapati</Link></li>
              <li className="menu-item"><Link to="/sri_bala_manthiram" className="menu-link">Sri Bala manthiram</Link></li>
            </ul>
          </li>
          <li className="menu-item menu-item-has-children">
            <Link to="#" className="menu-link">Kosala</Link>
            <ul className="mobile-dropdown">
              <li className="menu-item"><Link to="/payment" className="menu-link">Donation</Link></li>
              <li className="menu-item"><Link to="/payment" className="menu-link">Donation Archive</Link></li>
            </ul>
          </li>
          <li className="menu-item menu-item-has-children">
            <Link to="#" className="menu-link">Jothidam</Link>
            <ul className="mobile-dropdown">
              <li className="menu-item"><Link to="/Jothidam" className="menu-link">Astrology prediction</Link></li>
              <li className="menu-item"><Link to="/comingsoon" className="menu-link">Sri Varahi Jothida Vidyalayam</Link></li>
            </ul>
          </li>
          <li className="menu-item menu-item-has-children">
            <Link to="#" className="menu-link">Events</Link>
            <ul className="mobile-dropdown">
              <li className="menu-item"><Link to="/astavarahi" className="menu-link">Asta Varahi Dharshanam</Link></li>
              <li className="menu-item"><Link to="/astavarahi2" className="menu-link">Asta Varahi 2.0</Link></li>
              <li className="menu-item"><Link to="/ashada_navarathiri" className="menu-link">Ashada Navarathiri</Link></li>
            </ul>
          </li>
          <li className="menu-item"><Link to="/blog" className="menu-link">Blog</Link></li>
          <li className="menu-item"><Link to="/comingsoon" className="menu-link">Latest Updates</Link></li>
        </ul>
        
        <div className="mobile-nav-actions">
          <a href="tel:+919092878389" className="icon-btn" aria-label="Call">
            <i className="fas fa-phone"></i>
          </a>
          <Link to="/calendar" className="icon-btn" aria-label="Calendar">
            <i className="fas fa-calendar-days"></i>
          </Link>
        </div>
      </div>
      
      {/* Mobile nav overlay */}
      <div 
        className={`mobile-nav-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        style={{ display: mobileMenuOpen ? 'block' : 'none' }}
      ></div>
    </>
  );
};

export default Header;

