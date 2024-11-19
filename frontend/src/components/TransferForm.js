import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';  // Assuming you store user context here

const TransferForm = () => {
    const [receiverId, setReceiverId] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Suppose you have a context that provides the logged-in user's details
    const { user } = useContext(UserContext);
    const senderId = user.cust_id;  // This needs to be correctly retrieved from context or props

    const handleTransfer = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!receiverId || parseFloat(amount) <= 0) {
            setError('Receiver ID and valid amount are required.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/customers/transfer', {
                sender_id: senderId, // Use context or passed-down prop for sender ID
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
                    <label>Receiver ID:</label>
                    <input
                        type="text"
                        placeholder="Enter Receiver ID"
                        value={receiverId}
                        onChange={(e) => setReceiverId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Amount:</label>
                    <input
                        type="number"
                        placeholder="Enter Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
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
