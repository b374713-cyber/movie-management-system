import React from 'react';

function PremiumManage() {
  return (
    <div>
      <h2 className="mb-4">Premium Subscriptions</h2>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card border-warning shadow-lg">
            <div className="card-header bg-warning text-dark text-center">
              <h3 className="mb-0">👑 Premium Plan</h3>
            </div>
            <div className="card-body text-center">
              <h1 className="display-4">$50</h1>
              <p className="lead">per month</p>
              <hr />
              <ul className="list-unstyled">
                <li>✅ Unlimited Rentals</li>
                <li>✅ Priority Access</li>
                <li>✅ No Late Fees</li>
                <li>✅ Exclusive Content</li>
              </ul>
              <button className="btn btn-warning btn-lg mt-3">
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PremiumManage;