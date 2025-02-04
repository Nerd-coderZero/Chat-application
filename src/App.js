import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Import routing components!!!
import Layout from './components/Layout';
import Login from './components/Login';
import { loginUser } from './services/api';
import { handleResponsiveScaling } from './utils/responsive';
import ForgotPassword from './components/ForgotPassword';


function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null); // This line was mistakenly removed before. It's necessary!


  useEffect(() => {
        handleResponsiveScaling();
        window.addEventListener('resize', handleResponsiveScaling);
        
        return () => {
            window.removeEventListener('resize', handleResponsiveScaling);
        };
    }, []);
    
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = async (username, password) => {
    try {
      setError(null);
      const data = await loginUser(username, password);
      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    } catch (err) { // It's better to use err instead of error, to not shadow the component's state
      console.error('Login failed:', err);
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    if (window.chatSocket) {
      window.chatSocket.close();
    }
  };

  return (
    <BrowserRouter> {/* Wrap your app with BrowserRouter */}
      <Routes> {/* Use Routes to define your routes */}
        <Route path="/" element={
          token ? (
            <Layout
              token={token}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          ) : (
            <Login onLogin={handleLogin} error={error} />
          )
        } /> {/* Main route (either Login or Layout) */}
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Forgot Password route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
