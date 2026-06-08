import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function BrowseMovies() {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactionType, setTransactionType] = useState('week');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [customerSearch, setCustomerSearch] = useState('');

  const genres = ['All', 'Action', 'Comedy', 'Drama', 'Romance', 'Thriller', 'Sci-Fi'];

  useEffect(() => {
    fetchMovies();
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterMovies();
  }, [movies, searchTerm, selectedGenre]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/movies');
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      const customersList = response.data.filter(user => user.role === 'customer');
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const filterMovies = () => {
    let filtered = [...movies];
    
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedGenre !== 'All') {
      filtered = filtered.filter(movie => {
        const movieGenre = movie.genre || 'Action';
        return movieGenre === selectedGenre;
      });
    }
    
    setFilteredMovies(filtered);
  };

  const handleRentClick = (movie) => {
    setSelectedMovie(movie);
    setSelectedCustomer(null);
    setCustomerSearch('');
    setTransactionType('week');
    setShowTransactionModal(true);
  };

  const generateInvoicePDF = (data, type, price, customerName) => {
    const doc = new jsPDF();
    const date = new Date();
    
    doc.setFillColor(220, 53, 69);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('🎬 MOVIE DB', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Rental / Purchase Invoice', 105, 32, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Invoice Number: INV-${Date.now()}-${data.id}`, 20, 55);
    doc.text(`Date: ${date.toLocaleString()}`, 20, 62);
    doc.text(`Customer: ${customerName}`, 20, 69);
    doc.text(`Employee: ${localStorage.getItem('employeeName') || 'Store Employee'}`, 20, 76);
    
    let transactionTypeText = '';
    let duration = '';
    if (type === 'week') {
      transactionTypeText = 'Weekly Rental';
      duration = '7 days';
    } else if (type === 'month') {
      transactionTypeText = 'Monthly Rental';
      duration = '30 days';
    } else {
      transactionTypeText = 'Purchase';
      duration = 'Permanent';
    }
    
    const startY = 95;
    doc.setFillColor(220, 53, 69);
    doc.rect(20, startY, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Description', 25, startY + 7);
    doc.text('Type', 100, startY + 7);
    doc.text('Duration', 140, startY + 7);
    doc.text('Amount', 175, startY + 7);
    
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, startY + 10, 170, 10);
    doc.text(data.title, 25, startY + 17);
    doc.text(transactionTypeText, 100, startY + 17);
    doc.text(duration, 140, startY + 17);
    doc.text(`$${price}`, 175, startY + 17, { align: 'right' });
    
    const totalY = startY + 30;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 140, totalY);
    doc.setTextColor(40, 167, 69);
    doc.text(`$${price}`, 175, totalY, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont(undefined, 'normal');
    doc.text('Thank you for choosing Movie DB!', 105, 280, { align: 'center' });
    
    doc.save(`invoice-${customerName.replace(/\s/g, '_')}-${Date.now()}.pdf`);
  };

  const processTransaction = async () => {
    if (!selectedMovie || !selectedCustomer) {
      showMessage('Please select a customer', 'error');
      return;
    }
    
    setLoading(true);
    try {
      let amount = 0;
      let rentalType = transactionType;
      let status = 'active';
      
      if (transactionType === 'week') {
        amount = selectedMovie.price_week;
      } else if (transactionType === 'month') {
        amount = selectedMovie.price_month;
      } else if (transactionType === 'buy') {
        amount = selectedMovie.price_month * 2;
        rentalType = 'purchase';
        status = 'purchased';
      }
      
      const startDate = new Date();
      let endDate = new Date();
      if (transactionType === 'week') {
        endDate.setDate(endDate.getDate() + 7);
      } else if (transactionType === 'month') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate = startDate;
      }
      
      // Create rental/purchase record
      const response = await axios.post('http://localhost:5000/api/rentals/create', {
        userId: selectedCustomer.id,
        movieId: selectedMovie.id,
        rentalType: transactionType === 'buy' ? 'purchase' : transactionType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice: amount,
        status: status
      });
      
      if (response.data.success) {
        // Decrease stock
        await axios.put(`http://localhost:5000/api/movies/${selectedMovie.id}`, {
          stock: selectedMovie.stock - 1
        });
        
        // Generate invoice
        generateInvoicePDF(selectedMovie, transactionType, amount, selectedCustomer.fullname);
        
        showMessage(`${selectedMovie.title} ${transactionType === 'buy' ? 'purchased' : 'rented'} successfully for ${selectedCustomer.fullname}!`, 'success');
        
        setShowTransactionModal(false);
        setSelectedMovie(null);
        setSelectedCustomer(null);
        fetchMovies();
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      showMessage('Failed to process transaction', 'error');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading movies...</p>
      </div>
    );
  }

  const filteredCustomers = customers.filter(c => 
    c.fullname?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div>
      <h2 className="mb-4">🎬 Browse Movies</h2>
      
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
        </div>
      )}
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search by movie title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* Genre Filter Buttons */}
      <div className="mb-4">
        <div className="btn-group flex-wrap" role="group">
          {genres.map(genre => (
            <button
              key={genre}
              className={`btn ${selectedGenre === genre ? 'btn-primary' : 'btn-outline-secondary'} me-2 mb-2`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre === 'All' ? '🎬 All' : genre}
            </button>
          ))}
        </div>
      </div>
      
      {filteredMovies.length === 0 ? (
        <div className="alert alert-info">
          No movies found. Try a different search or genre.
        </div>
      ) : (
        <div className="row">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-img-top bg-dark text-center py-4" style={{ height: '200px' }}>
                  {movie.image_url ? (
                    <img 
                      src={movie.image_url.startsWith('http') ? movie.image_url : `http://localhost:5000${movie.image_url}`} 
                      alt={movie.title}
                      style={{ height: '100%', objectFit: 'cover', width: '100%' }}
                    />
                  ) : (
                    <div className="text-white pt-5">
                      <span style={{ fontSize: '3rem' }}>🎬</span>
                    </div>
                  )}
                </div>
                
                <div className="card-body">
                  <h5 className="card-title">{movie.title}</h5>
                  <span className="badge bg-info mb-2">{movie.genre || 'Action'}</span>
                  <p className="card-text text-muted small mt-2">
                    {movie.description?.substring(0, 100)}...
                  </p>
                  <div className="mb-2">
                    <span className="badge bg-warning text-dark">
                      ⭐ {movie.rating || 'N/A'}
                    </span>
                    <span className="badge bg-secondary ms-1">
                      📅 {movie.release_year || 'N/A'}
                    </span>
                    <span className={`badge ms-1 ${movie.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                      📀 {movie.stock > 0 ? `${movie.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      💵 Week: ${movie.price_week} | Month: ${movie.price_month}
                    </small>
                  </div>
                </div>
                <div className="card-footer bg-white">
                  <button 
                    className="btn btn-primary btn-sm w-100"
                    onClick={() => handleRentClick(movie)}
                    disabled={movie.stock === 0}
                  >
                    {movie.stock > 0 ? '🎬 Rent / Sell' : '❌ Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && selectedMovie && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">🎬 {selectedMovie.title}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowTransactionModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Select Customer:</label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Search customer by name or email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                  <div className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredCustomers.map(customer => (
                      <button
                        key={customer.id}
                        className={`list-group-item list-group-item-action ${selectedCustomer?.id === customer.id ? 'active' : ''}`}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <strong>{customer.fullname || customer.email}</strong>
                        <br />
                        <small>{customer.email}</small>
                        {customer.phone && <small className="text-muted"> | {customer.phone}</small>}
                      </button>
                    ))}
                    {filteredCustomers.length === 0 && customerSearch && (
                      <div className="list-group-item text-muted">No customers found</div>
                    )}
                  </div>
                </div>

                <hr />
                <label className="form-label fw-bold">Select Transaction Type:</label>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="transactionType"
                      value="week"
                      checked={transactionType === 'week'}
                      onChange={() => setTransactionType('week')}
                    />
                    <label className="form-check-label">
                      🎬 Weekly Rental - ${selectedMovie.price_week}
                      <br />
                      <small className="text-muted">Returns after 7 days</small>
                    </label>
                  </div>
                  <div className="form-check mt-2">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="transactionType"
                      value="month"
                      checked={transactionType === 'month'}
                      onChange={() => setTransactionType('month')}
                    />
                    <label className="form-check-label">
                      🎬 Monthly Rental - ${selectedMovie.price_month}
                      <br />
                      <small className="text-muted">Returns after 30 days</small>
                    </label>
                  </div>
                  <div className="form-check mt-2">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="transactionType"
                      value="buy"
                      checked={transactionType === 'buy'}
                      onChange={() => setTransactionType('buy')}
                    />
                    <label className="form-check-label">
                      💰 Purchase (Sell) - ${(selectedMovie.price_month * 2).toFixed(2)}
                      <br />
                      <small className="text-muted">Customer owns the movie permanently</small>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTransactionModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-success" onClick={processTransaction} disabled={!selectedCustomer}>
                  {transactionType === 'buy' ? 'Confirm Purchase' : 'Confirm Rental'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowseMovies;