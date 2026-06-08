import React, { useState } from 'react';
import axios from 'axios';

function RentModal({ movie, onClose, onSuccess }) {
  const [rentalType, setRentalType] = useState('week');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const calculatePrice = () => {
    if (rentalType === 'week') return movie.price_week;
    return movie.price_month;
  };

  const calculateEndDate = () => {
    const startDate = new Date();
    if (rentalType === 'week') {
      startDate.setDate(startDate.getDate() + 7);
    } else {
      startDate.setMonth(startDate.getMonth() + 1);
    }
    return startDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // For now, just show success message
    // We'll connect to backend rental API later
    setTimeout(() => {
      alert(`✅ Movie rented successfully!\n\nMovie: ${movie.title}\nCustomer: ${customerName}\nRental Type: ${rentalType}\nTotal Price: $${calculatePrice()}\nEnd Date: ${calculateEndDate()}`);
      onSuccess();
      onClose();
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">🎬 Rent Movie</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Movie Details */}
              <div className="mb-3 p-2 bg-light rounded">
                <h6 className="text-primary">Movie Details:</h6>
                <p className="mb-1"><strong>{movie.title}</strong></p>
                <p className="mb-1 text-muted small">{movie.description?.substring(0, 100)}</p>
                <div className="mt-2">
                  <span className="badge bg-warning text-dark">⭐ {movie.rating || 'N/A'}</span>
                  <span className="badge bg-secondary ms-1">📅 {movie.release_year}</span>
                  <span className="badge bg-success ms-1">📀 Stock: {movie.stock}</span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="mb-3">
                <label className="form-label">Customer Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Customer Email *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter customer email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>

              {/* Rental Type Selection */}
              <div className="mb-3">
                <label className="form-label">Rental Period *</label>
                <div className="row">
                  <div className="col-6">
                    <div className={`border rounded p-2 text-center ${rentalType === 'week' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                         onClick={() => setRentalType('week')}
                         style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="rentalType"
                        value="week"
                        checked={rentalType === 'week'}
                        onChange={(e) => setRentalType(e.target.value)}
                        className="me-2"
                      />
                      <label className="mb-0">1 Week</label>
                      <div className="text-primary fw-bold">${movie.price_week}</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className={`border rounded p-2 text-center ${rentalType === 'month' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                         onClick={() => setRentalType('month')}
                         style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="rentalType"
                        value="month"
                        checked={rentalType === 'month'}
                        onChange={(e) => setRentalType(e.target.value)}
                        className="me-2"
                      />
                      <label className="mb-0">1 Month</label>
                      <div className="text-primary fw-bold">${movie.price_month}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="alert alert-success mt-3">
                <h6 className="mb-2">Order Summary:</h6>
                <p className="mb-1">Movie: {movie.title}</p>
                <p className="mb-1">Rental: {rentalType === 'week' ? '7 Days' : '30 Days'}</p>
                <p className="mb-1">Start Date: {new Date().toLocaleDateString()}</p>
                <p className="mb-1">End Date: {calculateEndDate()}</p>
                <hr />
                <h5 className="mb-0 text-success">Total: ${calculatePrice()}</h5>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Processing...' : '💰 Confirm Rental'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RentModal;