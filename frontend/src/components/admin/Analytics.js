import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalRentals: 0,
    activeRentals: 0,
    completedRentals: 0,
    totalUsers: 0,
    premiumUsers: 0,
    totalMovies: 0,
    lowStockMovies: 0,
    popularMovies: [],
    recentRentals: [],
    monthlyRevenue: [],
    totalReservations: 0,
    activeReservations: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all needed data in parallel
      const [rentalsRes, historyRes, usersRes, moviesRes, reservationsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/rentals'),
        axios.get('http://localhost:5000/api/admin/rentals/history'),
        axios.get('http://localhost:5000/api/users'),
        axios.get('http://localhost:5000/api/movies'),
        axios.get('http://localhost:5000/api/admin/reservations')
      ]);

      const activeRentals = rentalsRes.data;
      const completedRentals = historyRes.data;
      const users = usersRes.data;
      const movies = moviesRes.data;
      const activeReservations = reservationsRes.data;

      // Calculate total revenue
      const totalRevenue = [...activeRentals, ...completedRentals].reduce(
        (sum, rental) => sum + (rental.total_price || 0), 0
      );

      // Calculate monthly revenue (last 6 months)
      const monthlyRevenue = calculateMonthlyRevenue([...activeRentals, ...completedRentals]);

      // Get popular movies (most rented)
      const popularMovies = getPopularMovies([...activeRentals, ...completedRentals]);

      // Get recent rentals
      const recentRentals = [...activeRentals, ...completedRentals]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // Low stock movies (stock < 3)
      const lowStockMovies = movies.filter(m => m.stock > 0 && m.stock < 3);

      setAnalytics({
        totalRevenue: totalRevenue.toFixed(2),
        totalRentals: activeRentals.length + completedRentals.length,
        activeRentals: activeRentals.length,
        completedRentals: completedRentals.length,
        totalUsers: users.length,
        premiumUsers: users.filter(u => u.is_premium === 1).length,
        totalMovies: movies.length,
        lowStockMovies: lowStockMovies.length,
        popularMovies: popularMovies.slice(0, 5),
        recentRentals: recentRentals,
        monthlyRevenue: monthlyRevenue,
        totalReservations: activeRentals.length + completedRentals.length,
        activeReservations: activeReservations.length
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  const calculateMonthlyRevenue = (rentals) => {
    const months = {};
    const last6Months = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      months[monthName] = 0;
      last6Months.push(monthName);
    }
    
    rentals.forEach(rental => {
      if (rental.created_at) {
        const date = new Date(rental.created_at);
        const monthName = date.toLocaleString('default', { month: 'short' });
        if (months[monthName] !== undefined) {
          months[monthName] += rental.total_price || 0;
        }
      }
    });
    
    return last6Months.map(month => ({
      month,
      revenue: months[month]
    }));
  };

  const getPopularMovies = (rentals) => {
    const movieCount = {};
    rentals.forEach(rental => {
      const title = rental.title;
      movieCount[title] = (movieCount[title] || 0) + 1;
    });
    
    return Object.entries(movieCount)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📊 Analytics Dashboard</h2>
        <button className="btn btn-primary" onClick={fetchAnalytics}>
          🔄 Refresh Data
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-gradient-primary text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Total Revenue</h6>
                  <h2 className="mb-0">${analytics.totalRevenue}</h2>
                </div>
                <div className="display-4 opacity-50">💰</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-gradient-success text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Total Rentals</h6>
                  <h2 className="mb-0">{analytics.totalRentals}</h2>
                </div>
                <div className="display-4 opacity-50">🎬</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-gradient-info text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Active Rentals</h6>
                  <h2 className="mb-0">{analytics.activeRentals}</h2>
                </div>
                <div className="display-4 opacity-50">📀</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card bg-gradient-warning text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Active Reservations</h6>
                  <h2 className="mb-0">{analytics.activeReservations}</h2>
                </div>
                <div className="display-4 opacity-50">📝</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Users</h6>
                  <h3 className="mb-0">{analytics.totalUsers}</h3>
                </div>
                <div className="display-6">👥</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Premium Users</h6>
                  <h3 className="mb-0">{analytics.premiumUsers}</h3>
                </div>
                <div className="display-6">👑</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total Movies</h6>
                  <h3 className="mb-0">{analytics.totalMovies}</h3>
                </div>
                <div className="display-6">🎬</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Low Stock Alert</h6>
                  <h3 className="mb-0 text-warning">{analytics.lowStockMovies}</h3>
                </div>
                <div className="display-6">⚠️</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h6 className="mb-0">📈 Monthly Revenue (Last 6 Months)</h6>
            </div>
            <div className="card-body">
              {analytics.monthlyRevenue.length > 0 ? (
                <div>
                  {analytics.monthlyRevenue.map((item, index) => (
                    <div key={index} className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <small>{item.month}</small>
                        <small className="text-primary">${item.revenue.toFixed(2)}</small>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-primary" 
                          style={{ 
                            width: `${(item.revenue / Math.max(...analytics.monthlyRevenue.map(m => m.revenue), 1)) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">No revenue data available</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h6 className="mb-0">🎬 Popular Movies (Most Rented)</h6>
            </div>
            <div className="card-body">
              {analytics.popularMovies.length > 0 ? (
                analytics.popularMovies.map((movie, index) => (
                  <div key={index} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small>
                        {index + 1}. {movie.title}
                      </small>
                      <small className="text-success">{movie.count} rentals</small>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-success" 
                        style={{ 
                          width: `${(movie.count / analytics.popularMovies[0].count) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted py-4">No rental data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Rentals Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h6 className="mb-0">🔄 Recent Rentals Activity</h6>
        </div>
        <div className="card-body">
          {analytics.recentRentals.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Movie</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Rented Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentRentals.map((rental, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{rental.title}</strong>
                      </td>
                      <td>{rental.customer_name || 'N/A'}</td>
                      <td>
                        <span className={`badge ${rental.rental_type === 'week' ? 'bg-info' : 'bg-warning'}`}>
                          {rental.rental_type === 'week' ? 'Weekly' : 'Monthly'}
                        </span>
                      </td>
                      <td>${rental.total_price}</td>
                      <td>{formatDate(rental.created_at)}</td>
                      <td>
                        <span className={`badge ${rental.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {rental.status === 'active' ? 'Active' : 'Returned'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">No recent rentals</div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="row mt-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4">📀</div>
              <h5 className="mt-2">{analytics.completedRentals}</h5>
              <p className="text-muted mb-0">Completed Rentals</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4">⭐</div>
              <h5 className="mt-2">{((analytics.premiumUsers / analytics.totalUsers) * 100 || 0).toFixed(1)}%</h5>
              <p className="text-muted mb-0">Premium Conversion Rate</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="display-4">💰</div>
              <h5 className="mt-2">${(analytics.totalRevenue / (analytics.totalRentals || 1)).toFixed(2)}</h5>
              <p className="text-muted mb-0">Average Rental Value</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;