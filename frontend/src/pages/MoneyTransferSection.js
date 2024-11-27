import React, { useState } from 'react';
import axios from 'axios';

const MoneyTransferSection = ({ 
  navigate, 
  onTransferComplete 
}) => {
  const [receiverAccount, setReceiverAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleTransfer = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (!receiverAccount || parseFloat(transferAmount) <= 0) {
      setError('Please provide valid receiver account and amount');
      return;
    }

    try {
      const cust_id = localStorage.getItem('cust_id');
      if (!cust_id) {
        alert('Customer ID is missing. Please log in again.');
        navigate('/login');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/customers/transfer', {
        cust_id,
        receiver_account: receiverAccount,
        amount: parseFloat(transferAmount),
      });

      setMessage(response.data.message);
      setReceiverAccount('');
      setTransferAmount('');

      // Trigger balance and transactions refresh in parent component
      onTransferComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed');
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">Money Transfer</h2>
      <form className="form" onSubmit={handleTransfer}>
        <input
          type="text"
          className="form-input"
          placeholder="Receiver Account Number"
          value={receiverAccount}
          onChange={(e) => setReceiverAccount(e.target.value)}
        />
        <input
          type="number"
          className="form-input"
          placeholder="Amount (PKR)"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Transfer
        </button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default MoneyTransferSection;