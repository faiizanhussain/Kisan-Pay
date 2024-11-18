const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Create an account
router.post('/', async (req, res) => {
    const { balance, cust_id } = req.body;
    try {
        const newAccount = await pool.query(
            'INSERT INTO Accounts (balance, cust_id) VALUES ($1, $2) RETURNING *',
            [balance, cust_id]
        );
        res.json(newAccount.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all accounts
router.get('/', async (req, res) => {
    try {
        const accounts = await pool.query('SELECT * FROM Accounts');
        res.json(accounts.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific account by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const account = await pool.query('SELECT * FROM Accounts WHERE acc_no = $1', [id]);
        if (account.rows.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json(account.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an account
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { balance, cust_id } = req.body;
    try {
        const updatedAccount = await pool.query(
            'UPDATE Accounts SET balance = $1, cust_id = $2 WHERE acc_no = $3 RETURNING *',
            [balance, cust_id, id]
        );
        if (updatedAccount.rows.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json(updatedAccount.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an account
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedAccount = await pool.query('DELETE FROM Accounts WHERE acc_no = $1 RETURNING *', [id]);
        if (deletedAccount.rows.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
