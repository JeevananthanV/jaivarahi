function Navbar({ items, onOpenMobile, isMobileOpen }) {
  const handleParentClick = (event, hasChildren) => {
    if (hasChildren) {
      event.preventDefault()
    }
  }

  return (
    <nav className="main-navigation">
      <div className="site-container">
        <div className="site-branding">
          <a href="/">
            <img
              src="/assets/img/images_new/VARAHI%20LOGO.svg"
              alt="Jai Varahi Peedam"
              className="site-logo"
            />
          </a>
        </div>

        <div className="desktop-navigation">
          <ul className="desktop-menu">
            {items.map((item) => (
              <li
                key={item.label}
                className={`menu-item${item.children ? ' menu-item-has-children' : ''}`}
              >
                <a
                  href={item.href}
                  className="menu-link"
                  onClick={(event) => handleParentClick(event, Boolean(item.children))}
                >
                  {item.label}
                </a>
                {item.children && (
                  <ul className="desktop-dropdown">
                    {item.children.map((child) => (
                      <li key={child.label} className="menu-item">
                        <a href={child.href} className="menu-link">
                          {child.label}
                        </a>
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
          <a href="/payment" className="donate-btn">
            Donate Now
          </a>
          <a href="/calendar" className="icon-btn" aria-label="Calendar">
            <i className="fas fa-calendar-days"></i>
          </a>
        </div>

        <div
          className={`mobile-menu-btn${isMobileOpen ? ' active' : ''}`}
          role="button"
          tabIndex={0}
          onClick={onOpenMobile}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              onOpenMobile()
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
  )
}

export default Navbar

