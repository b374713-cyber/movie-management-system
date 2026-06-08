import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManageUsers() {
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    fullname: '',
    emailUsername: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    role: 'employee'
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    fullname: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    role: ''
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      const allUsers = response.data;
      
      // Split users by role (employees + admins)
      setEmployees(allUsers.filter(user => user.role === 'employee' || user.role === 'admin'));
      setCustomers(allUsers.filter(user => user.role === 'customer'));
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('Failed to load users', 'error');
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    let value = e.target.value;
    
    // Auto-format phone number for +961
    if (e.target.name === 'phone') {
      let digits = value.replace(/\D/g, '');
      
      if (value.startsWith('+')) {
        if (digits.length === 0) {
          value = '+';
        } else if (digits.length <= 3) {
          value = `+${digits}`;
        } else {
          const countryCode = digits.substring(0, 3);
          const firstPart = digits.substring(3, 5);
          const secondPart = digits.substring(5, 8);
          const thirdPart = digits.substring(8, 11);
          
          value = `+${countryCode}`;
          if (firstPart) value += ` ${firstPart}`;
          if (secondPart) value += ` ${secondPart}`;
          if (thirdPart) value += ` ${thirdPart}`;
        }
      } else if (digits.length > 0) {
        if (digits.length <= 3) {
          value = `+${digits}`;
        } else {
          const countryCode = digits.substring(0, 3);
          const firstPart = digits.substring(3, 5);
          const secondPart = digits.substring(5, 8);
          const thirdPart = digits.substring(8, 11);
          
          value = `+${countryCode}`;
          if (firstPart) value += ` ${firstPart}`;
          if (secondPart) value += ` ${secondPart}`;
          if (thirdPart) value += ` ${thirdPart}`;
        }
      }
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleEditInputChange = (e) => {
    let value = e.target.value;
    
    // Auto-format phone number for +961
    if (e.target.name === 'phone') {
      let digits = value.replace(/\D/g, '');
      
      if (value.startsWith('+')) {
        if (digits.length === 0) {
          value = '+';
        } else if (digits.length <= 3) {
          value = `+${digits}`;
        } else {
          const countryCode = digits.substring(0, 3);
          const firstPart = digits.substring(3, 5);
          const secondPart = digits.substring(5, 8);
          const thirdPart = digits.substring(8, 11);
          
          value = `+${countryCode}`;
          if (firstPart) value += ` ${firstPart}`;
          if (secondPart) value += ` ${secondPart}`;
          if (thirdPart) value += ` ${thirdPart}`;
        }
      } else if (digits.length > 0) {
        if (digits.length <= 3) {
          value = `+${digits}`;
        } else {
          const countryCode = digits.substring(0, 3);
          const firstPart = digits.substring(3, 5);
          const secondPart = digits.substring(5, 8);
          const thirdPart = digits.substring(8, 11);
          
          value = `+${countryCode}`;
          if (firstPart) value += ` ${firstPart}`;
          if (secondPart) value += ` ${secondPart}`;
          if (thirdPart) value += ` ${thirdPart}`;
        }
      }
    }
    
    setEditFormData({
      ...editFormData,
      [e.target.name]: value
    });
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^\+961\s?\d{2}\s?\d{3}\s?\d{3}$/;
    return phoneRegex.test(phone);
  };

  const getFullEmail = () => {
    if (!formData.emailUsername) return '';
    const cleanUsername = formData.emailUsername.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanUsername}@movie.com`;
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    const fullEmail = getFullEmail();
    if (!fullEmail) {
      showMessage('Please enter an email username', 'error');
      return;
    }
    
    if (formData.phone && !validatePhone(formData.phone)) {
      showMessage('Phone number must start with +961 followed by 8 digits', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/register', {
        fullname: formData.fullname,
        email: fullEmail,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        role: 'employee'
      });
      
      showMessage(`Employee ${formData.fullname} added successfully! Email: ${fullEmail}`);
      setShowAddModal(false);
      setFormData({
        fullname: '',
        emailUsername: '',
        password: '',
        phone: '',
        dateOfBirth: '',
        role: 'employee'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error adding employee:', error);
      showMessage(error.response?.data?.message || 'Failed to add employee', 'error');
    }
    setLoading(false);
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    
    if (editFormData.phone && !validatePhone(editFormData.phone)) {
      showMessage('Phone number must start with +961 followed by 8 digits', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.put(`http://localhost:5000/api/users/${editFormData.id}`, {
        fullname: editFormData.fullname,
        phone: editFormData.phone,
        dateOfBirth: editFormData.dateOfBirth,
        role: editFormData.role
      });
      
      showMessage(`Employee ${editFormData.fullname} updated successfully!`);
      setShowEditModal(false);
      setSelectedEmployee(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating employee:', error);
      showMessage('Failed to update employee', 'error');
    }
    setLoading(false);
  };

  const handleDeleteEmployee = async (userId, userName, userRole) => {
    // Prevent deleting admin account
    if (userRole === 'admin') {
      showMessage('Cannot delete Admin account', 'error');
      return;
    }
    
    if (!window.confirm(`Delete "${userName}"? This action cannot be undone.`)) return;
    
    setLoading(true);
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`);
      showMessage(`${userName} deleted successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showMessage(error.response?.data?.error || 'Failed to delete user', 'error');
    }
    setLoading(false);
  };

  const openEditModal = (employee) => {
    setSelectedEmployee(employee);
    setEditFormData({
      id: employee.id,
      fullname: employee.fullname || '',
      email: employee.email,
      phone: employee.phone || '',
      dateOfBirth: employee.dateOfBirth || '',
      role: employee.role
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>👥 User Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          ➕ Add New Employee
        </button>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage({ text: '', type: '' })}></button>
        </div>
      )}

      <div className="row">
        {/* Employees Section */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                👔 Employees & Admins ({employees.length})
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary"></div>
                </div>
              ) : employees.length === 0 ? (
                <div className="alert alert-info mb-0">No employees found</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>DOB</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <strong>{user.fullname || user.email}</strong>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>{user.phone || '—'}</td>
                          <td>{user.dateOfBirth ? formatDate(user.dateOfBirth) : '—'}</td>
                          <td>
                            {user.role !== 'admin' && (
                              <>
                                <button 
                                  className="btn btn-sm btn-warning me-1"
                                  onClick={() => openEditModal(user)}
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeleteEmployee(user.id, user.fullname || user.email, user.role)}
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </>
                            )}
                            {user.role === 'admin' && (
                              <span className="text-muted small">Protected</span>
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
        </div>

        {/* Customers Section (View Only) */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                🧑 Customers ({customers.length})
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary"></div>
                </div>
              ) : customers.length === 0 ? (
                <div className="alert alert-info mb-0">No customers found</div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Premium</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <strong>{user.fullname || user.email}</strong>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            {user.is_premium === 1 ? (
                              <span className="badge bg-warning">👑 Premium</span>
                            ) : (
                              <span className="badge bg-secondary">Free</span>
                            )}
                          </td>
                          <td>{formatDate(user.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">➕ Add New Employee</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddEmployee}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullname"
                      className="form-control"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Username *</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="emailUsername"
                        className="form-control"
                        value={formData.emailUsername}
                        onChange={handleInputChange}
                        placeholder="john"
                        required
                      />
                      <span className="input-group-text">@movie.com</span>
                    </div>
                    {formData.emailUsername && (
                      <small className="text-muted">
                        Full email: <strong>{formData.emailUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}@movie.com</strong>
                      </small>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength="4"
                    />
                    <small className="text-muted">Minimum 4 characters</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number (Lebanon)</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+961 3 123 456"
                    />
                    <small className="text-muted">Format: +961 XX XXX XXX</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="form-control"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">✏️ Edit Employee</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditEmployee}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullname"
                      className="form-control"
                      value={editFormData.fullname}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={editFormData.email}
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      name="role"
                      className="form-select"
                      value={editFormData.role}
                      onChange={handleEditInputChange}
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number (Lebanon)</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={editFormData.phone}
                      onChange={handleEditInputChange}
                      placeholder="+961 3 123 456"
                    />
                    <small className="text-muted">Format: +961 XX XXX XXX</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="form-control"
                      value={formatDateForInput(editFormData.dateOfBirth)}
                      onChange={handleEditInputChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;