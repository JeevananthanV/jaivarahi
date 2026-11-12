import React from 'react';

const DonationArchiveFilters = ({
  search,
  setSearch,
  onSearchSubmit,
  category,
  setCategory,
  onCategoryChange,
  onDonateClick,
}) => {
  const categoryFilters = [
    { id: 'all', label: 'All Categories' },
    { id: 'cow_sponsorship', label: 'Cow Sponsorship' },
    { id: 'fodder_feed', label: 'Daily Fodder' },
    { id: 'medical_care', label: 'Medical Care' },
    { id: 'general_gosala', label: 'General Gosala' },
  ];

  return (
    <div className="archive-toolbar">
      <form className="archive-search-box" onSubmit={onSearchSubmit}>
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search by donor name, receipt ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search donation archive"
        />
      </form>

      <div className="archive-category-filters">
        {categoryFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`filter-chip ${category === f.id ? 'active' : ''}`}
            onClick={() => {
              setCategory(f.id);
              if (onCategoryChange) onCategoryChange(f.id);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {onDonateClick && (
        <button
          type="button"
          className="btn-hero-primary btn-cow-sponsor"
          onClick={onDonateClick}
        >
          <i className="fas fa-hand-holding-heart"></i>
          <span>Make a Donation</span>
        </button>
      )}
    </div>
  );
};

export default DonationArchiveFilters;

