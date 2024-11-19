const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Admin-only route to add money to a user's account
router.post('/add-money', async (req, res) => {
    const { cust_id, amount } = req.body;
    console.log('Incoming add money request:', { cust_id, amount }); // Debug log

    if (!cust_id || isNaN(cust_id)) {
        console.error('Invalid customer ID:', cust_id);
        return res.status(400).json({ message: 'Invalid customer ID' });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
        console.error('Invalid amount:', amount);
        return res.status(400).json({ message: 'Invalid amount' });
    }

    try {
        const account = await pool.query('SELECT * FROM Accounts WHERE cust_id = $1', [parseInt(cust_id)]);
        if (account.rows.length === 0) {
            console.error('Account not found for customer ID:', cust_id);
            return res.status(404).json({ message: 'Account not found' });
        }

        const updatedAccount = await pool.query(
            'UPDATE Accounts SET balance = balance + $1 WHERE cust_id = $2 RETURNING *',
            [parseFloat(amount), parseInt(cust_id)]
        );

        res.status(200).json({ message: 'Money added successfully', account: updatedAccount.rows[0] });
    } catch (err) {
        console.error('Error adding money:', err.message);
        res.status(500).json({ message: 'Failed to add money' });
    }
});
// Admin-only route to fetch all transactions
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await pool.query('SELECT * FROM Transactions ORDER BY date_time DESC');
        res.json(transactions.rows);
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Admin-only route to fetch all customers
router.get('/customers', async (req, res) => {
    try {
        const customers = await pool.query('SELECT * FROM Customers');
        res.json(customers.rows);
    } catch (err) {
        console.error('Error fetching customers:', err.message);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

module.exports = router;
