import React, { useState } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useMutation,
} from '@apollo/client';

// Apollo client instance (same as in SignIn.js)
const client = new ApolloClient({
  uri: 'http://localhost:5000/graphql',
  cache: new InMemoryCache(),
});

// GraphQL mutation for signup
const SIGNUP_MUTATION = gql`
  mutation Signup($username: String!, $password: String!, $role: String!, $universityID: String) {
    signup(input: {
      username: $username,
      password: $password,
      role: $role,
      universityID: $universityID
    }) {
      message
      user {
        id
        username
        role
        universityID
      }
    }
  }
`;

function SignUpComponent({ onSwitchToSignIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [universityID, setUniversityID] = useState('');
  const [error, setError] = useState('');
  const [signup, { loading }] = useMutation(SIGNUP_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      alert('All fields are required!');
      return;
    }

    if (isStudent && !universityID.trim()) {
      setError('University ID is required for students.');
      alert('Please enter your University ID.');
      return;
    }

    setError('');

    try {
      const { data } = await signup({ 
        variables: { 
          username: username.trim(),
          password: password.trim(),
          role: isStudent ? 'student' : 'admin',
          universityID: isStudent ? universityID.trim() : null
        } 
      });

      if (data?.signup?.message) {
        alert(data.signup.message || 'Signup successful. Please sign in.');
        setUsername('');
        setPassword('');
        setUniversityID('');
        onSwitchToSignIn();
      }
    } catch (err) {
      setError(err.message);
      alert(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <div className="bg-[#1e1e1e] p-6 rounded-xl w-full max-w-sm text-white">
        <h2 className="text-2xl font-bold mb-4">Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Username
            <input
              type="text"
              className="mt-1 w-full p-2 rounded-md bg-[#2e2e2e] text-white focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="block mt-4 mb-2">
            Password
            <input
              type="password"
              className="mt-1 w-full p-2 rounded-md bg-[#2e2e2e] text-white focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
              className="mr-2"
            />
            <span>I am a student</span>
          </div>

          {isStudent && (
            <label className="block mt-4 mb-2">
              University ID
              <input
                type="text"
                className="mt-1 w-full p-2 rounded-md bg-[#2e2e2e] text-white focus:outline-none"
                value={universityID}
                onChange={(e) => setUniversityID(e.target.value)}
                required={isStudent}
              />
            </label>
          )}

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-[#28a745] hover:bg-[#1e7e34] text-white py-2 rounded-md font-semibold transition-transform transform hover:scale-105"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-[#4F959D] hover:text-[#205781] font-bold"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default function SignUp(props) {
  return (
    <ApolloProvider client={client}>
      <SignUpComponent {...props} />
    </ApolloProvider>
  );
}