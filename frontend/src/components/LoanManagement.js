import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoanManagement = () => {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const accNo = localStorage.getItem('acc_no');  // Retrieve account number from local storage

    useEffect(() => {
        fetchLoans();
    }, []);

    // LoanManagement.js
const fetchLoans = () => {
    setLoading(true);
    const accNo = localStorage.getItem('acc_no'); // Ensure `acc_no` is fetched properly

    if (!accNo) {
        setError('Account number is missing. Please log in again.');
        setLoading(false);
        return;
    }

    axios.get(`http://localhost:5000/api/loans?acc_no=${accNo}`)
        .then(response => {
            if (response.data.length === 0) {
                setError('No loans available.');
            } else {
                setLoans(response.data);
            }
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching loans:', error);
            setError(`Failed to fetch loans. Error: ${error.response?.statusText || 'Server error'}`);
            setLoading(false);
        });
};
    

    const handleLoanSubmission = (e) => {
        e.preventDefault();
        if (!loanAmount || !startDate || !dueDate) {
            alert('Please ensure all fields are filled.');
            return;
        }
        axios.post('/api/loans', {
            loan_amt: loanAmount,
            acc_no: accNo,  // Use the account number from local storage
            start_date: startDate,
            due_date: dueDate
        })
            .then(response => {
                alert('Loan applied successfully!');
                fetchLoans();  // Refresh the list of loans
            })
            .catch(error => {
                alert('Failed to apply for loan: ' + (error.response?.data?.message || 'Server error'));
                console.error('Error applying for loan:', error);
            });
    };
    const handleRepayment = (loanId) => {
        const amount = prompt('Enter repayment amount:');
        if (!amount || amount <= 0) {
            alert('Please enter a valid repayment amount.');
            return;
        }
    
        axios.post(`http://localhost:5000/api/loans/${loanId}/repay`, { amount })
            .then(response => {
                alert('Repayment successful!');
                setLoans(loans.map(loan => 
                    loan.loan_id === response.data.loan_id 
                        ? { 
                            ...loan, 
                            total_repaid: response.data.total_repaid,
                            last_repayment_date: response.data.last_repayment_date,
                        }
                        : loan
                ));
            })
            .catch(error => {
                alert('Repayment failed: ' + (error.response?.data?.message || 'Server error'));
                console.error('Repayment error:', error);
            });
    };
    

    return (
        <div>
            <h2>Your Loans</h2>
            <form onSubmit={handleLoanSubmission}>
                <input
                    type="number"
                    placeholder="Loan Amount"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    required
                />
                <input
                    type="date"
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                />
                <input
                    type="date"
                    placeholder="Due Date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                />
                <button type="submit">Apply for Loan</button>
            </form>
            {loading && <p>Loading loans...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loans.length > 0 ? (
                loans.map(loan => (
                    <div key={loan.loan_id}>
                        <p>Loan Amount: {loan.loan_amt}</p>
                        <p>Total Repaid: {loan.total_repaid || 0}</p>
                        <p>Remaining Balance: {loan.loan_amt - loan.total_repaid}</p>
                        <p>Last Repayment Date: {loan.last_repayment_date || 'N/A'}</p>
                        <button onClick={() => handleRepayment(loan.loan_id)}>Repay</button>
                    </div>
                ))
            ) : <p>No loans to display.</p>}
        </div>
    );
};

export default LoanManagement;
