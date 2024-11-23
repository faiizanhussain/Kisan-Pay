import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const AdminDashboard = () => {
    const [custId, setCustId] = useState('');
    const [amount, setAmount] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [transactionRes, customerRes, loanRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/customers/admin/transactions'),
                    axios.get('http://localhost:5000/api/customers/admin/customers'),
                    axios.get('http://localhost:5000/api/loans'),
                ]);
                setTransactions(transactionRes.data);
                setCustomers(customerRes.data);
                setLoans(loanRes.data);
            } catch (err) {
                console.error('Error fetching data:', err.message);
                setError('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddMoney = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/admin/add-money', {
                cust_id: parseInt(custId),
                amount: parseFloat(amount),
            });
            alert(response.data.message);
            setCustId('');
            setAmount('');
        } catch (err) {
            alert('Failed to add money.');
        }
    };

    const handleLoanApproval = async (loanId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/loans/${loanId}/${status}`);
            alert(`Loan ${status} successfully!`);
            setLoans(loans.map((loan) => (loan.loan_id === loanId ? { ...loan, status } : loan)));
        } catch (err) {
            alert('Failed to update loan status.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>Admin Dashboard</h1>

            <h2>Add Money to Customer Account</h2>
            <form onSubmit={handleAddMoney}>
                <input
                    type="text"
                    placeholder="Customer ID"
                    value={custId}
                    onChange={(e) => setCustId(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Amount (PKR)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <button type="submit">Add Money</button>
            </form>

            <h2>All Transactions</h2>
            <table>
                <thead>
                    <tr>
                        <th>Transaction ID</th>
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

            <h2>Loan Requests</h2>
            <table>
                <thead>
                    <tr>
                        <th>Loan ID</th>
                        <th>Account Number</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loans.map((loan) => (
                        <tr key={loan.loan_id}>
                            <td>{loan.loan_id}</td>
                            <td>{loan.acc_no}</td>
                            <td>{loan.loan_amt} PKR</td>
                            <td>{loan.status || 'Pending'}</td>
                            <td>
                                {loan.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleLoanApproval(loan.loan_id, 'approve')}>
                                            Approve
                                        </button>
                                        <button onClick={() => handleLoanApproval(loan.loan_id, 'reject')}>
                                            Reject
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
