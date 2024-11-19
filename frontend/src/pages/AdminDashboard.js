import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const [custId, setCustId] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/customers/admin/transactions');
                setTransactions(response.data);
            } catch (err) {
                console.error('Error fetching transactions:', err.message);
            }
        };

        const fetchCustomers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/customers/admin/customers');
                setCustomers(response.data);
            } catch (err) {
                console.error('Error fetching customers:', err.message);
            }
        };

        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchTransactions(), fetchCustomers()]);
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleAddMoney = async (e) => {
        e.preventDefault();
    
        console.log('Add Money Request:', { custId, amount });
    
        try {
            const response = await axios.post('http://localhost:5000/api/admin/add-money', {
                cust_id: parseInt(custId), // Ensure cust_id is sent as an integer
                amount: parseFloat(amount), // Ensure amount is parsed as a float
            });
    
            alert(response.data.message);
            setCustId('');
            setAmount('');
            setMessage('');
        } catch (err) {
            console.error('Error adding money:', err.response?.data?.message || err.message);
            setError(err.response?.data?.message || 'Failed to add money');
        }
    };
    

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <h2>Add Money to Customer Account</h2>
            <form onSubmit={handleAddMoney}>
                <input
                    type="text"
                    placeholder="Customer ID"
                    value={custId}
                    onChange={(e) => setCustId(e.target.value)} // Update the state
                    required
                />
                <input
                    type="number"
                    placeholder="Amount (PKR)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)} // Update the state
                    required
                />

                <button type="submit">Add Money</button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>All Transactions</h2>
            <table>
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
                    {transactions.map((transaction) => (
                        <tr key={transaction.transaction_id}>
                            <td>{transaction.transaction_id}</td>
                            <td>{transaction.sender_id}</td>
                            <td>{transaction.receiver_id}</td>
                            <td>{transaction.amount} PKR</td>
                            <td>{format(new Date(transaction.date_time), 'MMM dd, yyyy HH:mm')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>All Customers</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr key={customer.cust_id}>
                            <td>{customer.cust_id}</td>
                            <td>{`${customer.f_name} ${customer.l_name}`}</td>
                            <td>{customer.email}</td>
                            <td>{customer.phone}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
