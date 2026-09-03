import { Helmet } from 'react-helmet-async';
import Preloader from '../components/common/Preloader.jsx';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';

function NotFound() {
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Events', href: '/comingsoon' },
    { label: 'Blog', href: '/blog' },
    { label: 'Donation', href: '/payment' },
  ];

  return (
    <>
      <Helmet>
        <title>Page Not Found | Jai Varahi Peedam</title>
        <meta name="description" content="The requested page could not be found." />
      </Helmet>
      <Preloader />
      <Navbar items={navItems} />
      <main id="main-content" className="av-notfound">
        <section className="av-notfound__hero">
          <div className="av-notfound__card">
            <p className="av-notfound__eyebrow">404</p>
            <h1>Page Not Found</h1>
            <p>
              The page you are looking for does not exist, or the link may be incorrect.
            </p>
            <div className="av-notfound__actions">
              <a className="an-btn an-btn-primary" href="/">
                Go Home
              </a>
              <a className="an-btn an-btn-ghost" href="/comingsoon">
                View Updates
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default NotFound;
