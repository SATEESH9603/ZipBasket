import React from "react";

export default function PayoutCard({
  balance = 0,
  nextPayoutDate = null,
  onRequest,
  onHistory,
}) {
  return (
    <div className="card payout">
      <div className="card-head">
        <h3>Payouts</h3>
      </div>

      <div className="payout-body">
        <div className="payout-balance">
          <div className="label">Available Balance</div>
          <div className="value">₹{Number(balance || 0).toLocaleString()}</div>
        </div>
        <div className="payout-next">
          <div className="label">Next Payout</div>
          <div className="value">{nextPayoutDate || "—"}</div>
        </div>
      </div>

      <div className="payout-actions">
        <button className="cta" onClick={onRequest}>Request Payout</button>
        <button className="cta ghost" onClick={onHistory}>Payout History</button>
      </div>
    </div>
  );
}
