const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Create a loan
router.post('/', async (req, res) => {
    const { loan_amt, acc_no, manager_id } = req.body;
    try {
        const newLoan = await pool.query(
            'INSERT INTO Loans (loan_amt, acc_no, manager_id) VALUES ($1, $2, $3) RETURNING *',
            [loan_amt, acc_no, manager_id]
        );
        res.json(newLoan.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all loans
router.get('/', async (req, res) => {
    try {
        const loans = await pool.query('SELECT * FROM Loans');
        res.json(loans.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific loan by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const loan = await pool.query('SELECT * FROM Loans WHERE loan_id = $1', [id]);
        if (loan.rows.length === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        res.json(loan.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a loan
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedLoan = await pool.query('DELETE FROM Loans WHERE loan_id = $1 RETURNING *', [id]);
        if (deletedLoan.rows.length === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        res.json({ message: 'Loan deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
    