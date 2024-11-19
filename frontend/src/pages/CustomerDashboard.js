import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [receiverAccount, setReceiverAccount] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [accountExists, setAccountExists] = useState(false);
    const [loading, setLoading] = useState(true); // Properly using this state
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (!role) {
            navigate('/login');
            return;
        }

        const fetchAccountData = async () => {
            try {
                const cust_id = localStorage.getItem('cust_id'); // Retrieve customer ID
                if (!cust_id) {
                    alert('Customer ID not found. Please log in again.');
                    navigate('/login'); // Redirect to login if `cust_id` is missing
                    return;
                }
                console.log('Retrieved cust_id from localStorage:', cust_id);


                console.log('Customer ID:', cust_id);

                // Fetch balance
                const balanceResponse = await axios.get('http://localhost:5000/api/customers/balance', {
                    params: { cust_id },
                });
                console.log('Balance Response:', balanceResponse.data);
                setBalance(balanceResponse.data.balance);
                setAccountExists(true); // Mark account as existing if balance is fetched

                // Fetch transactions
                const transactionsResponse = await axios.get('http://localhost:5000/api/customers/transactions', {
                    params: { cust_id },
                });
                console.log('Transactions Response:', transactionsResponse.data);
                setTransactions(transactionsResponse.data);

                // Fetch profile details
                const profileResponse = await axios.get('http://localhost:5000/api/customers/profile', {
                    params: { cust_id },
                });
                console.log('Profile Response:', profileResponse.data);
                setProfile(profileResponse.data);

                setLoading(false); // Mark loading as complete
            } catch (err) {
                console.error('Error in fetchAccountData:', err.message || err.response?.data?.message);
                setError('Failed to fetch account data');
                setLoading(false);
            }
        };


        fetchAccountData();
    }, [navigate]);

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
            setAccountExists(true); // Update UI state after account creation
            setBalance(0); // Assume new accounts have a balance of 0
        } catch (err) {
            console.error('Error creating account:', err.response?.data?.message || err.message);
            alert(err.response?.data?.message || 'Failed to create account');
        }
    };
    

    const handleTransfer = async (e) => {
        e.preventDefault();

        if (!receiverAccount || parseFloat(transferAmount) <= 0) {
            setError('Please provide valid receiver account and amount');
            return;
        }

        try {
            const cust_id = localStorage.getItem('cust_id'); // Retrieve customer ID for transactions
            const response = await axios.post('http://localhost:5000/api/customers/transfer', {
                cust_id,
                receiver_account: receiverAccount,
                amount: parseFloat(transferAmount),
            });
            setMessage(response.data.message);
            setReceiverAccount('');
            setTransferAmount('');

            // Refresh balance and transactions
            const balanceResponse = await axios.get('http://localhost:5000/api/customers/balance', {
                params: { cust_id },
            });
            setBalance(balanceResponse.data.balance);

            const transactionsResponse = await axios.get('http://localhost:5000/api/customers/transactions', {
                params: { cust_id },
            });
            setTransactions(transactionsResponse.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Transfer failed');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h1>Customer Dashboard</h1>
            {accountExists ? (
                <>
                    <h2>Balance</h2>
                    <p>{balance !== null ? `${balance} PKR` : 'Loading...'}</p>

                    <h2>Profile Details</h2>
                    {profile ? (
                        <ul>
                            <li>First Name: {profile.f_name}</li>
                            <li>Last Name: {profile.l_name}</li>
                            <li>Email: {profile.email}</li>
                            <li>Phone: {profile.phone}</li>
                            <li>CNIC: {profile.cnic}</li>
                            <li>Username: {profile.u_name}</li>
                        </ul>
                    ) : (
                        <p>Loading profile details...</p>
                    )}

                    <h2>Money Transfer</h2>
                    <form onSubmit={handleTransfer}>
                        <input
                            type="text"
                            placeholder="Receiver Account Number"
                            value={receiverAccount}
                            onChange={(e) => setReceiverAccount(e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Amount (PKR)"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                            required
                        />
                        <button type="submit">Transfer</button>
                    </form>
                    {message && <p style={{ color: 'green' }}>{message}</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    <h2>Transaction History</h2>
                    {transactions.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Receiver</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((txn) => (
                                    <tr key={txn.transaction_id}>
                                        <td>{txn.transaction_id}</td>
                                        <td>{txn.receiver_id}</td>
                                        <td>{txn.amount} PKR</td>
                                        <td>{new Date(txn.date_time).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No transactions found</p>
                    )}

                </>
            ) : (
                <>
                    <p>No account found</p>
                    <button onClick={handleCreateAccount}>Create Account</button>
                </>
            )}
        </div>
    );
};

export default CustomerDashboard;
