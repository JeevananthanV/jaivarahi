import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_NAV_ITEMS } from '../../data/navItems.js';
import MobileNav from './MobileNav.jsx';

function Navbar({ items = DEFAULT_NAV_ITEMS, onOpenMobile, onCloseMobile, isMobileOpen, includeMobileNav = false }) {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isControlled = onOpenMobile !== undefined;
  const mobileOpen = isControlled ? Boolean(isMobileOpen) : internalMobileOpen;
  const handleOpen = isControlled ? onOpenMobile : () => setInternalMobileOpen(true);
  const handleClose = onCloseMobile ? onCloseMobile : () => setInternalMobileOpen(false);

  const navItems = items && items.length > 0 ? items : DEFAULT_NAV_ITEMS;

  const handleParentClick = (event, hasChildren) => {
    if (hasChildren) {
      event.preventDefault();
    }
  };

  return (
    <>
      <nav className="main-navigation">
        <div className="site-container">
          <div className="site-branding">
            <Link to="/">
              <img
                src="/assets/img/images_new/VARAHI%20LOGO.svg"
                alt="Jai Varahi Peedam"
                className="site-logo"
              />
            </Link>
          </div>

          <div className="desktop-navigation">
            <ul className="desktop-menu">
              {navItems.map((item) => (
                <li
                  key={item.label}
                  className={`menu-item${item.children ? ' menu-item-has-children' : ''}`}
                >
                  <Link
                    to={item.href || '#'}
                    className="menu-link"
                    onClick={(event) => handleParentClick(event, Boolean(item.children))}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <ul className="desktop-dropdown">
                      {item.children.map((child) => (
                        <li key={child.label} className="menu-item">
                          <Link to={child.href} className="menu-link">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="desktop-actions">
            <a href="tel:+919092878389" className="icon-btn" aria-label="Call">
              <i className="fas fa-phone-alt"></i>
            </a>
            <Link to="/payment" className="donate-btn">
              Donate Now
            </Link>
            <Link to="/calendar" className="icon-btn" aria-label="Calendar">
              <i className="fas fa-calendar-days"></i>
            </Link>
          </div>

          <div
            className={`mobile-menu-btn${mobileOpen ? ' active' : ''}`}
            role="button"
            tabIndex={0}
            onClick={handleOpen}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                handleOpen();
              }
            }}
            aria-label="Open Navigation Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Auto-render MobileNav when not externally controlled */}
      {(!isControlled || includeMobileNav) && (
        <MobileNav
          items={navItems}
          isOpen={mobileOpen}
          onClose={handleClose}
        />
      )}
    </>
  );
}

export default Navbar;
