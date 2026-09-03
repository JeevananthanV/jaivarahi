import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DailyTrendLineChart = ({ trendData }) => {
  const data = {
    labels: trendData.map(d => {
      const date = new Date(d.day);
      return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    }),
    datasets: [
      {
        label: 'Donation Revenue (INR)',
        data: trendData.map(d => d.revenue),
        borderColor: '#7B1A1A', // var(--mar)
        backgroundColor: 'rgba(123, 26, 26, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: '#7B1A1A'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(123,26,26,.05)' },
        ticks: {
          color: 'var(--tx3)',
          font: { size: 10, family: "'DM Sans', sans-serif" },
          callback: function(value) {
            return value >= 1000 ? value / 1000 + 'k' : value;
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: 'var(--tx3)',
          font: { size: 10, family: "'DM Sans', sans-serif" },
          maxTicksLimit: 7
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(context.parsed.y);
          }
        }
      }
    }
  };

  return (
    <div className="card">
      <div className="card-hd">
        <span className="card-title">Donation Trend (Last 30 Days)</span>
      </div>
      <div className="card-body" style={{ height: '300px' }}>
        {trendData.length > 0 ? (
          <Line data={data} options={options} />
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--tx3)' }}>
            No trend data available.
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTrendLineChart;
