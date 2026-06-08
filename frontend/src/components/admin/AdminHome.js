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

function AdminHome() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalUsers: 0,
    totalRentals: 0,
    premiumUsers: 0
  });

  const carouselImages = [carousel1, carousel2, carousel3, carousel4, carousel5, carousel6, carousel7];

  useEffect(() => {
    fetchStats();
    
    // Initialize carousel with auto-slide every 2 seconds
    const carouselElement = document.getElementById('adminCarousel');
    if (carouselElement && window.bootstrap && window.bootstrap.Carousel) {
      // Create new carousel with auto-slide
      new window.bootstrap.Carousel(carouselElement, {
        interval: 2000,  // Change slide every 2 seconds
        ride: 'carousel',
        wrap: true,
        pause: 'hover'
      });
    }
  }, []);

  const fetchStats = async () => {
    try {
      const moviesRes = await axios.get('http://localhost:5000/api/movies');
      const usersRes = await axios.get('http://localhost:5000/api/users');
      
      setStats({
        totalMovies: moviesRes.data.length,
        totalUsers: usersRes.data.length,
        totalRentals: 0,
        premiumUsers: usersRes.data.filter(u => u.is_premium === 1).length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      {/* Hero Section with Carousel - Auto Slide Every 2 Seconds */}
      <div id="adminCarousel" className="carousel slide carousel-fade mb-5" data-bs-ride="carousel" data-bs-interval="2000">
        <div className="carousel-indicators">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#adminCarousel"
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
        <button className="carousel-control-prev" type="button" data-bs-target="#adminCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#adminCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* Rest of your component remains the same */}
      <div className="text-center mb-5">
        <div className="mb-3">
          <span className="display-1">👑</span>
        </div>
        <h1 className="display-4 fw-bold text-primary mb-3">Welcome Back, Admin!</h1>
        <p className="lead text-muted">Manage your movie empire from one dashboard</p>
        <div className="d-flex justify-content-center gap-3 mt-3">
          <span className="badge bg-primary p-2">🎬 Since 2010</span>
          <span className="badge bg-success p-2">⭐ 10,000+ Rentals</span>
          <span className="badge bg-warning text-dark p-2">🎥 500+ Movies</span>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-center text-white py-4">
              <h2 className="display-4 fw-bold mb-0">{stats.totalMovies}</h2>
              <p className="mb-0">Total Movies</p>
              <small>In Database</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <div className="card-body text-center text-white py-4">
              <h2 className="display-4 fw-bold mb-0">{stats.totalUsers}</h2>
              <p className="mb-0">Total Users</p>
              <small>Registered Members</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <div className="card-body text-center text-white py-4">
              <h2 className="display-4 fw-bold mb-0">{stats.totalRentals}</h2>
              <p className="mb-0">Active Rentals</p>
              <small>Currently Rented</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <div className="card-body text-center text-white py-4">
              <h2 className="display-4 fw-bold mb-0">{stats.premiumUsers}</h2>
              <p className="mb-0">Premium Users</p>
              <small>VIP Members</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-body p-4">
              <h3 className="mb-3">📖 Our Story</h3>
              <p className="text-muted">
                Founded in <strong>2010</strong>, Movie DB Store has been providing the best movie rental experience 
                for over a decade. What started as a small local video store has grown into a premier 
                destination for movie lovers.
              </p>
              <p className="text-muted">
                We offer <strong>thousands of movies</strong> across all genres, from classic cinema to the latest blockbusters. 
                Our commitment to quality service and customer satisfaction has made us the #1 choice 
                for movie rentals.
              </p>
              <div className="mt-3">
                <span className="badge bg-primary me-2">🎬 500+ Movies</span>
                <span className="badge bg-success me-2">⭐ 4.8 Rating</span>
                <span className="badge bg-warning text-dark">🎥 24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-lg h-100">
            <div className="card-body p-4">
              <h3 className="mb-3">📞 Contact Us</h3>
              <div className="mb-3">
                <p className="mb-1"><strong>📍 Address:</strong></p>
                <p className="text-muted">Movie DB Store, Beirut, Lebanon</p>
              </div>
              <div className="mb-3">
                <p className="mb-1"><strong>📞 Phone:</strong></p>
                <p className="text-muted">+961 70 123 456</p>
              </div>
              <div className="mb-3">
                <p className="mb-1"><strong>✉️ Email:</strong></p>
                <p className="text-muted">info@moviedbstore.com</p>
              </div>
              <div className="mb-3">
                <p className="mb-1"><strong>⏰ Business Hours:</strong></p>
                <p className="text-muted">Monday - Friday: 9:00 AM - 9:00 PM<br />Saturday - Sunday: 10:00 AM - 6:00 PM</p>
              </div>
              <div className="mt-3">
                <button className="btn btn-outline-primary me-2">📧 Send Message</button>
                <button className="btn btn-outline-success">📍 Get Directions</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;