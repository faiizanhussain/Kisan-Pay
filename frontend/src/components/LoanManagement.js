import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoanManagement = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const accNo = localStorage.getItem('acc_no'); // Retrieve account number from local storage

    useEffect(() => {
        fetchLoans();
    }, []);

    // Fetch loans for the current user
    const fetchLoans = () => {
        setLoading(true);
        const accNo = localStorage.getItem('acc_no'); // Ensure `acc_no` is fetched properly

        if (!accNo) {
            setError('Account number is missing. Please log in again.');
            setLoading(false);
            return;
        }

        axios
            .get(`http://localhost:5000/api/loans?acc_no=${accNo}`)
            .then((response) => {
                if (response.data.length === 0) {
                    setError('No loans available.');
                } else {
                    setLoans(response.data);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching loans:', error);
                setError(
                    `Failed to fetch loans. Error: ${error.response?.statusText || 'Server error'}`
                );
                setLoading(false);
            });
    };

    // Handle loan application submission
    const handleLoanSubmission = (e) => {
        e.preventDefault();
        console.log('Submitting loan:', { loanAmount, accNo, manager_id: 1, startDate, dueDate }); // Log form data
        if (!loanAmount || !startDate || !dueDate) {
            alert('Please ensure all fields are filled.');
            return;
        }
        axios
            .post('http://localhost:5000/api/loans', {
                loan_amt: loanAmount,
                acc_no: accNo,
                manager_id: 1,
                start_date: startDate,
                due_date: dueDate,
            })
            .then((response) => {
                console.log('Loan response:', response.data); // Log success response
                alert('Loan applied successfully!');
                fetchLoans(); // Refresh the list of loans
            })
            .catch((error) => {
                console.error('Error applying for loan:', error.message); // Log error
                alert('Failed to apply for loan: ' + (error.response?.data?.message || 'Server error'));
            });
    };

    // Handle loan repayment
    const handleRepayment = (loanId) => {
        const amount = prompt('Enter repayment amount:');
        if (!amount || amount <= 0) {
            alert('Please enter a valid repayment amount.');
            return;
        }

        axios
            .post(`http://localhost:5000/api/loans/${loanId}/repay`, { amount })
            .then((response) => {
                alert('Repayment successful!');
                setLoans(
                    loans.map((loan) =>
                        loan.loan_id === response.data.loan_id
                            ? {
                                  ...loan,
                                  total_repaid: response.data.total_repaid,
                                  last_repayment_date: response.data.last_repayment_date,
                              }
                            : loan
                    )
                );
            })
            .catch((error) => {
                alert('Repayment failed: ' + (error.response?.data?.message || 'Server error'));
                console.error('Repayment error:', error);
            });
    };

    return (
        <div className="min-h-screen mt-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6 text-center">Loan Management</h1>

                {/* Apply for Loan Form */}
                <div className="bg-white text-black shadow-lg rounded-lg p-6 mb-10 max-w-md mx-auto">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Apply for a New Loan</h2>
                    <form onSubmit={handleLoanSubmission}>
                        <div className="mb-4">
                            <label htmlFor="loanAmount" className="block text-gray-700 font-medium mb-2">
                                Loan Amount
                            </label>
                            <input
                                type="number"
                                id="loanAmount"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                placeholder="Enter loan amount"
                                value={loanAmount}
                                onChange={(e) => setLoanAmount(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="dueDate" className="block text-gray-700 font-medium mb-2">
                                Due Date
                            </label>
                            <input
                                type="date"
                                id="dueDate"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Apply for Loan
                        </button>
                    </form>
                </div>

                {/* Loan History */}
                <div className="bg-white text-black shadow-lg rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-center">Your Loan History</h2>
                    {loading && <p>Loading loans...</p>}
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {loans.length > 0 ? (
                        loans.map((loan) => (
                            <div
                                key={loan.loan_id}
                                className="border-b border-gray-300 py-4"
                            >
                                <p>Loan Amount: {loan.loan_amt}</p>
                                <p>Total Repaid: {loan.total_repaid || 0}</p>
                                <p>
                                    Remaining Balance:{' '}
                                    {loan.loan_amt - loan.total_repaid}
                                </p>
                                <p>Status: 
                                    <span
                                        className={
                                            loan.status === 'approved'
                                                ? 'text-green-500'
                                                : loan.status === 'rejected'
                                                ? 'text-red-500'
                                                : 'text-yellow-500'
                                        }
                                    >
                                        {' '}
                                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                    </span>
                                </p>
                                <p>
                                    Last Repayment Date:{' '}
                                    {loan.last_repayment_date || 'N/A'}
                                </p>
                                {loan.status === 'approved' && (
                                    <button
                                        onClick={() => handleRepayment(loan.loan_id)}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-green-600 transition-colors"
                                    >
                                        Repay
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center">No loans to display.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoanManagement;
