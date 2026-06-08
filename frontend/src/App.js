import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';

// Import your images
import backgroundImage from './assets/red_backgroud_startpage.jpeg';
import leftImage from './assets/Tous-les-films-Dragon-Ball-Z.jpg';
import rightImage from './assets/backgroundstartpage.jpg';

// Add CSS for animations
const styles = `
  @keyframes dropDown {
    0% {
      top: -20%;
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      top: 100%;
      opacity: 0;
    }
  }
  
  @keyframes dropUp {
    0% {
      bottom: -20%;
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      bottom: 100%;
      opacity: 0;
    }
  }
  
  .floating-image-left {
    position: fixed;
    left: 20px;
    width: 150px;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    animation: dropDown 8s ease-in-out infinite;
    z-index: 10;
  }
  
  .floating-image-right {
    position: fixed;
    right: 20px;
    width: 150px;
    height: auto;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0,0,0,0.5);
    animation: dropUp 8s ease-in-out infinite;
    z-index: 10;
  }
  
  /* Multiple images with different delays */
  .float-1 { animation-delay: 0s; top: -20%; }
  .float-2 { animation-delay: 2s; top: -20%; width: 120px; left: 80px; }
  .float-3 { animation-delay: 5s; top: -20%; width: 100px; left: 40px; }
  
  .float-r1 { animation-delay: 1s; bottom: -20%; }
  .float-r2 { animation-delay: 3.5s; bottom: -20%; width: 120px; right: 80px; }
  .float-r3 { animation-delay: 6s; bottom: -20%; width: 100px; right: 40px; }
`;

function StartPage() {
  return (
    <div className="position-relative vh-100 w-100 overflow-hidden" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Inject CSS animations */}
      <style>{styles}</style>
      
      {/* Floating images on LEFT side (dropping down) */}
      <img src={leftImage} alt="dragon ball" className="floating-image-left float-1" />
      <img src={rightImage} alt="movie" className="floating-image-left float-2" />
      <img src={leftImage} alt="dragon ball 2" className="floating-image-left float-3" />
      
      {/* Floating images on RIGHT side (moving up) */}
      <img src={rightImage} alt="movie" className="floating-image-right float-r1" />
      <img src={leftImage} alt="dragon ball" className="floating-image-right float-r2" />
      <img src={rightImage} alt="movie 2" className="floating-image-right float-r3" />
      
      {/* Dark red overlay for better text readability */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{
        backgroundColor: 'rgba(0, 0, 0, 0.55)'
      }}></div>
      
      {/* Content */}
      <div className="position-relative h-100 d-flex align-items-center justify-content-center">
        <div className="text-center text-white px-4" style={{ zIndex: 20 }}>
          {/* Animated title */}
          <h1 className="display-1 fw-bold mb-3 animate__animated animate__fadeInDown" style={{
            textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
            letterSpacing: '3px'
          }}>
            🎬 CINEMA ZONE
          </h1>
          
          <div className="mb-4">
            <span className="badge bg-danger fs-6 px-3 py-2 mb-3 animate__animated animate__pulse animate__infinite" style={{ zIndex: 20 }}>
              🔥 PREMIUM MOVIE DATABASE 🔥
            </span>
          </div>
          
          <p className="lead mb-5 fs-3 animate__animated animate__fadeInUp" style={{
            maxWidth: '700px',
            margin: '0 auto',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            Discover, organize, and manage your favorite movies
          </p>
          
          {/* Feature cards - BLACK BOLD TEXT */}
          <div className="row justify-content-center mb-5 g-3">
            <div className="col-md-3 col-6">
              <div className="bg-white rounded-3 p-3 shadow-lg animate__animated animate__fadeInLeft" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
                <div className="fs-1">🎥</div>
                <small className="fw-bold text-dark" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#000' }}>
                  Thousands of Movies
                </small>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="bg-white rounded-3 p-3 shadow-lg animate__animated animate__fadeInDown" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
                <div className="fs-1">⭐</div>
                <small className="fw-bold text-dark" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#000' }}>
                  Ratings & Reviews
                </small>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="bg-white rounded-3 p-3 shadow-lg animate__animated animate__fadeInRight" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
                <div className="fs-1">📱</div>
                <small className="fw-bold text-dark" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#000' }}>
                  Mobile Ready
                </small>
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <Link to="/login">
            <button 
              className="btn btn-danger btn-lg px-5 py-3 fw-bold shadow-lg animate__animated animate__zoomIn" 
              style={{
                fontSize: '1.2rem',
                transition: 'all 0.3s ease',
                borderRadius: '50px',
                backgroundColor: '#dc3545',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.backgroundColor = '#c82333';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = '#dc3545';
              }}
            >
              🚀 GET STARTED NOW
            </button>
          </Link>
          
          {/* Demo credentials hint */}
          <p className="mt-5 text-white-50 small animate__animated animate__fadeInUp">
            Demo: admin@movie.com / employee@movie.com
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardWrapper() {
  const location = useLocation();
  const userRole = location.state?.role || 'employee';
  return <Dashboard userRole={userRole} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;