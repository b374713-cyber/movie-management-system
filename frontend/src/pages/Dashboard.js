import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import AdminHome from '../components/admin/AdminHome';
import ManageMovies from '../components/admin/ManageMovies';
import ManageUsers from '../components/admin/ManageUsers';
import AllRentals from '../components/admin/AllRentals';
import Analytics from '../components/admin/Analytics';
import PremiumManage from '../components/admin/PremiumManage';
import SpinWin from '../components/admin/SpinWin';
import EmployeeHome from '../components/employee/EmployeeHome';
import BrowseMovies from '../components/employee/BrowseMovies';
import MyRentals from '../components/employee/MyRentals';
import 'bootstrap/dist/css/bootstrap.min.css';
import PremiumSubscribers from '../components/admin/PremiumSubscribers';
function Dashboard({ userRole }) {
  const [activeTab, setActiveTab] = useState('home');
  const isAdmin = userRole === 'admin';

  // Define tabs based on role
  const employeeTabs = [
    { id: 'home', name: '🏠 Home', component: <EmployeeHome /> },
    { id: 'movies', name: '🎬 Browse Movies', component: <BrowseMovies /> },
    { id: 'myrentals', name: '📝 My Rentals', component: <MyRentals /> }
  ];
const adminTabs = [
  { id: 'home', name: '🏠 Home', component: <AdminHome /> },
  { id: 'movies', name: '🎬 Manage Movies', component: <ManageMovies /> },
  { id: 'users', name: '👥 Manage Users', component: <ManageUsers /> },
  { id: 'rentals', name: '💰 All Rentals', component: <AllRentals /> },
  { id: 'premium', name: '👑 Premium Subscribers', component: <PremiumSubscribers /> }, // ← ADD THIS
  { id: 'analytics', name: '📊 Analytics', component: <Analytics /> },
  // { id: 'spin', name: '🎁 Spin & Win', component: <SpinWin /> }
];

  const tabs = isAdmin ? adminTabs : employeeTabs;
  const currentComponent = tabs.find(tab => tab.id === activeTab)?.component || tabs[0].component;

  return (
    <div className="container-fluid min-vh-100 bg-light">
      <Navbar userRole={userRole} />

      {/* Tabs */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid px-4">
          <ul className="nav nav-tabs border-0">
            {tabs.map((tab) => (
              <li key={tab.id} className="nav-item">
                <button
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''} px-4 py-3`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                    borderBottom: activeTab === tab.id ? '3px solid #0d6efd' : 'none',
                    color: activeTab === tab.id ? '#0d6efd' : '#6c757d'
                  }}
                >
                  {tab.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Content Area */}
      <div className="container-fluid px-4 py-4">
        {currentComponent}
      </div>
    </div>
  );
}

export default Dashboard;