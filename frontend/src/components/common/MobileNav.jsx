function MobileNav({ items, isOpen, activeDropdown, onClose, onToggleDropdown }) {
  return (
    <div className={`mobile-nav${isOpen ? ' active' : ''}`}>
      <div className="mobile-nav-header">
        <div className="site-branding">
          <a href="/payment" className="donate-btn">
            Donate Now
          </a>
        </div>
        <button className="mobile-nav-close" aria-label="Close Navigation Menu" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>

      <ul className="mobile-nav-list">
        {items.map((item) => {
          const hasChildren = Boolean(item.children)
          const isOpenDropdown = activeDropdown === item.label
          const itemClasses = [
            'menu-item',
            hasChildren ? 'menu-item-has-children' : '',
            hasChildren && isOpenDropdown ? 'dropdown-open' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <li key={item.label} className={itemClasses}>
              <a
                href={item.href}
                className="menu-link"
                onClick={(event) => {
                  if (hasChildren) {
                    event.preventDefault()
                    onToggleDropdown(item.label)
                  } else {
                    onClose()
                  }
                }}
              >
                {item.label}
              </a>
              {hasChildren && (
                <ul className="mobile-dropdown">
                  {item.children.map((child) => (
                    <li key={child.label} className="menu-item">
                      <a href={child.href} className="menu-link" onClick={onClose}>
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      <div className="mobile-nav-actions">
        <a href="tel:+919092878389" className="icon-btn" aria-label="Call">
          <i className="fas fa-phone"></i>
        </a>
        <a href="/calendar" className="icon-btn" aria-label="Calendar">
          <i className="fas fa-calendar-days"></i>
        </a>
      </div>
    </div>
  )
}

export default MobileNav

