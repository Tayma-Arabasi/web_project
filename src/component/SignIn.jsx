import React, { useState } from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useMutation,
} from '@apollo/client';

// Apollo client instance
const client = new ApolloClient({
  uri: 'http://localhost:5000/graphql',
  cache: new InMemoryCache(),
});

// GraphQL mutation for signin
const SIGNIN_MUTATION = gql`
  mutation Signin($username: String!, $password: String!) {
    signin(username: $username, password: $password) {
      token
      user {
        id
        username
        role
      }
      message
    }
  }
`;

function SignInComponent({ onLoginSuccess, onSwitchToSignUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [signin, { loading, error }] = useMutation(SIGNIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('All fields are required!');
      return;
    }

    try {
      const { data } = await signin({ variables: { username, password } });

      if (data.signin.token) {
        localStorage.setItem('token', data.signin.token);
        // Optionally save remember state or handle accordingly

        onLoginSuccess();

        // Optionally redirect or handle user role here
      } else {
        alert(data.signin.message || 'Signin failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <div className="bg-[#1e1e1e] p-6 rounded-xl w-full max-w-sm text-white">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>

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
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="mr-2"
            />
            <span>Stay Signed In</span>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error.message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-[#28a745] hover:bg-[#1e7e34] text-white py-2 rounded-md font-semibold transition-transform transform hover:scale-105"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-[#4F959D] hover:text-[#205781] font-bold"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default function SignIn(props) {
  return (
    <ApolloProvider client={client}>
      <SignInComponent {...props} />
    </ApolloProvider>
  );
}
