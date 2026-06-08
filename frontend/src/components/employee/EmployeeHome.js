import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import carousel images
import carousel1 from '../../assets/carousel_1.jpg';
import carousel2 from '../../assets/carousek_2.jpg';
import carousel3 from '../../assets/carousel_3.jpg';
import carousel4 from '../../assets/carousel_4.jpeg';
import carousel5 from '../../assets/carousel_5.jpg';
import carousel6 from '../../assets/carousel_6.jpg';
import carousel7 from '../../assets/carousel_7.jpg';

function EmployeeHome() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    myRentals: 0
  });

  const carouselImages = [carousel1, carousel2, carousel3, carousel4, carousel5, carousel6, carousel7];

  useEffect(() => {
    fetchStats();
    
    // Initialize carousel with auto-slide every 2 seconds
    const carouselElement = document.getElementById('employeeCarousel');
    if (carouselElement && window.bootstrap && window.bootstrap.Carousel) {
      new window.bootstrap.Carousel(carouselElement, {
        interval: 2000,
        ride: 'carousel',
        wrap: true,
        pause: 'hover'
      });
    }
  }, []);

  const fetchStats = async () => {
    try {
      const moviesRes = await axios.get('http://localhost:5000/api/movies');
      
      setStats({
        totalMovies: moviesRes.data.length,
        myRentals: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      {/* Hero Section with Carousel - Auto Slide Every 2 Seconds */}
      <div id="employeeCarousel" className="carousel slide carousel-fade mb-5" data-bs-ride="carousel" data-bs-interval="2000">
        <div className="carousel-indicators">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#employeeCarousel"
              data-bs-slide-to={index}
              className={index === 0 ? 'active' : ''}
              aria-current={index === 0 ? 'true' : 'false'}
            ></button>
          ))}
        </div>
        <div className="carousel-inner" style={{ borderRadius: '15px', maxHeight: '400px', overflow: 'hidden' }}>
          {carouselImages.map((img, index) => (
            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`} data-bs-interval="2000">
              <img 
                src={img} 
                className="d-block w-100" 
                alt={`Slide ${index + 1}`}
                style={{ height: '400px', objectFit: 'cover' }}
              />
              <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-3">
                <h3>Welcome to Movie DB Store</h3>
                <p>Your ultimate movie rental destination since 2010</p>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#employeeCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#employeeCarousel" data-bs-slide="next">
          <span className="carousel-control-prev-icon"></span>
        </button>
      </div>

      {/* Welcome Section */}
      <div className="text-center mb-5">
        <div className="mb-3">
          <span className="display-1">🎬</span>
        </div>
        <h1 className="display-4 fw-bold text-primary mb-3">Welcome to Movie DB Store!</h1>
        <p className="lead text-muted">Discover, rent, and enjoy the best movies collection</p>
        <div className="d-flex justify-content-center gap-3 mt-3">
          <span className="badge bg-primary p-2">🎬 Since 2010</span>
          <span className="badge bg-success p-2">⭐ 4.8 Customer Rating</span>
          <span className="badge bg-warning text-dark p-2">🎥 500+ Movies</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="card border-0 shadow-lg text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-center py-5">
              <h2 className="display-4 fw-bold mb-0">{stats.totalMovies}</h2>
              <p className="mb-0 fs-5">Movies Available</p>
              <small>Ready to Rent</small>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-lg text-white" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <div className="card-body text-center py-5">
              <h2 className="display-4 fw-bold mb-0">{stats.myRentals}</h2>
              <p className="mb-0 fs-5">My Active Rentals</p>
              <small>Currently Rented</small>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card border-0 shadow-lg text-center h-100">
            <div className="card-body p-4">
              <div className="display-4 mb-3">🎯</div>
              <h4>Easy Rental Process</h4>
              <p className="text-muted">Browse, select, and rent movies in just a few clicks</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-lg text-center h-100">
            <div className="card-body p-4">
              <div className="display-4 mb-3">💎</div>
              <h4>Premium Quality</h4>
              <p className="text-muted">HD quality movies with the best viewing experience</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-lg text-center h-100">
            <div className="card-body p-4">
              <div className="display-4 mb-3">🚀</div>
              <h4>Fast Delivery</h4>
              <p className="text-muted">Instant digital access to your rented movies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info & Contact Section */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-body p-4">
              <h3 className="mb-3">📖 Our Story</h3>
              <p className="text-muted">
                Since <strong>2010</strong>, Movie DB Store has been passionate about bringing the magic of cinema 
                to your home. We believe that great movies create unforgettable moments.
              </p>
              <p className="text-muted">
                With over <strong>500+ movies</strong> in our collection and thousands of satisfied customers, 
                we continue to grow and improve our service every day.
              </p>
              <div className="mt-3">
                <span className="badge bg-primary me-2">⭐ Trusted Since 2010</span>
                <span className="badge bg-success">🎉 10,000+ Happy Customers</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-body p-4">
              <h3 className="mb-3">📞 Need Help?</h3>
              <div className="mb-3">
                <p className="mb-1"><strong>📞 Phone Support:</strong></p>
                <p className="text-muted">+961 70 123 456</p>
              </div>
              <div className="mb-3">
                <p className="mb-1"><strong>✉️ Email:</strong></p>
                <p className="text-muted">support@moviedbstore.com</p>
              </div>
              <div className="mb-3">
                <p className="mb-1"><strong>💬 Live Chat:</strong></p>
                <p className="text-muted">Available 24/7 for premium members</p>
              </div>
              <button className="btn btn-primary w-100 mt-2">
                📧 Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeHome;