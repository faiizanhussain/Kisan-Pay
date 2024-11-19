// frontend/src/components/TransactionHistory.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

const TransactionHistory = ({ customerId }) => {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/customers/transactions', {
                    params: { cust_id: customerId },
                });
                setTransactions(response.data);
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [customerId]);

    if (loading) return <p>Loading transactions...</p>;

    return (
        <div>
            <h2>Transaction History</h2>
            {error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : transactions.length === 0 ? (
                <p>No transactions found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Receiver</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.transaction_id}>
                                <td>{format(new Date(transaction.date_time), 'MMM dd, yyyy HH:mm')}</td>
                                <td>{transaction.sender_id === customerId ? 'Sent' : 'Received'}</td>
                                <td>{transaction.receiver_id}</td>
                                <td>{transaction.amount} PKR</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

TransactionHistory.propTypes = {
    customerId: PropTypes.number.isRequired,
};

export default TransactionHistory;
