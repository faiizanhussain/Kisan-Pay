// Import statements using ES modules
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Create a transaction
router.post('/', async (req, res) => {
    const { acc_no, date_time, transfer_to, amount } = req.body;
    try {
        const newTransaction = await pool.query(
            'INSERT INTO Transactions (acc_no, date_time, transfer_to, amount) VALUES ($1, $2, $3, $4) RETURNING *',
            [acc_no, date_time, transfer_to, amount]
        );
        res.json(newTransaction.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await pool.query('SELECT * FROM Transactions');
        res.json(transactions.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific transaction by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const transaction = await pool.query('SELECT * FROM Transactions WHERE transaction_id = $1', [id]);
        if (transaction.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(transaction.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a transaction
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTransaction = await pool.query('DELETE FROM Transactions WHERE transaction_id = $1 RETURNING *', [id]);
        if (deletedTransaction.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json({ message: 'Transaction deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
