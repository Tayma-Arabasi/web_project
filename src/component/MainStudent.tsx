import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { useQuery, gql } from '@apollo/client';

// GraphQL Queries
const GET_STUDENT_PROFILE = gql`
  query GetStudentProfile {
    studentProfile {
      id
      name
      role
      universityID
    }
  }
`;

const GET_STUDENT_TASKS_COUNT = gql`
  query GetStudentTasksCount {
    studentTasksCount
  }
`;

const GET_STUDENT_PROJECTS_COUNT = gql`
  query GetStudentProjectsCount {
    studentProjectsCount
  }
`;

const StudentDashboard: React.FC = () => {
  const [currentDate, setCurrentDate] = useState('');
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  // GraphQL Queries
  const { data: profileData } = useQuery(GET_STUDENT_PROFILE);
  const { data: tasksData } = useQuery(GET_STUDENT_TASKS_COUNT);
  const { data: projectsData } = useQuery(GET_STUDENT_PROJECTS_COUNT);

  // Derived state from GraphQL queries
  const studentName = profileData?.studentProfile?.name || 'Student';
  const numOfTasks = tasksData?.studentTasksCount || 0;
  const numOfProjects = projectsData?.studentProjectsCount || 0;
  // Update date and time every second
  useEffect(() => {
    const updateDateTime = () => {
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const formattedDate = today.toLocaleDateString('en-US', options);

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

  // Create chart
  useEffect(() => {
    let chartInstance: Chart | null = null;

    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Your Tasks', 'Your Projects'],
            datasets: [
              {
                label: 'Overview',
                data: [numOfTasks, numOfProjects],
                backgroundColor: ['rgba(66, 153, 225, 0.6)', 'rgba(251, 191, 36, 0.6)'],
                borderColor: ['#4299e1', '#fbbf24'],
                borderWidth: 2,
              },
            ],
          },
          options: {
            animation: {
              duration: 1500,
              easing: 'easeOutQuart',
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: { color: '#aaa' },
              },
              title: {
                display: true,
                text: 'Student Dashboard Overview',
                color: '#aaa',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: '#aaa' },
              },
              x: {
                ticks: { color: '#aaa' },
              },
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
  }, [numOfTasks, numOfProjects]);

  return (
    <main className="flex-1 p-6 bg-[#1e1e1e] text-white min-h-screen w-full flex flex-col items-center">
      <div className="mb-6 w-full flex justify-between items-center px-4">
        <h2 className="text-2xl font-semibold">
          Welcome to the Task Management System
        </h2>
        <p className="text-sm text-gray-400">{currentDate}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mb-10">
        {[
          { label: 'Assigned Tasks', value: numOfTasks },
          { label: 'Your Projects', value: numOfProjects },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-[#2a2a2a] p-6 rounded-lg shadow-md flex flex-col justify-center items-center text-center"
          >
            <span className="mb-1 text-gray-300">{item.label}</span>
            <span className="text-lg font-bold text-white">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="w-full max-w-4xl h-[320px] bg-[#2a2a2a] p-6 rounded-lg shadow-md">
        <canvas ref={chartRef} className="w-full h-full" />
      </div>
    </main>
  );
};

export default StudentDashboard;