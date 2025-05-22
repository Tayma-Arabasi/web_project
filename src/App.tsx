import React, { useState, useEffect } from 'react';
import { ApolloProvider, useQuery, gql } from '@apollo/client';
import { client } from './Graphqi/apolloClient';
import Sidebar from './component/Sidebar';
import Dashboard from './component/MainContent';
import ProjectsSection from './component/Projects';
import Task from './component/Tasks';
import Chat from './component/Chat';
import Header from './component/Header';
import SignIn from './component/SignIn';
import SignUp from './component/SignUp';
import StudentDashboard from './component/MainStudent';
import ProjectsSectionstudent from './component/Projectstu';
import TaskSection from './component/Taskstu';
import StudentChat from './component/Chatstu';
import './App.css';

const GET_USER_ROLE = gql`
  query GetUserRole {
    getLastSignedInUserRole {
      role
    }
  }
`;

function AppInner() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'projects' | 'tasks' | 'chat'>('home');
  const [userRole, setUserRole] = useState('');

  const { data, loading, error } = useQuery(GET_USER_ROLE, {
    skip: !isLoggedIn, // don't fetch role if not logged in
    fetchPolicy: 'network-only', // always fresh data
  });

  useEffect(() => {
    if (data?.getLastSignedInUserRole?.role) {
      setUserRole(data.getLastSignedInUserRole.role.trim());
      //alert(data.getLastSignedInUserRole.role.trim());
    }
  }, [data]);

useEffect(() => {
  console.log('User role:', userRole);
  console.log('Current page:', currentPage);
}, [userRole, currentPage]);











  const handlePageChange = (page: 'home' | 'projects' | 'tasks' | 'chat') => {
    setCurrentPage(page);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return showSignUp ? (
      <SignUp onSwitchToSignIn={() => setShowSignUp(false)} />
    ) : (
      <SignIn onLoginSuccess={handleLoginSuccess} onSwitchToSignUp={() => setShowSignUp(true)} />
    );
  }

  if (loading) {
    return <div className="text-white p-6">Loading user role...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">Error loading user role: {error.message}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#1e1e1e] text-white">
      <Header />

      <div className="flex flex-1">
        <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />

        {userRole === 'student' && (
          <div className="flex-1 bg-[#1e1e1e] p-6">
            {currentPage === 'home' && <StudentDashboard />}
            {currentPage === 'projects' && <ProjectsSectionstudent />}
            {currentPage === 'tasks' && <TaskSection />}
            {currentPage === 'chat' && <StudentChat />}
          </div>
        )}

        {userRole === 'admin' && (
          <div className="flex-1 bg-[#1e1e1e] p-6">
            {currentPage === 'home' && <Dashboard />}
            {currentPage === 'projects' && <ProjectsSection />}
            {currentPage === 'tasks' && <Task />}
            {currentPage === 'chat' && <Chat />}
          </div>
        )}

        {!userRole && (
          <div className="flex-1 p-6 text-center text-red-500">
            User role not recognized or missing.
          </div>
        )}
      </div>
    </div>
  );
}

export function App() {
  return (
    <ApolloProvider client={client}>
      <AppInner />
    </ApolloProvider>
  );
}
