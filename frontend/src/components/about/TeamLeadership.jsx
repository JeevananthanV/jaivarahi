import React from 'react';

const TeamLeadership = ({ team }) => {
  return (
    <section className="about-team" aria-label="Temple leadership">
      <h2 className="about-team__heading">Our Temple Leadership</h2>
      <div className="about-team__grid">
        {team.map((member, index) => (
          <article className="about-team__card" key={index}>
            <figure className="about-team__media">
              <img
                src={member.image}
                alt={`${member.name}, ${member.role} of Jai Varahi Peedam`}
                loading="lazy"
                decoding="async"
                width="300"
                height="450"
              />
            </figure>
            <div className="about-team__info">
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TeamLeadership;
