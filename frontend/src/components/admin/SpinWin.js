import React from 'react';

function SpinWin() {
  return (
    <div className="text-center">
      <h2 className="mb-4">🎁 Spin & Win</h2>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-body text-center py-5">
              <div className="display-1 mb-4">🎰</div>
              <h4>Top Renter of the Month</h4>
              <p className="text-muted">Coming soon!</p>
              <button className="btn btn-danger btn-lg" disabled>
                Spin the Wheel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpinWin;