import React, { useState } from 'react';
import axios from 'axios';

const TransferForm = ({ customerId }) => {
    const [receiverId, setReceiverId] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTransfer = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!receiverId) {
            setError('Receiver ID is required.');
            return;
        }
        if (parseFloat(amount) <= 0) {
            setError('Amount must be greater than zero.');
            return;
        }

        if (!window.confirm(`Are you sure you want to transfer $${amount} to Receiver ID ${receiverId}?`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/customers/transfer', {
                sender_id: customerId,
                receiver_id: receiverId,
                amount: parseFloat(amount),
            });
            setMessage(response.data.message);
            setReceiverId('');
            setAmount('');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
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
