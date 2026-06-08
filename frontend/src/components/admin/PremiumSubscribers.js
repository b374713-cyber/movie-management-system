import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PremiumSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/premium-subscribers');
      setSubscribers(response.data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      showMessage('Failed to load subscribers', 'error');
    }
    setLoading(false);
  };

  const confirmPayment = async (subscriptionId, customerName) => {
    if (!window.confirm(`Confirm payment for ${customerName}? This will activate premium.`)) return;
    
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/premium/${subscriptionId}/confirm-payment`);
      if (response.data.success) {
        showMessage(`Payment confirmed for ${customerName}! Premium activated.`);
        fetchSubscribers();
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      showMessage('Failed to confirm payment', 'error');
    }
    setLoading(false);
  };

  const generateInvoice = (subscriber) => {
    setSelectedSubscriber(subscriber);
    setShowInvoiceModal(true);
  };

  const printInvoice = () => {
    const printContent = document.getElementById('invoice-content').innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate stats
  const totalSubscribers = subscribers.length;
  const totalRevenue = subscribers.reduce((sum, s) => sum + (s.amount || 0), 0);
  const onlinePayments = subscribers.filter(s => s.payment_method === 'online').length;
  const cashPayments = subscribers.filter(s => s.payment_method === 'cash').length;
  const pendingPayments = subscribers.filter(s => s.payment_status === 'pending').length;

  return (
    <div>
      <h2 className="mb-4">👑 Premium Subscribers</h2>
      
      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Total Subscribers</h6>
                  <h2 className="mb-0">{totalSubscribers}</h2>
                </div>
                <div className="display-4 opacity-50">👑</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Total Revenue</h6>
                  <h2 className="mb-0">${totalRevenue.toFixed(2)}</h2>
                </div>
                <div className="display-4 opacity-50">💰</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Online Payments</h6>
                  <h2 className="mb-0">{onlinePayments}</h2>
                </div>
                <div className="display-4 opacity-50">💳</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-white shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50 mb-2">Cash Payments</h6>
                  <h2 className="mb-0">{cashPayments}</h2>
                </div>
                <div className="display-4 opacity-50">💵</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments Alert */}
      {pendingPayments > 0 && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center">
          <span>
            ⚠️ {pendingPayments} pending cash payment{pendingPayments !== 1 ? 's' : ''} waiting for confirmation.
          </span>
        </div>
      )}

      {/* Subscribers Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">📋 Premium Subscribers List</h5>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="alert alert-info">No premium subscribers yet</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className={sub.payment_status === 'pending' ? 'table-warning' : ''}>
                      <td>
                        <strong>{sub.fullname}</strong>
                      </td>
                      <td>
                        <small>{sub.email}</small><br />
                        <small className="text-muted">{sub.phone || 'No phone'}</small>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {sub.subscription_type === 'monthly' ? 'Monthly' : 'Yearly'}
                        </span>
                      </td>
                      <td className="text-success fw-bold">${sub.amount}</td>
                      <td>
                        {sub.payment_method === 'online' ? (
                          <span className="badge bg-info">💳 Online</span>
                        ) : (
                          <span className="badge bg-warning">💰 Cash</span>
                        )}
                      </td>
                      <td>
                        {sub.payment_status === 'paid' ? (
                          <span className="badge bg-success">✓ Paid</span>
                        ) : (
                          <span className="badge bg-danger">⏳ Pending</span>
                        )}
                      </td>
                      <td>{formatDateOnly(sub.start_date)}</td>
                      <td>{formatDateOnly(sub.end_date)}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-info me-1"
                          onClick={() => generateInvoice(sub)}
                          title="View Invoice"
                        >
                          📄
                        </button>
                        {sub.payment_status === 'pending' && (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => confirmPayment(sub.id, sub.fullname)}
                            title="Confirm Payment"
                          >
                            ✓ Confirm
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && selectedSubscriber && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">📄 Invoice</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowInvoiceModal(false)}></button>
              </div>
              <div className="modal-body" id="invoice-content">
                {/* Invoice Design */}
                <div style={{ padding: 20 }}>
                  <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <h1 style={{ color: '#dc3545', marginBottom: 5 }}>🎬 Movie DB</h1>
                    <p style={{ color: '#666' }}>Premium Subscription Invoice</p>
                    <hr />
                  </div>
                  
                  <div style={{ marginBottom: 20 }}>
                    <p><strong>Invoice Number:</strong> {selectedSubscriber.invoice_number}</p>
                    <p><strong>Date:</strong> {formatDate(selectedSubscriber.created_at)}</p>
                  </div>
                  
                  <div style={{ marginBottom: 30, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 10 }}>
                    <h5>Customer Information</h5>
                    <p><strong>Name:</strong> {selectedSubscriber.fullname}</p>
                    <p><strong>Email:</strong> {selectedSubscriber.email}</p>
                    <p><strong>Phone:</strong> {selectedSubscriber.phone || 'Not provided'}</p>
                  </div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 30 }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: 10, textAlign: 'left' }}>Description</th>
                        <th style={{ padding: 10, textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: 10 }}>
                          Premium Subscription - {selectedSubscriber.subscription_type === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
                        </td>
                        <td style={{ padding: 10, textAlign: 'right' }}>${selectedSubscriber.amount}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: 10 }}>Payment Method</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>
                          {selectedSubscriber.payment_method === 'online' ? '💳 Online Payment' : '💰 Cash Payment'}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: 10 }}>Status</td>
                        <td style={{ padding: 10, textAlign: 'right' }}>
                          {selectedSubscriber.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: 10, fontWeight: 'bold' }}>Total</td>
                        <td style={{ padding: 10, textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>
                          ${selectedSubscriber.amount}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div style={{ textAlign: 'center', marginTop: 30, padding: 20, backgroundColor: '#f8f9fa', borderRadius: 10 }}>
                    <p style={{ margin: 0 }}>Thank you for choosing Movie DB Premium!</p>
                    <small>For any inquiries, please contact support@moviedb.com</small>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>
                  Close
                </button>
                <button type="button" className="btn btn-primary" onClick={printInvoice}>
                  🖨️ Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PremiumSubscribers;