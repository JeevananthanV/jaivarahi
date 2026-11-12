import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DEFAULT_NAV_ITEMS } from '../../data/navItems.js';

const MobileNav = ({
  items = DEFAULT_NAV_ITEMS,
  isOpen = false,
  activeDropdown,
  onClose = () => {},
  onToggleDropdown,
  hideOverlay = false,
}) => {
  const location = useLocation();
  const [internalActiveDropdown, setInternalActiveDropdown] = useState(null);

  // Auto-close menu when route changes
  useEffect(() => {
    onClose();
    setInternalActiveDropdown(null);
  }, [location.pathname]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currentActiveDropdown = activeDropdown !== undefined ? activeDropdown : internalActiveDropdown;

  const handleDropdownToggle = (label) => {
    if (onToggleDropdown) {
      onToggleDropdown(label);
    } else {
      setInternalActiveDropdown((prev) => (prev === label ? null : label));
    }
  };

  const handleLeafClick = () => {
    onClose();
  };

  const navItemsList = items && items.length > 0 ? items : DEFAULT_NAV_ITEMS;

  return (
    <>
      <div
        className={`mobile-nav ${isOpen ? 'active' : ''}`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-label="Mobile Navigation Menu"
      >
        <div className="mobile-nav-header">
          <div className="site-branding">
            <Link to="/payment" className="donate-btn" onClick={handleLeafClick}>
              Donate Now
            </Link>
          </div>
          <button
            type="button"
            className="mobile-nav-close"
            aria-label="Close Navigation Menu"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <ul className="mobile-nav-list">
          {navItemsList.map((item) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isDropdownOpen = currentActiveDropdown === item.label;

            const itemClasses = [
              'menu-item',
              hasChildren ? 'menu-item-has-children' : '',
              hasChildren && isDropdownOpen ? 'dropdown-open' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <li key={item.label} className={itemClasses}>
                {hasChildren ? (
                  <button
                    type="button"
                    className="menu-link w-100 text-left border-0 bg-transparent"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDropdownToggle(item.label);
                    }}
                    aria-expanded={isDropdownOpen}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    to={item.href || '/'}
                    className="menu-link"
                    onClick={handleLeafClick}
                  >
                    {item.label}
                  </Link>
                )}

                {hasChildren && (
                  <ul className="mobile-dropdown">
                    {item.children.map((child) => (
                      <li key={child.label} className="menu-item">
                        <Link
                          to={child.href}
                          className="menu-link"
                          onClick={handleLeafClick}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mobile-nav-actions">
          <a href="tel:+919092878389" className="icon-btn" aria-label="Call Temple Helpline">
            <i className="fas fa-phone"></i>
          </a>
          <Link to="/calendar" className="icon-btn" aria-label="Calendar" onClick={handleLeafClick}>
            <i className="fas fa-calendar-days"></i>
          </Link>
        </div>
      </div>

      {/* Built-in Backdrop Overlay */}
      {!hideOverlay && (
        <div
          className={`mobile-nav-overlay ${isOpen ? 'active' : ''}`}
          onClick={onClose}
          role="presentation"
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default MobileNav;
