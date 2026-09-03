import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const RevenuePieChart = ({ totals }) => {
  const data = {
    labels: ['Donations', 'Prasadham', 'Royal Bookings', 'VIP'],
    datasets: [
      {
        data: [
          totals.donation_revenue,
          totals.prasadham_revenue,
          totals.royal_revenue,
          totals.vip_revenue
        ],
        backgroundColor: [
          '#7B1A1A', // var(--mar)
          '#C8690A', // var(--saf)
          '#C9952C', // var(--gold)
          '#1D4ED8'  // var(--in)
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'var(--tx2)',
          font: { size: 11, family: "'DM Sans', sans-serif" }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed);
            }
            return label;
          }
        }
      }
    },
  };

  return (
    <div className="card">
      <div className="card-hd">
        <span className="card-title">Revenue Distribution</span>
      </div>
      <div className="card-body" style={{ height: '300px' }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default RevenuePieChart;
