import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { gql, useQuery } from '@apollo/client';

const GET_DASHBOARD_STATS = gql`
  query GetDashboardStatistics {
    dashboardStatistics {
      projectCount
      taskCount
      studentCount
      finishedProjectCount
    }
  }
`;

function Dashboard() {
  const [currentDate, setCurrentDate] = useState('');
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const { loading, error, data } = useQuery(GET_DASHBOARD_STATS);

  useEffect(() => {
    const updateDateTime = () => {
      const today = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const formattedDate = today.toLocaleDateString('en-US', dateOptions);

      let hours = today.getHours();
      const minutes = today.getMinutes().toString().padStart(2, '0');
      const seconds = today.getSeconds().toString().padStart(2, '0');
      const amPm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;

      const formattedTime = `${hours}:${minutes}:${seconds} ${amPm}`;
      setCurrentDate(`${formattedDate} at ${formattedTime}`);
    };

    const interval = setInterval(updateDateTime, 1000);
    updateDateTime();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let chartInstance: Chart | null = null;

    if (chartRef.current && data) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Projects', 'Students', 'Tasks', 'Finished'],
            datasets: [
              {
                label: 'Count',
                data: [
                  data.dashboardStatistics.projectCount,
                  data.dashboardStatistics.studentCount,
                  data.dashboardStatistics.taskCount,
                  data.dashboardStatistics.finishedProjectCount,
                ],
                backgroundColor: [
                  'rgba(57,120,120,0.3)',
                  'rgba(50,127,181,0.3)',
                  'rgba(184,151,68,0.3)',
                  'rgba(104,73,167,0.3)',
                ],
                borderColor: ['#3f9191', '#327fb5', '#b89744', '#7550bc'],
                borderWidth: 2,
              },
            ],
          },
          options: {
            animation: { duration: 1500, easing: 'easeOutQuart' },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { labels: { color: '#aaa' } },
              title: { display: true, text: 'Admin Dashboard Overview', color: '#aaa' },
            },
            scales: {
              y: { beginAtZero: true, ticks: { color: '#aaa' } },
              x: { ticks: { color: '#aaa' } },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [data]);

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error: {error.message}</div>;

  return (
    <main className="flex-1 p-6 bg-[#1e1e1e] text-white min-h-screen w-full flex flex-col items-center">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Welcome to the Task Management System{' '}
          <span className="date" id="current-date">
            {currentDate}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-6 w-full max-w-7xl">
        {[
          { label: 'Number of Projects', value: data.dashboardStatistics.projectCount },
          { label: 'Number of Students', value: data.dashboardStatistics.studentCount },
          { label: 'Number of Tasks', value: data.dashboardStatistics.taskCount },
          { label: 'Finished Projects', value: data.dashboardStatistics.finishedProjectCount },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-[#2a2a2a] p-5 text-center rounded shadow w-full h-24 flex flex-col justify-center"
          >
            <strong className="mb-1">{item.label}</strong>
            <span className="text-lg font-bold">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-7xl flex-1 h-[calc(100vh-250px)] mt-10">
        <canvas ref={chartRef} className="w-full h-full" />
      </div>
    </main>
  );
}

export default Dashboard;
