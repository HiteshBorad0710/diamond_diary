import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiamond } from '@fortawesome/free-solid-svg-icons';
import { diamondIconStyle } from '../App';
import './Login.css';


const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setRetryCount(0);

    try {
      console.log('Attempting login with credentials:', {
        email: credentials.email,
        // Note: Not logging password for security
      });
      
      // Add timeout to prevent infinite waiting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds
      
      // Try multiple times if network fails
      let success = false;
      let lastError = null;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await axios.post('https://backend-or3v.onrender.com/api/login', {
            email: credentials.email,
            password: credentials.password
          }, {
            timeout: 30000,
            signal: controller.signal
          });
          
          success = true;
          lastError = null;
          break;
        } catch (error) {
          lastError = error;
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          }
        }
      }
      
      if (!success) {
        throw lastError;
      }
      
      clearTimeout(timeoutId);

      console.log('Login response:', response.data);
      
      if (response.data.success) {
        // Store both token and email in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userEmail', response.data.user.email);
        onLogin();
        // Navigate to diamond list page after successful login
        navigate('/add', { state: { activeMenu: 'add' } });
      } else {
        setError(response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error details:', {
        error: error,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        retryCount: retryCount
      });

      if (!error.response) {
        setError(`Network error. Please check your internet connection and try again.\n\nAttempt ${retryCount + 1} of ${maxRetries} failed.\n\nIf the problem persists, please verify that:\n1. Your internet connection is stable\n2. The backend server is running\n3. You can access https://backend-or3v.onrender.com/api/login directly in your browser\n4. The backend URL is correct`);
        setRetryCount(prev => prev + 1);
        
        // If we've reached max retries, suggest alternative actions
        if (retryCount >= maxRetries) {
          setError(error.message + '\n\nAdditional troubleshooting steps:\n1. Check if you can access other websites\n2. Try restarting your browser\n3. Clear browser cache and cookies\n4. Contact support if the problem persists');
        }
      } else if (error.response.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.response.status === 404) {
        setError('API endpoint not found. Please contact support.');
      } else if (error.response.status === 401) {
        setError('Invalid email or password.');
      } else if (error.response.status === 400) {
        setError('Please check your credentials.');
      } else {
        setError(error.response?.data?.message || 
          error.response?.data?.error || 
          'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
      <img src="/images/clipart-diamond-rock-6.png" alt="Logo" className="logo" />
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          {error && (
          <div className="error-message-container">
            <div className="error-message">
              <FontAwesomeIcon icon="exclamation-circle" className="error-icon" />
              {error}
            </div>
          </div>
        )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        

      </div>
    </div>
  );
};

export default Login;
