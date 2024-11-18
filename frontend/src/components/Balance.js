// src/components/Balance.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Balance = ({ customerId }) => {
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/customers/balance?cust_id=${customerId}`);

                setBalance(response.data.balance);
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred');
            }
        };

        fetchBalance();
    }, [customerId]);

    return (
        <div>
            <h2>Account Balance</h2>
            {error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <p>Balance: {balance !== null ? `${balance} USD` : 'Loading...'}</p>
            )}
        </div>
    );
};

export default Balance;
