import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function AllRentals() {
  const [activeSection, setActiveSection] = useState('reserved');
  const [reservations, setReservations] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [purchasedMovies, setPurchasedMovies] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerReservations, setCustomerReservations] = useState([]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [rentalType, setRentalType] = useState('week');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchAllStats();
  }, []);

  useEffect(() => {
    if (activeSection === 'reserved') {
      fetchReservations();
    } else if (activeSection === 'rented') {
      fetchActiveRentals();
    } else if (activeSection === 'purchased') {
      fetchPurchasedMovies();
    } else if (activeSection === 'history') {
      fetchHistory();
    }
  }, [activeSection]);

  // Send notification to customer when reservation is received
const notifyCustomerReceived = async (userId, movieTitle) => {
  try {
    await axios.post('http://localhost:5000/api/send-customer-notification', {
      userId: userId,
      title: '📦 Movie Ready for Pickup',
      body: `Your reservation for "${movieTitle}" is ready! Please visit the store.`
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

  const fetchAllStats = async () => {
    try {
      const [reservationsRes, rentalsRes, purchasedRes, historyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/reservations'),
        axios.get('http://localhost:5000/api/admin/rentals'),
        axios.get('http://localhost:5000/api/admin/purchased'),
        axios.get('http://localhost:5000/api/admin/rentals/history')
      ]);
      
      setReservations(reservationsRes.data);
      setActiveRentals(rentalsRes.data);
      setPurchasedMovies(purchasedRes.data);
      setHistory(historyRes.data);
      
      const allRentals = [...rentalsRes.data, ...purchasedRes.data, ...historyRes.data];
      const total = allRentals.reduce((sum, r) => sum + (r.total_price || 0), 0);
      setTotalRevenue(total);
      
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateInvoicePDF = (data, type, price) => {
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
    doc.text(`Invoice Number: INV-${Date.now()}-${data.id || data.reservationId}`, 20, 55);
    doc.text(`Date: ${date.toLocaleString()}`, 20, 62);
    doc.text(`Customer: ${data.customer_name || data.fullname}`, 20, 69);
    doc.text(`Email: ${data.customer_email || data.email}`, 20, 76);
    
    let transactionType = '';
    if (type === 'week') transactionType = 'Weekly Rental';
    else if (type === 'month') transactionType = 'Monthly Rental';
    else transactionType = 'Purchase';
    
    const startY = 95;
    doc.setFillColor(220, 53, 69);
    doc.rect(20, startY, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Description', 25, startY + 7);
    doc.text('Type', 100, startY + 7);
    doc.text('Amount', 165, startY + 7);
    
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, startY + 10, 170, 10);
    doc.text(data.title, 25, startY + 17);
    doc.text(transactionType, 100, startY + 17);
    doc.text(`$${price}`, 165, startY + 17, { align: 'right' });
    
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
    
    doc.save(`invoice-${data.customer_name || data.fullname}-${Date.now()}.pdf`);
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      showMessage('Failed to load reservations', 'error');
    }
    setLoading(false);
  };

  const fetchActiveRentals = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/rentals');
      setActiveRentals(response.data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
      showMessage('Failed to load rentals', 'error');
    }
    setLoading(false);
  };

  const fetchPurchasedMovies = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/purchased');
      setPurchasedMovies(response.data);
    } catch (error) {
      console.error('Error fetching purchased movies:', error);
      showMessage('Failed to load purchased movies', 'error');
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/rentals/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
      showMessage('Failed to load history', 'error');
    }
    setLoading(false);
  };

  const searchCustomers = async () => {
    if (searchTerm.length < 2) {
      showMessage('Please enter at least 2 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/customers/search?q=${searchTerm}`);
      setSearchResults(response.data);
      if (response.data.length === 0) {
        showMessage('No customers found', 'error');
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      showMessage('Search failed', 'error');
    }
    setLoading(false);
  };

  const fetchCustomerReservations = async (customer) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/customers/${customer.id}/reservations`);
      setCustomerReservations(response.data);
      setSelectedCustomer(customer);
      if (response.data.length === 0) {
        showMessage(`${customer.fullname} has no active reservations`, 'error');
      }
    } catch (error) {
      console.error('Error fetching customer reservations:', error);
      showMessage('Failed to load reservations', 'error');
    }
    setLoading(false);
  };

  const openReceiveModal = (reservation) => {
    setSelectedReservation(reservation);
    setRentalType('week');
    setShowReceiveModal(true);
  };

 const confirmReceive = async () => {
  if (!selectedReservation) return;
  
  setLoading(true);
  try {
    const response = await axios.post(
      `http://localhost:5000/api/admin/reservations/${selectedReservation.id}/receive`,
      { rentalType }
    );
    
    if (response.data.success) {
      showMessage(response.data.message);
      
      // Send push notification to customer
      await notifyCustomerReceived(selectedReservation.user_id, selectedReservation.title);
      
      if (rentalType === 'buy') {
        let amount = selectedReservation.price_month * 2;
        generateInvoicePDF(selectedReservation, rentalType, amount);
      }
      
      setShowReceiveModal(false);
      setSelectedCustomer(null);
      setCustomerReservations([]);
      setSearchTerm('');
      setSearchResults([]);
      fetchAllStats();
      fetchReservations();
    }
  } catch (error) {
    console.error('Error receiving reservation:', error);
    showMessage('Failed to process receive', 'error');
  }
  setLoading(false);
};
  const markAsReceived = async (reservationId, movieTitle) => {
    if (!window.confirm(`Mark "${movieTitle}" as received? This will remove it from customer's reservations.`)) return;
    
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/reservations/${reservationId}/mark-received`);
      if (response.data.success) {
        showMessage(`${movieTitle} marked as received!`, 'success');
        fetchReservations();
        fetchAllStats();
      }
    } catch (error) {
      console.error('Error marking as received:', error);
      showMessage('Failed to mark as received', 'error');
    }
    setLoading(false);
  };

  const handleGenerateInvoice = (item, type) => {
    let amount = item.total_price;
    let transactionType = type;
    
    if (type === 'purchase') {
      transactionType = 'buy';
    } else if (type === 'rental') {
      transactionType = item.rental_type;
    }
    
    const invoiceDataObj = {
      id: item.id,
      title: item.title,
      customer_name: item.customer_name,
      customer_email: item.customer_email,
    };
    
    generateInvoicePDF(invoiceDataObj, transactionType, amount);
    showMessage('Invoice generated!', 'success');
  };

  const handleReturnRental = async (rentalId, movieTitle) => {
    if (!window.confirm(`Return "${movieTitle}"? This will restore stock.`)) return;
    
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/rentals/${rentalId}/return`);
      if (response.data.success) {
        showMessage(`${movieTitle} returned successfully!`);
        fetchAllStats();
      }
    } catch (error) {
      console.error('Error returning rental:', error);
      showMessage('Failed to return rental', 'error');
    }
    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getPaymentStatusBadge = (status) => {
    if (status === 'paid') {
      return <span className="badge bg-success">✓ Paid Online</span>;
    } else if (status === 'cash') {
      return <span className="badge bg-warning">💰 Cash Pending</span>;
    } else {
      return <span className="badge bg-danger">⏳ Pending</span>;
    }
  };

  const sections = [
    { id: 'reserved', name: '📝 Reserved Films', count: reservations.length },
    { id: 'rented', name: '🎬 Active Rentals', count: activeRentals.length },
    { id: 'purchased', name: '💾 Purchased Films', count: purchasedMovies.length },
    { id: 'history', name: '✅ Completed Rentals', count: history.length },
    { id: 'receive', name: '📦 Receive Request' },
    { id: 'stats', name: '📊 Statistics' }
  ];

  return (
    <div>
      <h2 className="mb-4">🎬 Rental Management</h2>
      
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
        </div>
      )}

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="list-group shadow-sm">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span>{section.name}</span>
                {section.count !== undefined && (
                  <span className="badge bg-secondary rounded-pill">{section.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-9">
          {/* Section 1: Reserved Films */}
          {activeSection === 'reserved' && (
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📝 Active Reservations (48h window)</h5>
                <button className="btn btn-sm btn-light" onClick={fetchReservations}>🔄 Refresh</button>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : reservations.length === 0 ? (
                  <div className="alert alert-info">No active reservations</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Movie</th>
                          <th>Customer</th>
                          <th>Reserved At</th>
                          <th>Expires At</th>
                          <th>Payment Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((res) => (
                          <tr key={res.id}>
                            <td><strong>{res.title}</strong></td>
                            <td>{res.customer_name}<br /><small className="text-muted">{res.customer_email}</small></td>
                            <td>{formatDate(res.reserved_at)}</td>
                            <td className="text-warning">{formatDate(res.expires_at)}</td>
                            <td>{getPaymentStatusBadge(res.payment_status)}</td>
                            <td>
                              <button className="btn btn-success btn-sm me-1" onClick={() => openReceiveModal(res)}>📦 Receive</button>
                              <button className="btn btn-info btn-sm" onClick={() => markAsReceived(res.id, res.title)}>✓ Received</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Active Rentals */}
          {activeSection === 'rented' && (
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">🎬 Active Rentals</h5>
                <button className="btn btn-sm btn-light" onClick={fetchActiveRentals}>🔄 Refresh</button>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : activeRentals.length === 0 ? (
                  <div className="alert alert-info">No active rentals</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Movie</th>
                          <th>Customer</th>
                          <th>Type</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Price</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeRentals.map((rental) => (
                          <tr key={rental.id}>
                            <td><strong>{rental.title}</strong></td>
                            <td>{rental.customer_name}<br /><small className="text-muted">{rental.customer_email}</small></td>
                            <td><span className={`badge ${rental.rental_type === 'week' ? 'bg-info' : 'bg-warning'}`}>{rental.rental_type === 'week' ? 'Weekly' : 'Monthly'}</span></td>
                            <td>{formatDateOnly(rental.start_date)}</td>
                            <td className="text-danger">{formatDateOnly(rental.end_date)}</td>
                            <td>${rental.total_price}</td>
                            <td>
                              <button className="btn btn-danger btn-sm me-1" onClick={() => handleReturnRental(rental.id, rental.title)}>↩️ Return</button>
                              <button className="btn btn-info btn-sm" onClick={() => handleGenerateInvoice(rental, 'rental')}>📄 Invoice</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Purchased Films */}
          {activeSection === 'purchased' && (
            <div className="card shadow-sm">
              <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">💾 Purchased Films (Permanent)</h5>
                <button className="btn btn-sm btn-light" onClick={fetchPurchasedMovies}>🔄 Refresh</button>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : purchasedMovies.length === 0 ? (
                  <div className="alert alert-info">No purchased movies yet</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Movie</th>
                          <th>Customer</th>
                          <th>Email</th>
                          <th>Purchase Date</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchasedMovies.map((rental) => (
                          <tr key={rental.id} className="table-danger">
                            <td><strong>{rental.title}</strong></td>
                            <td>{rental.customer_name}</td>
                            <td>{rental.customer_email}</td>
                            <td>{formatDateOnly(rental.start_date)}</td>
                            <td className="text-success fw-bold">${rental.total_price}</td>
                            <td>
                              <button className="btn btn-info btn-sm" onClick={() => handleGenerateInvoice(rental, 'purchase')}>📄 Invoice</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Completed Rentals History */}
          {activeSection === 'history' && (
            <div className="card shadow-sm">
              <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">✅ Completed Rentals History</h5>
                <button className="btn btn-sm btn-light" onClick={fetchHistory}>🔄 Refresh</button>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
                ) : history.length === 0 ? (
                  <div className="alert alert-info">No rental history</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Movie</th>
                          <th>Customer</th>
                          <th>Type</th>
                          <th>Rented Date</th>
                          <th>Returned</th>
                          <th>Price</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((rental) => (
                          <tr key={rental.id}>
                            <td>{rental.title}</td>
                            <td>{rental.customer_name}</td>
                            <td><span className="badge bg-secondary">{rental.rental_type === 'week' ? 'Weekly' : rental.rental_type === 'purchase' ? 'Purchase' : 'Monthly'}</span></td>
                            <td>{formatDateOnly(rental.start_date)}</td>
                            <td>{formatDateOnly(rental.end_date)}</td>
                            <td>${rental.total_price}</td>
                            <td>
                              <button className="btn btn-info btn-sm" onClick={() => handleGenerateInvoice(rental, 'rental')}>📄 Invoice</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Receive Request */}
          {activeSection === 'receive' && (
            <div className="card shadow-sm">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">📦 Receive Reserved Movie</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <label className="form-label fw-bold">Search Customer by Name:</label>
                  <div className="input-group">
                    <input type="text" className="form-control" placeholder="Enter customer name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && searchCustomers()} />
                    <button className="btn btn-primary" onClick={searchCustomers}>🔍 Search</button>
                  </div>
                </div>

                {searchResults.length > 0 && !selectedCustomer && (
                  <div className="mb-4">
                    <label className="form-label fw-bold">Select Customer:</label>
                    <div className="list-group">
                      {searchResults.map((customer) => (
                        <button key={customer.id} className="list-group-item list-group-item-action" onClick={() => fetchCustomerReservations(customer)}>
                          <strong>{customer.fullname}</strong><br /><small className="text-muted">{customer.email}</small>
                          {customer.is_premium === 1 && <span className="badge bg-warning ms-2">👑 Premium</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCustomer && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Customer: <strong>{selectedCustomer.fullname}</strong></h6>
                      <button className="btn btn-sm btn-secondary" onClick={() => { setSelectedCustomer(null); setCustomerReservations([]); setSearchTerm(''); setSearchResults([]); }}>Clear</button>
                    </div>
                    {loading ? (
                      <div className="text-center py-3"><div className="spinner-border spinner-border-sm"></div></div>
                    ) : customerReservations.length === 0 ? (
                      <div className="alert alert-warning">No active reservations for this customer</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Movie</th>
                              <th>Reserved At</th>
                              <th>Expires At</th>
                              <th>Payment Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customerReservations.map((res) => (
                              <tr key={res.id}>
                                <td><strong>{res.title}</strong></td>
                                <td>{formatDate(res.reserved_at)}</td>
                                <td className="text-warning">{formatDate(res.expires_at)}</td>
                                <td>{getPaymentStatusBadge(res.payment_status)}</td>
                                <td><button className="btn btn-success btn-sm" onClick={() => openReceiveModal(res)}>📦 Receive</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 6: Statistics */}
          {activeSection === 'stats' && (
            <div className="card shadow-sm">
              <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">📊 Statistics</h5>
                <button className="btn btn-sm btn-light" onClick={fetchAllStats}>🔄 Refresh All</button>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="card bg-primary text-white"><div className="card-body text-center"><h2 className="mb-0">{reservations.length}</h2><p className="mb-0">Active Reservations</p></div></div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-success text-white"><div className="card-body text-center"><h2 className="mb-0">{activeRentals.length}</h2><p className="mb-0">Active Rentals</p></div></div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-danger text-white"><div className="card-body text-center"><h2 className="mb-0">{purchasedMovies.length}</h2><p className="mb-0">Purchased Movies</p></div></div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card bg-info text-white"><div className="card-body text-center"><h2 className="mb-0">${totalRevenue.toFixed(2)}</h2><p className="mb-0">Total Revenue</p></div></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receive Modal */}
      {showReceiveModal && selectedReservation && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">📦 Process Movie</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowReceiveModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Movie:</strong> {selectedReservation.title}</p>
                <p><strong>Customer:</strong> {selectedReservation.customer_name}</p>
                <p><strong>Reserved:</strong> {formatDate(selectedReservation.reserved_at)}</p>
                <p><strong>Payment Status:</strong> {getPaymentStatusBadge(selectedReservation.payment_status)}</p>
                <hr />
                <label className="form-label fw-bold">Select Transaction Type:</label>
                <div className="mb-3">
                  <div className="form-check">
                    <input type="radio" className="form-check-input" name="rentalType" value="week" checked={rentalType === 'week'} onChange={() => setRentalType('week')} />
                    <label className="form-check-label">🎬 Weekly Rental - ${selectedReservation.price_week}<br /><small className="text-muted">Returns after 7 days</small></label>
                  </div>
                  <div className="form-check mt-2">
                    <input type="radio" className="form-check-input" name="rentalType" value="month" checked={rentalType === 'month'} onChange={() => setRentalType('month')} />
                    <label className="form-check-label">🎬 Monthly Rental - ${selectedReservation.price_month}<br /><small className="text-muted">Returns after 30 days</small></label>
                  </div>
                  <div className="form-check mt-2">
                    <input type="radio" className="form-check-input" name="rentalType" value="buy" checked={rentalType === 'buy'} onChange={() => setRentalType('buy')} />
                    <label className="form-check-label">💰 Purchase (Sell) - ${(selectedReservation.price_month * 2).toFixed(2)}<br /><small className="text-muted">Customer owns the movie permanently</small></label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReceiveModal(false)}>Cancel</button>
                <button type="button" className="btn btn-success" onClick={confirmReceive}>{rentalType === 'buy' ? 'Confirm Purchase' : 'Confirm Rental'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllRentals;