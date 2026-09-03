import React from 'react';

const Statistics = ({ stats }) => {
  return (
    <section className="about-stats" aria-label="Our Impact Statistics">
      {stats.map((stat, index) => (
        <div className="about-stats__card" key={index}>
          <h3>{stat.value}</h3>
          <p>{stat.label}</p>
        </div>
      ))}
    </section>
  );
};

export default Statistics;
