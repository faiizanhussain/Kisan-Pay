import React from 'react';

const TransactionsSection = ({ transactions }) => {
  return (
    <div className="section">
      <h2 className="section-title">Transaction History</h2>
      {transactions.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.transaction_id}>
                <td>{txn.transaction_id}</td>
                <td>{txn.sender_id}</td>
                <td>{txn.receiver_id}</td>
                <td>{txn.amount} PKR</td>
                <td>{new Date(txn.date_time).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
};

export default TransactionsSection;