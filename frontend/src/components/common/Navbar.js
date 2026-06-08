import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ userRole }) {
  const isAdmin = userRole === 'admin';
  
  return (
    <nav className="navbar navbar-dark bg-primary shadow-sm">
      <div className="container-fluid px-4">
        <span className="navbar-brand h1 mb-0">
          🎬 Movie DB - {isAdmin ? 'Admin' : 'Employee'} Dashboard
        </span>
        <Link to="/">
          <button className="btn btn-outline-light">
            🚪 Logout
          </button>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;