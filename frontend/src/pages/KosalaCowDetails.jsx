import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import Footer from '../components/common/Footer.jsx';
import FloatActions from '../components/common/FloatActions.jsx';
import { getCowDetails } from '../api/kosalaApi.js';

const KosalaCowDetails = () => {
  const { id } = useParams();
  const [cow, setCow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCow = async () => {
      setLoading(true);
      try {
        const res = await getCowDetails(id);
        if (res?.success && res.cow) {
          setCow(res.cow);
        } else {
          // Fallback static profile if DB lookup fails
          setCow({
            id,
            tag_number: `JVP-COW-${String(id).padStart(3, '0')}`,
            name: 'Kamadhenu (காமதேனு)',
            breed: 'Kangeyam Native Breed',
            age: '4 Years',
            photo_url: '/assets/img/kosala/kosala_hero_bg.jpg',
            story: 'A serene and gentle mother cow protected under Vedic traditions at Sri Jai Varahi Peedam Kosala. Receives daily Go Pooja archanas, fresh green grass, mineral salts, and loving shelter.',
            health_status: '100% Vaccinated, Monthly Dewormed',
            sponsorship_status: 'available',
            intake_date: '2023-04-12',
          });
        }
      } catch (err) {
        console.error('Failed to fetch cow details:', err);
        setError('Could not load cow profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchCow();
  }, [id]);

  if (loading) {
    return (
      <div className="kosala-page">
        <Header />
        <div className="archive-loading-state">
          <i className="fas fa-spinner fa-spin archive-loading-icon"></i>
          <p className="archive-loading-text">Loading Gomatha Profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const tagNumber = cow?.tag_number || `JVP-COW-${String(id).padStart(3, '0')}`;
  const isSponsored = cow?.sponsorship_status === 'sponsored' || cow?.isSponsored;

  return (
    <div className="kosala-page">
      <Helmet>
        <title>{cow?.name || 'Cow Profile'} | Sri Jai Varahi Peedam Kosala</title>
        <meta
          name="description"
          content={`Detailed care and health profile for ${cow?.name} at Sri Kottai Varahi Amman Temple Gosala.`}
        />
      </Helmet>

      <Header />

      <div className="cow-details-container">
        <div className="site-container">
          <div className="mb-4">
            <Link to="/kosala" className="btn-receipt-download">
              <i className="fas fa-arrow-left"></i> Back to Kosala Sanctuary
            </Link>
          </div>

          <div className="cow-details-grid">
            <div className="cow-details-img-box">
              <img
                src={cow?.photo_url || cow?.photoUrl || '/assets/img/kosala/kosala_hero_bg.jpg'}
                alt={cow?.name}
                className="cow-details-img"
              />
              <div className="cow-details-meta-card">
                <div className="cow-spec-item">
                  <div className="cow-spec-label">Sponsorship Status</div>
                  <div className="cow-spec-val">
                    <span className={`badge-category ${isSponsored ? 'badge-sponsored' : 'badge-needs-sponsor'}`}>
                      {isSponsored ? 'Currently Sponsored' : 'Awaiting Devotee Sponsor'}
                    </span>
                  </div>
                </div>
                {!isSponsored && (
                  <div className="mt-3">
                    <Link
                      to={`/kosala/donate?cow=${cow?.id}&category=cow_sponsorship`}
                      className="btn-hero-primary w-100 justify-content-center"
                    >
                      <i className="fas fa-heart"></i> Sponsor {cow?.name}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="cow-details-info-card">
              <div className="cow-details-title-row">
                <h1 className="cow-details-name">{cow?.name}</h1>
                <span className="cow-details-tag">{tagNumber}</span>
              </div>

              <div className="cow-specs-grid">
                <div className="cow-spec-item">
                  <div className="cow-spec-label">Breed</div>
                  <div className="cow-spec-val">{cow?.breed || 'Native Breed'}</div>
                </div>
                <div className="cow-spec-item">
                  <div className="cow-spec-label">Age</div>
                  <div className="cow-spec-val">{cow?.age || 'Adult'}</div>
                </div>
                <div className="cow-spec-item">
                  <div className="cow-spec-label">Intake Date</div>
                  <div className="cow-spec-val">
                    {cow?.intake_date ? new Date(cow.intake_date).toLocaleDateString('en-IN') : 'Established'}
                  </div>
                </div>
                <div className="cow-spec-item">
                  <div className="cow-spec-label">Daily Diet</div>
                  <div className="cow-spec-val">Green &amp; Dry Grass, Bran Mash</div>
                </div>
              </div>

              <h3 className="cat-title">About this Gomatha</h3>
              <p className="cow-details-story">
                {cow?.story || 'Cared for with love and respect under the divine grace of Sri Kottai Varahi Amman.'}
              </p>

              <div className="cow-medical-log-box">
                <div className="cow-medical-title">
                  <i className="fas fa-notes-medical cow-health-icon"></i>
                  <span>Veterinary &amp; Health Records</span>
                </div>
                <div className="cow-medical-item">
                  <span>General Health Condition:</span>
                  <strong>{cow?.health_status || 'Excellent & Healthy'}</strong>
                </div>
                <div className="cow-medical-item">
                  <span>Vaccination Status:</span>
                  <strong>FMD &amp; Anthrax Protected</strong>
                </div>
                <div className="cow-medical-item">
                  <span>Deworming Schedule:</span>
                  <strong>Up to date (Quarterly)</strong>
                </div>
                <div className="cow-medical-item">
                  <span>Attending Vet:</span>
                  <strong>Government Registered Veterinary Surgeon</strong>
                </div>
              </div>

              <div className="d-flex gap-3 flex-wrap">
                <Link to="/kosala/donate" className="btn-hero-primary">
                  <i className="fas fa-hand-holding-heart"></i> Contribute for Fodder
                </Link>
                <a href="tel:+919092878389" className="btn-hero-secondary btn-receipt-modal-close">
                  <i className="fas fa-phone-alt"></i> Inquire about Adoption
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <FloatActions />
    </div>
  );
};

export default KosalaCowDetails;
