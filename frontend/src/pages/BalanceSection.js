import React from 'react';
import axios from 'axios';

const BalanceSection = ({ 
  accountExists, 
  balance, 
  navigate, 
  setAccountExists, 
  setBalance 
}) => {
  const handleCreateAccount = async () => {
    const cust_id = localStorage.getItem('cust_id');

    if (!cust_id) {
      alert('Customer ID is missing. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/customers/create-account', { cust_id });
      alert(response.data.message);
      setAccountExists(true);
      setBalance(0);
    } catch (err) {
      console.error('Error creating account:', err.response?.data?.message || err.message);
      alert(err.response?.data?.message || 'Failed to create account');
    }
  };

  return (
    <div className="section">
      <h2 className="section-title">Account Balance</h2>
      {accountExists ? (
        <p>{balance !== null ? `${balance} PKR` : 'Loading...'}</p>
      ) : (
        <div>
          <p>You don't have an account yet.</p>
          <button onClick={handleCreateAccount} className="btn btn-primary">
            Create Account
          </button>
        </div>
      )}
    </div>
  );
};

export default BalanceSection;