import React from 'react';
import { Helmet } from 'react-helmet-async';
import KosalaComponent from '../components/pages/Kosala.jsx';

const Kosala = ({ defaultTab = 'donate' }) => {
  return (
    <>
      <Helmet>
        <title>கோசாலை தானம் — Protect and Nourish Cows | Jai Varahi Peedam</title>
        <meta
          name="description"
          content="Support sacred cow protection, daily green fodder feeding, veterinary medical care, and lifelong shelter at Sri Kottai Varahi Amman Temple Gosala, Katpadi, Vellore. Official donation ledger and 80G receipts."
        />
        <meta name="keywords" content="Kosala Donation, Goshala, Cow Donation, Go Seva, Cow Adoption, Cow Care, Jai Varahi Peedam, Vellore, Tamil Nadu" />
        <link rel="canonical" href="https://jaivarahi.org/kosala" />
      </Helmet>
      <KosalaComponent initialTab={defaultTab} />
    </>
  );
};

export default Kosala;
