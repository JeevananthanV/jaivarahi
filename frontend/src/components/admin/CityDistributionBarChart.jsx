import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CityDistributionBarChart = ({ cityData }) => {
  const data = {
    labels: cityData.map(d => d.city || 'Unknown'),
    datasets: [
      {
        label: 'Donors',
        data: cityData.map(d => d.count),
        backgroundColor: '#C8690A', // var(--saf)
        borderRadius: 4,
        barPercentage: 0.6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bar chart
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(212,120,10,.05)' },
        ticks: {
          color: 'var(--tx3)',
          font: { size: 10, family: "'DM Sans', sans-serif" }
        }
      },
      y: {
        grid: { display: false },
        ticks: {
          color: 'var(--tx2)',
          font: { size: 10, family: "'DM Sans', sans-serif" }
        }
      }
    },
    plugins: {
      legend: { display: false },
    }
  };

  return (
    <div className="card">
      <div className="card-hd">
        <span className="card-title">Top Cities by Donations</span>
      </div>
      <div className="card-body" style={{ height: '300px' }}>
        {cityData.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--tx3)' }}>
            No city data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default CityDistributionBarChart;
