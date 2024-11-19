// src/components/Balance.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const Balance = ({ customerId }) => {
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchBalance = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`${API_BASE_URL}/api/customers/balance`, {
                    params: { cust_id: customerId },
                });
                setBalance(response.data.balance);
            } catch (err) {
                if (err.response) {
                    setError(err.response.data.message || 'Server Error');
                } else if (err.request) {
                    setError('Network Error');
                } else {
                    setError('An unexpected error occurred');
                }
            } finally {
                setLoading(false);
            }
        };

        if (customerId) {
            fetchBalance();
        } else {
            setError('Customer ID is required');
            setLoading(false);
        }
    }, [customerId, API_BASE_URL]);

    return (
        <div>
            <h2>Account Balance</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <p>Balance: {balance} USD</p>
            )}
        </div>
    );
};

Balance.propTypes = {
    customerId: PropTypes.number.isRequired,
};

export default Balance;
