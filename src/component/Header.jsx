import React from 'react';
import { gql, useQuery } from '@apollo/client';

const GET_LAST_SIGNED_IN_ROLE = gql`
  query GetLastSignedInUserRole {
    getLastSignedInUserRole {
      role
      username
    }
  }
`;

const Header = () => {
  const { data, loading, error } = useQuery(GET_LAST_SIGNED_IN_ROLE, {
    context: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    },
    fetchPolicy: 'network-only',
  });

  const signOut = async () => {
    try {
      await fetch('http://localhost:5000/api/signout', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Error during signout:', err);
    } finally {
      localStorage.removeItem('token');
      window.location.href = '/signin';
    }
  };

  return (
    <header className="w-full px-6 py-4 bg-[#1e1e1e] shadow flex justify-end items-center">
      <div className="flex items-center gap-6">
        <div className="text-white text-xl font-semibold">
          {loading
            ? 'Loading...'
            : error || !data?.getLastSignedInUserRole
            ? 'Not Signed In'
    : `${data.getLastSignedInUserRole.role} ${data.getLastSignedInUserRole.username}`}
        </div>
        <button
          onClick={signOut}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
