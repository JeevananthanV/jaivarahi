import React, { useState, useEffect } from 'react';

const categories = [
  { id: 'all', label: 'All Celebrations' },
  { id: 'homams', label: 'Homams & Yagnas' },
  { id: 'alankarams', label: 'Divine Alankarams' },
  { id: 'annadhanam', label: 'Annadhanam Seva' },
  { id: 'goshala', label: 'Goshala Seva' },
  { id: 'activities', label: 'Temple Activities' },
  { id: 'previous', label: 'Previous Festivals' },
];

const galleryItems = [
  {
    id: 1,
    category: 'homams',
    src: '/assets/img/events/Ganapathi Homam.webp',
    title: 'Maha Ganapathy Homam',
    description: 'Invoking auspicious beginnings and obstacle removal at the start of the holy celebrations.',
  },
  {
    id: 2,
    category: 'homams',
    src: '/assets/img/events/Navagraha  Homam.webp',
    title: 'Navagraha Homam',
    description: 'Seeking planetary harmony, prosperity, and cosmic balance for all devotees.',
  },
  {
    id: 3,
    category: 'homams',
    src: '/assets/img/events/Vaalam Thaarum Varahi Homam.webp',
    title: 'Vaalam Thaarum Varahi Homam',
    description: 'A powerful, fiery offering dedicated to Sri Varahi Amman for supreme protection and victory.',
  },
  {
    id: 4,
    category: 'alankarams',
    src: '/assets/img/gallery/alankaram_varahi.png',
    title: 'Sri Kottai Varahi Amman Alankaram',
    description: 'The divine deity decorated majestically with gold ornaments, silks, and fresh flower garlands.',
  },
  {
    id: 5,
    category: 'alankarams',
    src: '/assets/img/events/Dipadharanai.webp',
    title: 'Maha Dipadharanai Seva',
    description: 'Invoking spiritual light and divine illumination through the sacred flame ceremony.',
  },
  {
    id: 6,
    category: 'alankarams',
    src: '/assets/img/events/Manjal Abhisheka.webp',
    title: 'Turmeric Abhishekam',
    description: 'Sacred turmeric bathing representing purity, healing, and divine shakti.',
  },
  {
    id: 7,
    category: 'annadhanam',
    src: '/assets/img/gallery/annadhanam_hall.png',
    title: 'Nithya Annadhanam Dining Hall',
    description: 'Thousands of devotees are served sanctified food (prasadam) daily with utmost devotion.',
  },
  {
    id: 8,
    category: 'annadhanam',
    src: '/assets/img/highlights/food distribution.webp',
    title: 'Prasadam Distribution',
    description: 'Temple volunteers and volunteers serving warm, nutritious meals to the visiting community.',
  },
  {
    id: 9,
    category: 'goshala',
    src: '/assets/img/gallery/goshala_seva.png',
    title: 'Goshala Seva',
    description: 'Devotees offering fresh grass, worshiping, and caring for the sacred cows at Sri Varahi Goshala.',
  },
  {
    id: 10,
    category: 'activities',
    src: '/assets/img/highlights/treeplantation1.webp',
    title: 'Tree Plantation Ceremony',
    description: 'Grooming the sacred environment of the peedam through eco-friendly plantation drives.',
  },
  {
    id: 11,
    category: 'activities',
    src: '/assets/img/events/Bharatanatyam Performance.webp',
    title: 'Devotional Bharatanatyam Dance',
    description: 'Nirthya Seva performed by classical dancers to express deep devotion to the Goddess.',
  },
  {
    id: 12,
    category: 'previous',
    src: '/assets/img/gallery/previous_festivals.png',
    title: 'Festival Gopuram Illumination',
    description: 'A breathtaking night view of the temple Gopuram illuminated beautifully during the festival.',
  },
  {
    id: 13,
    category: 'previous',
    src: '/assets/img/events/Award Ceremony.webp',
    title: 'Annual Seva Award Ceremony',
    description: 'Honoring dedication and acknowledging the selfless support of our temple volunteers.',
  },
];

const Gallery = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [lightbox, setLightbox] = useState({ isOpen: false, currentIndex: 0 });

  const filteredItems = activeTab === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeTab);

  const openLightbox = (index) => {
    // Find index of the clicked item in the filtered items array
    setLightbox({ isOpen: true, currentIndex: index });
  };

  const closeLightbox = () => {
    setLightbox({ ...lightbox, isOpen: false });
  };

  const showNext = (e) => {
    e.stopPropagation();
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % filteredItems.length
    }));
  };

  const showPrev = (e) => {
    e.stopPropagation();
    setLightbox(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex - 1 + filteredItems.length) % filteredItems.length
    }));
  };

  // Keyboard controls for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightbox.isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext(e);
      if (e.key === 'ArrowLeft') showPrev(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen, filteredItems.length]);

  return (
    <section id="gallery" className="an-gallery-section">
      <div className="site-container">
        <div className="an-gallery-header">
          <span className="an-gallery-eyebrow">Visual Divine Journey</span>
          <h2>Festival Gallery</h2>
          <div className="an-gallery-divider"></div>
          <p>
            Capture the moments of devotion, celebration, and seva during Ashada Navarathiri. 
            Browse through different sections of our holy celebrations.
          </p>
        </div>

        {/* Categories Tab Navigation */}
        <div className="an-gallery-tabs">
          {categories.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`an-gallery-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="an-gallery-grid">
          {filteredItems.map((item, index) => (
            <div 
              key={item.id} 
              className="an-gallery-item"
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(index)}
            >
              <div className="an-gallery-img-wrapper">
                <img src={item.src} alt={item.title} loading="lazy" />
                <div className="an-gallery-overlay">
                  <div className="an-gallery-overlay-content">
                    <span className="an-gallery-zoom-icon">
                      <i className="fa-solid fa-magnifying-glass-plus"></i>
                    </span>
                    <h3>{item.title}</h3>
                    <p>{categories.find(c => c.id === item.category)?.label}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox.isOpen && (
        <div className="an-lightbox" role="dialog" aria-modal="true" onClick={closeLightbox}>
          <button 
            type="button" 
            className="an-lightbox-close" 
            onClick={closeLightbox}
            aria-label="Close gallery lightbox"
          >
            &times;
          </button>
          
          <button 
            type="button" 
            className="an-lightbox-nav an-lightbox-prev" 
            onClick={showPrev}
            aria-label="Previous image"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          
          <div className="an-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={filteredItems[lightbox.currentIndex].src} 
              alt={filteredItems[lightbox.currentIndex].title} 
            />
            <div className="an-lightbox-caption">
              <h3>{filteredItems[lightbox.currentIndex].title}</h3>
              <p>{filteredItems[lightbox.currentIndex].description}</p>
              <span className="an-lightbox-index">
                Image {lightbox.currentIndex + 1} of {filteredItems.length}
              </span>
            </div>
          </div>
          
          <button 
            type="button" 
            className="an-lightbox-nav an-lightbox-next" 
            onClick={showNext}
            aria-label="Next image"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </section>
  );
};

export default Gallery;
