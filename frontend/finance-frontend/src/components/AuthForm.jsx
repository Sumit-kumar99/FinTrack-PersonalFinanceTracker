import React, { useState } from 'react';

// This is the authentication component. It handles user login, signup, and Google authentication.
const API_BASE_URL = 'http://localhost:8080/api';

const AuthForm = ({ setToken, setUser, showMessage, setAuthLoading, authLoading, authError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const url = isSignUp ? `${API_BASE_URL}/auth/register` : `${API_BASE_URL}/auth/authenticate`;
      const body = isSignUp ? { username, email, password } : { username, password };
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setUser({ username: data.username, email: data.email });
        localStorage.setItem('jwtToken', data.token);
        showMessage(`Welcome, ${data.username || data.email}!`);
      } else {
        throw new Error(data.message || 'Authentication failed.');
      }
    } catch (error) {
      console.error("Auth error:", error);
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/authenticate-google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'mock-google-token' }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.token);
        setUser({ username: data.username, email: data.email });
        localStorage.setItem('jwtToken', data.token);
        showMessage(`Welcome, ${data.username}!`);
      } else {
        throw new Error(data.message || 'Google authentication failed.');
      }
    } catch (error) {
      console.error("Google Auth error:", error);
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-800">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-gray-200">
        <div className="flex items-center justify-center space-x-2 mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-sky-500">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.85-.29-.93-.575a1.127 1.127 0 0 1-.09-.375 1.127 1.127 0 0 1 .09-.375c.08-.285.39-.575.93-.575h4.5c.54 0 .85.29.93.575.08.285.09.375.09.375s-.01.09-.-09.375c-.08.285-.39.575-.93.575h-4.5Zm-.75 4.5c-.54 0-.85-.29-.93-.575a1.127 1.127 0 0 1-.09-.375 1.127 1.127 0 0 1 .09-.375c.08-.285.39-.575.93-.575h4.5c.54 0 .85.29.93.575.08.285.09.375.09.375s-.01.09-.09.375c-.08.285-.39.575-.93.575h-4.5Zm-1.875 4.5c-.54 0-.85-.29-.93-.575a1.127 1.127 0 0 1-.09-.375c-.01-.13-.02-.27-.02-.42 0-.25.04-.49.12-.73s.19-.46.33-.675c.14-.215.31-.4.5-.555l2.49-1.875c.175-.13.43-.13.605 0l2.49 1.875c.19.15.36.34.5.555.14.215.25.45.33.675.08.24.12.48.12.73 0 .15-.01.29-.02.42a1.127 1.127 0 0 1-.09.375c-.08.285-.39.575-.93.575h-4.5Z" clipRule="evenodd" />
           </svg>
           <h2 className="text-4xl font-extrabold text-gray-800">FinTrack</h2>
        </div>
        <p className="text-center text-gray-500 mb-8">to access your personal finance assistant.</p>
        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-xl bg-gray-50 border-gray-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-800"
              required
            />
          </div>
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-xl bg-gray-50 border-gray-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-800"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-xl bg-gray-50 border-gray-300 shadow-sm focus:ring-sky-500 focus:border-sky-500 text-gray-800"
              required
            />
          </div>
          {authError && <p className="text-red-600 text-sm text-center">{authError}</p>}
          <button
            type="submit"
            disabled={authLoading}
            className={`w-full py-3 px-6 rounded-full shadow-lg text-lg font-bold text-white transition-all transform hover:scale-105 ${authLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700'}`}
          >
            {authLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm font-medium text-sky-600 hover:underline">
            {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
          </button>
        </div>
        <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
        </div>
        <div className="mt-6">
            <button
                onClick={handleGoogleAuth}
                className="w-full inline-flex justify-center items-center py-3 px-6 border border-gray-300 rounded-full shadow-lg bg-white text-gray-700 font-bold transition-all transform hover:scale-105 hover:bg-gray-50 focus:outline-none"
                disabled={authLoading}
            >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.24 10.27c.56 0 .97.35 1.25.75l2.12-2.12c-.93-1.01-2.22-1.63-3.37-1.63-3.23 0-5.69 2.58-5.69 5.8s2.46 5.8 5.69 5.8c2.8 0 4.79-1.92 5.51-4.88h-5.51v-2.12h7.94v2.88c-.12.44-.75 2.15-2.23 3.65-1.57 1.57-3.66 2.37-5.71 2.37-4.84 0-8.79-3.9-8.79-8.7s3.95-8.7 8.79-8.7c2.31 0 4.29.98 5.75 2.38l-2.09 2.09c-.86-.87-1.95-1.39-3.41-1.39z" />
                </svg>
                <span>Google</span>
            </button>
        </div>
      </div>
    </div>
  );
};
export default AuthForm;
