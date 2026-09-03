import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Preloader from './components/common/Preloader.jsx';
import useDeferredScript from './hooks/useDeferredScript.js';

// Lazy-loaded routes for smaller initial bundle
const Home = lazy(() => import('./pages/Home.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const AstaVarahi = lazy(() => import('./pages/AstaVarahi.jsx'));
const AstaVarahi2 = lazy(() => import('./pages/AstaVarahi2.jsx'));
const Calendar = lazy(() => import('./pages/Calendar.jsx'));
const Payment = lazy(() => import('./pages/Payment.jsx'));
const ComingSoon = lazy(() => import('./pages/ComingSoon.jsx'));
const SriBalaManthiram = lazy(() => import('./pages/SriBalaManthiram.jsx'));
const VarahiMalai = lazy(() => import('./pages/VarahiMalai.jsx'));
const Jothidam = lazy(() => import('./pages/Jothidam.jsx'));
const JothidamBookingPage = lazy(() => import('./pages/JothidamBookingPage.jsx'));
const WhoIsVarahi = lazy(() => import('./pages/WhoIsVarahi.jsx'));
const UchchishtaGanapati = lazy(() => import('./pages/UchchishtaGanapati.jsx'));
const AshadaNavarathiri = lazy(() => import('./pages/AshadaNavarathiri.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const TermsCondition = lazy(() => import('./pages/TermsCondition.jsx'));
const Services = lazy(() => import('./pages/Services.jsx'));
const BookPooja = lazy(() => import('./pages/BookPooja.jsx'));
const DevoteesDetails = lazy(() => import('./components/forms/DevoteesDetails.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const AdminApp = lazy(() => import('./components/admin/AdminApp.jsx'));
const Blog = lazy(() => import('./pages/Blog.jsx'));
const BlogDetail = lazy(() => import('./pages/BlogDetail.jsx'));

import ErrorBoundary from './components/common/ErrorBoundary.jsx';

function App() {
  useDeferredScript('/assets/js/main.js', {
    id: 'main-js',
    waitForSelector: '#main-content',
  });

  return (
    <ErrorBoundary>
      <Suspense fallback={<Preloader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/astavarahi" element={<AstaVarahi />} />
        <Route path="/astavarahi2" element={<AstaVarahi2 />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/comingsoon" element={<ComingSoon />} />
        <Route path="/sri_bala_manthiram" element={<SriBalaManthiram />} />
        <Route path="/varahimalai" element={<VarahiMalai />} />
        <Route path="/Jothidam" element={<Jothidam />} />
        <Route path="/Jothidam/book" element={<JothidamBookingPage />} />
        <Route path="/who_is_varahi" element={<WhoIsVarahi />} />
        <Route path="/Uchchishta_Ganapati" element={<UchchishtaGanapati />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-condition" element={<TermsCondition />} />
        <Route path="/services" element={<Services />} />
        <Route path="/book-pooja" element={<BookPooja />} />
        {/* Fallbacks for unspecified routes used in nav */}
        <Route path="/ashada_navarathiri" element={<AshadaNavarathiri />} />
        
        {/* Blog Routes */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        
        {/* Admin Dashboard */}
        <Route path="/admin/*" element={<AdminApp />} />
        <Route path="/devoteesdetails" element={<DevoteesDetails />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  </ErrorBoundary>
  );
}

export default App;
