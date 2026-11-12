import React from 'react';

const DonationTypeCard = ({ category, isSelected, onSelect }) => {
  return (
    <button
      type="button"
      className={`cat-pill-btn ${isSelected ? 'active' : ''}`}
      onClick={() => onSelect(category.id)}
      aria-pressed={isSelected}
    >
      <i className={category.icon}></i>
      <span>{category.title}</span>
    </button>
  );
};

export default DonationTypeCard;
