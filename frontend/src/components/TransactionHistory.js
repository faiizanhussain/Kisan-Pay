import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const TransactionHistory = ({ customerId }) => {
    const [transactions, setTransactions] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/customers/${customerId}/transactions`);
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
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.transaction_id}>
                                <td>{format(new Date(transaction.date_time), 'MMM dd, yyyy HH:mm')}</td>
                                <td>{transaction.sender_id === customerId ? 'Sent' : 'Received'}</td>
                                <td>{transaction.amount} USD</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TransactionHistory;
