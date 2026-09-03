import React from 'react';

const AboutTextSection = ({ title, content, isIntro = false }) => {
  const SectionTag = isIntro ? 'article' : 'section';
  const className = isIntro ? 'about-intro' : 'about-section';

  return (
    <SectionTag className={className}>
      <h2>{title}</h2>
      <p>{content}</p>
    </SectionTag>
  );
};

export default AboutTextSection;
