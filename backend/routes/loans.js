import express from 'express';
import pool from '../config/db.js';

const router = express.Router();
// loans.js
router.get('/', async (req, res) => {
    const { acc_no } = req.query;

    try {
        const query = acc_no
            ? 'SELECT * FROM Loans WHERE acc_no = $1'
            : 'SELECT * FROM Loans';
        const values = acc_no ? [acc_no] : [];

        const loans = await pool.query(query, values);
        res.json(loans.rows);
    } catch (err) {
        console.error('Error fetching loans:', err.message);
        res.status(500).json({ error: 'Failed to retrieve loans', message: err.message });
    }
});

router.put('/:loan_id/approve', async (req, res) => {
    const { loan_id } = req.params;

    try {
        const result = await pool.query('UPDATE Loans SET status = $1 WHERE loan_id = $2 RETURNING *', [
            'approved',
            loan_id,
        ]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve loan', message: err.message });
    }
});

router.put('/:loan_id/reject', async (req, res) => {
    const { loan_id } = req.params;

    try {
        const result = await pool.query('UPDATE Loans SET status = $1 WHERE loan_id = $2 RETURNING *', [
            'rejected',
            loan_id,
        ]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to reject loan', message: err.message });
    }
});


router.post('/', async (req, res) => {
    const { loan_amt, acc_no, manager_id, start_date, due_date } = req.body;

    console.log('Request Body:', req.body); // Debugging log
    try {
        const newLoan = await pool.query(
            'INSERT INTO Loans (loan_amt, acc_no, manager_id, start_date, due_date, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',

            [loan_amt, acc_no, manager_id, start_date, due_date, 'pending']
        );
        console.log('Inserted Loan:', newLoan.rows[0]); // Debugging log
        res.json(newLoan.rows[0]);
    } catch (err) {
        console.error('Error inserting loan:', err.message);
        res.status(500).json({ error: 'Failed to insert loan', message: err.message });
    }
});



// Update a loan details
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { loan_amt, start_date, due_date } = req.body;
    try {
        const updatedLoan = await pool.query(
            'UPDATE Loans SET loan_amt = $1, start_date = $2, due_date = $3 WHERE loan_id = $4 RETURNING *',
            [loan_amt, start_date, due_date, id]
        );
        if (updatedLoan.rows.length === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        res.json(updatedLoan.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific loan by ID 
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const loan = await pool.query(
            'SELECT * FROM Loans WHERE loan_id = $1',
            [id]
        );
        if (loan.rows.length === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }
       
        const repayments = await pool.query(
            'SELECT * FROM Repayments WHERE loan_id = $1 ORDER BY due_date',
            [id]
        );
        res.json({ loan: loan.rows[0], repayments: repayments.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a loan
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedLoan = await pool.query(
            'DELETE FROM Loans WHERE loan_id = $1 RETURNING *',
            [id]
        );
        if (deletedLoan.rows.length === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        res.json({ message: 'Loan deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Update loan with repayment
router.post('/:loan_id/repay', async (req, res) => {
    const { loan_id } = req.params;
    const { amount } = req.body;

    try {
        // Fetch the loan details
        const loanResult = await pool.query('SELECT * FROM Loans WHERE loan_id = $1', [loan_id]);

        if (loanResult.rows.length === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }

        const loan = loanResult.rows[0];

        // Ensure the repayment amount is valid
        if (amount <= 0 || amount > parseFloat(loan.loan_amt) - parseFloat(loan.total_repaid)) {
            return res.status(400).json({ message: 'Invalid repayment amount' });
        }

        // Update the total repaid and deduct the repayment amount from the loan amount
        const newTotalRepaid = parseFloat(loan.total_repaid) + parseFloat(amount);
        const updatedLoan = await pool.query(
            `UPDATE Loans 
             SET total_repaid = $1, 
                 last_repayment_date = CURRENT_DATE 
             WHERE loan_id = $2 
             RETURNING *`,
            [newTotalRepaid, loan_id]
        );

        res.json(updatedLoan.rows[0]);
    } catch (err) {
        console.error('Error processing repayment:', err.message);
        res.status(500).json({ error: 'Failed to process repayment', message: err.message });
    }
});

export default router;