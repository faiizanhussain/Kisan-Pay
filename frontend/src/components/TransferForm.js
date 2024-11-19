// frontend/src/components/TransferForm.js

import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';  // Ensure the path is correct

const TransferForm = () => {
    const [receiverId, setReceiverId] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Assuming UserContext provides the logged-in user's details
    const { user } = useContext(UserContext);
    const senderId = user?.cust_id;  // Safeguard in case user is undefined

    const handleTransfer = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!senderId) {
            setError('User not authenticated.');
            return;
        }

        if (!receiverId || parseFloat(amount) <= 0) {
            setError('Receiver ID and valid amount are required.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/customers/transfer', {
                sender_id: senderId,
                receiver_account: receiverId,
                amount: parseFloat(amount),
            });

            setMessage(response.data.message);
            setReceiverId('');
            setAmount('');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during the transfer');
            console.error('Error during transfer:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Money Transfer</h2>
            <form onSubmit={handleTransfer}>
                <div>
                    <label htmlFor="receiverId">Receiver ID:</label>
                    <input
                        type="text"
                        id="receiverId"
                        placeholder="Enter Receiver ID"
                        value={receiverId}
                        onChange={(e) => setReceiverId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        placeholder="Enter Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        min="1"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Transfer'}
                </button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default TransferForm;
