import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import your background image
import loginBg from '../assets/cut.jpeg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });
      
      if (response.data.success) {
        navigate('/dashboard', { state: { role: response.data.role } });
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert('Error connecting to server. Make sure backend is running.');
    }
    setLoading(false);
  };

  return (
    <div 
      className="container-fluid vh-100 d-flex align-items-center justify-content-end"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay on the left side for better contrast */}
      <div className="position-absolute top-0 start-0 w-50 h-100" style={{
        background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
      }}></div>
      
      {/* Login Box - Medium size (350px) */}
      <div className="me-5" style={{ width: '350px', zIndex: 10 }}>
        <div className="card shadow-lg" style={{ 
          borderRadius: '15px',
          backgroundColor: 'rgba(255, 255, 255, 0.96)'
        }}>
          <div className="card-body p-5">
            {/* Title */}
            <h2 className="text-center mb-3" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
              Welcome Back
            </h2>
            <p className="text-center text-muted mb-4" style={{ fontSize: '0.85rem' }}>
              Please login to your account
            </p>
            
            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                style={{ 
                  fontSize: '0.9rem', 
                  padding: '8px 12px'
                }}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {/* Password Field */}
            <div className="mb-4">
              <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                Password
              </label>
              <input
                type="password"
                className="form-control"
                style={{ 
                  fontSize: '0.9rem', 
                  padding: '8px 12px'
                }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn w-100 mb-3"
              style={{
                fontSize: '0.9rem',
                padding: '10px',
                fontWeight: 'bold',
                backgroundColor: '#dc3545',
                border: 'none',
                color: 'white'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
            
            {/* Demo accounts */}
            <div className="text-center mb-2">
              <small style={{ fontSize: '0.7rem', color: '#6c757d' }}>
                Demo: admin@movie.com / employee@movie.com
              </small>
            </div>
            
            {/* Back to Home */}
            <div className="text-center">
              <Link to="/" className="text-decoration-none" style={{ fontSize: '0.8rem' }}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;