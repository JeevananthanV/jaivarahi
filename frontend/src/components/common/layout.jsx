import Preloader from './Preloader.jsx'
import MainNav from './mainnav.jsx'
import MobileNav from './mobilenav.jsx'
import FloatAction from './floataction.jsx'
import Footer from './footer.jsx'

function Layout({
  children,
  navItems = [],
  isMobileOpen = false,
  activeMobileDropdown = null,
  onOpenMobile = () => {},
  onCloseMobile = () => {},
  onToggleDropdown = () => {},
  showPreloader = false,
  preloaderHidden = false,
  showFloatAction = true,
  showFooter = true,
}) {
  return (
    <>
      {showPreloader && <Preloader hidden={preloaderHidden} />}
      <MainNav items={navItems} onOpenMobile={onOpenMobile} isMobileOpen={isMobileOpen} />
      <MobileNav
        items={navItems}
        isOpen={isMobileOpen}
        activeDropdown={activeMobileDropdown}
        onClose={onCloseMobile}
        onToggleDropdown={onToggleDropdown}
      />
      <div
        className={`mobile-nav-overlay${isMobileOpen ? ' active' : ''}`}
        onClick={onCloseMobile}
        role="presentation"
      />
      {children}
      {showFloatAction && <FloatAction />}
      {showFooter && <Footer />}
    </>
  )
}

export default Layout
