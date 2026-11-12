import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx';
import { getPublicDonationArchive } from '../api/paymentAPI.js';
import { DonationArchiveTable, DonationArchiveFilters, KosalaStats } from '../components/kosala';

const KosalaDonationArchive = () => {
  const [archiveData, setArchiveData] = useState([]);
  const [archiveTotal, setArchiveTotal] = useState(0);
  const [archiveStats, setArchiveStats] = useState({ total_cows: 24, adopted_cows: 18, total_donations: 0, total_amount: 0 });
  const [archivePage, setArchivePage] = useState(1);
  const [archiveTotalPages, setArchiveTotalPages] = useState(1);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveCategory, setArchiveCategory] = useState('all');
  const [archiveLoading, setArchiveLoading] = useState(false);

  const fetchArchive = async () => {
    setArchiveLoading(true);
    try {
      const res = await getPublicDonationArchive({
        page: archivePage,
        limit: 12,
        category: archiveCategory,
        search: archiveSearch,
      });
      if (res?.success) {
        setArchiveData(res.rows || []);
        setArchiveTotal(res.total || 0);
        setArchiveTotalPages(res.totalPages || 1);
        if (res.stats) setArchiveStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to fetch public donation archive:', err);
    } finally {
      setArchiveLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, [archivePage, archiveCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setArchivePage(1);
    fetchArchive();
  };

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const formatDate = (val) =>
    val ? new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="kosala-page">
      <Helmet>
        <title>Kosala Public Donation Archive & Ledger | Jai Varahi Peedam</title>
        <meta
          name="description"
          content="Transparency builds faith. Search and verify public records of contributions made for sacred cow feeding, medical care, and shelter at Sri Jai Varahi Peedam."
        />
        <link rel="canonical" href="https://jaivarahi.org/kosala/archive" />
      </Helmet>

      <Header />

      <KosalaStats stats={archiveStats} />

      <section className="kosala-archive-section">
        <div className="site-container">
          <div className="section-header-centered">
            <span className="section-tag">கோசாலை வெளிப்படைத்தன்மை பதிவேடு</span>
            <h1 className="section-heading">Public Donation Ledger &amp; Receipts</h1>
            <p className="section-desc">
              Transparency builds faith. View official records of verified contributions supporting cow care,
              and download digital receipts for authorized transactions.
            </p>
          </div>

          <div className="archive-card-wrapper">
            <DonationArchiveFilters
              search={archiveSearch}
              setSearch={setArchiveSearch}
              onSearchSubmit={handleSearchSubmit}
              category={archiveCategory}
              setCategory={setArchiveCategory}
              onCategoryChange={() => setArchivePage(1)}
              onDonateClick={() => {}}
            />

            <DonationArchiveTable
              archiveData={archiveData}
              archiveTotal={archiveTotal}
              archiveLoading={archiveLoading}
              archivePage={archivePage}
              archiveTotalPages={archiveTotalPages}
              setArchivePage={setArchivePage}
              formatINR={formatINR}
              formatDate={formatDate}
            />
          </div>

          <div className="text-center mt-5">
            <Link to="/kosala/donate" className="btn-hero-primary">
              <i className="fas fa-hand-holding-heart"></i> Make a New Offering
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <FloatActions />
    </div>
  );
};

export default KosalaDonationArchive;
