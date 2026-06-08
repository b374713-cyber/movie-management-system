import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rented');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rentalsRes, purchasedRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/rentals'),
        axios.get('http://localhost:5000/api/admin/purchased')
      ]);
      
      setRentals(rentalsRes.data);
      setPurchases(purchasedRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('Failed to load data', 'error');
    }
    setLoading(false);
  };

  const generateInvoicePDF = (item, type) => {
    const doc = new jsPDF();
    const date = new Date();
    
    doc.setFillColor(220, 53, 69);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('🎬 MOVIE DB', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Transaction Invoice', 105, 32, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Invoice Number: INV-${Date.now()}-${item.id}`, 20, 55);
    doc.text(`Date: ${date.toLocaleString()}`, 20, 62);
    doc.text(`Customer: ${item.customer_name}`, 20, 69);
    doc.text(`Email: ${item.customer_email}`, 20, 76);
    
    let transactionTypeText = '';
    let duration = '';
    if (type === 'rental') {
      transactionTypeText = item.rental_type === 'week' ? 'Weekly Rental' : 'Monthly Rental';
      duration = item.rental_type === 'week' ? '7 days' : '30 days';
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
    doc.text(item.title, 25, startY + 17);
    doc.text(transactionTypeText, 100, startY + 17);
    doc.text(duration, 140, startY + 17);
    doc.text(`$${item.total_price}`, 175, startY + 17, { align: 'right' });
    
    const totalY = startY + 30;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', 140, totalY);
    doc.setTextColor(40, 167, 69);
    doc.text(`$${item.total_price}`, 175, totalY, { align: 'right' });
    
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont(undefined, 'normal');
    doc.text('Thank you for choosing Movie DB!', 105, 280, { align: 'center' });
    
    doc.save(`invoice-${item.customer_name.replace(/\s/g, '_')}-${Date.now()}.pdf`);
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
        <p>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">📝 My Transactions</h2>
      
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          <button 
            className={`btn ${activeTab === 'rented' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('rented')}
          >
            🎬 Active Rentals ({rentals.length})
          </button>
          <button 
            className={`btn ${activeTab === 'purchased' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('purchased')}
          >
            💾 Purchased ({purchases.length})
          </button>
        </div>
      </div>

      {/* Active Rentals Tab */}
      {activeTab === 'rented' && (
        <div className="card shadow-sm">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">🎬 Active Rentals</h5>
          </div>
          <div className="card-body">
            {rentals.length === 0 ? (
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
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals.map((rental) => (
                      <tr key={rental.id}>
                        <td><strong>{rental.title}</strong></td>
                        <td>
                          {rental.customer_name}
                          <br />
                          <small className="text-muted">{rental.customer_email}</small>
                        </td>
                        <td>
                          <span className={`badge ${rental.rental_type === 'week' ? 'bg-info' : 'bg-warning'}`}>
                            {rental.rental_type === 'week' ? 'Weekly' : 'Monthly'}
                          </span>
                        </td>
                        <td>{formatDate(rental.start_date)}</td>
                        <td className="text-danger">{formatDate(rental.end_date)}</td>
                        <td>${rental.total_price}</td>
                        <td>
                          <button 
                            className="btn btn-info btn-sm"
                            onClick={() => generateInvoicePDF(rental, 'rental')}
                          >
                            📄 Invoice
                          </button>
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

      {/* Purchased Tab */}
      {activeTab === 'purchased' && (
        <div className="card shadow-sm">
          <div className="card-header bg-danger text-white">
            <h5 className="mb-0">💾 Purchased Movies</h5>
          </div>
          <div className="card-body">
            {purchases.length === 0 ? (
              <div className="alert alert-info">No purchased movies</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Movie</th>
                      <th>Customer</th>
                      <th>Purchase Date</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((purchase) => (
                      <tr key={purchase.id} className="table-danger">
                        <td><strong>{purchase.title}</strong></td>
                        <td>
                          {purchase.customer_name}
                          <br />
                          <small className="text-muted">{purchase.customer_email}</small>
                        </td>
                        <td>{formatDate(purchase.start_date)}</td>
                        <td className="text-success fw-bold">${purchase.total_price}</td>
                        <td>
                          <button 
                            className="btn btn-info btn-sm"
                            onClick={() => generateInvoicePDF(purchase, 'purchase')}
                          >
                            📄 Invoice
                          </button>
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
    </div>
  );
}

export default MyRentals;