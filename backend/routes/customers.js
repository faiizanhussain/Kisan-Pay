const express = require('express');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
// Removed JWT import and authentication
// const jwt = require('jsonwebtoken');

const router = require('express').Router();
// Fetch all customers
router.get('/', async (req, res) => {
    try {
        const customers = await pool.query('SELECT * FROM Customers');
        res.json(customers.rows);
    } catch (err) {
        console.error('Error fetching customers:', err.message);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});
    
// Customer Signup
router.post('/signup', async (req, res) => {
    const { f_name, l_name, email, phone, pass, cnic, u_name } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const newCustomer = await client.query(
            'INSERT INTO Customers (f_name, l_name, email, phone, pass, cnic, u_name) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING cust_id',
            [f_name, l_name, email, phone, pass, cnic, u_name]
        );

        // Automatically create an account for the customer
        const accountNumber = Math.floor(100000000000 + Math.random() * 900000000000);
        await client.query(
            'INSERT INTO Accounts (cust_id, acc_no, balance) VALUES ($1, $2, $3)',
            [newCustomer.rows[0].cust_id, accountNumber, 0]
        );


        await client.query('COMMIT');
        res.status(201).json({ message: 'Signup successful', cust_id: newCustomer.rows[0].cust_id });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error during signup:', err.message);
        res.status(500).json({ error: 'Signup failed' });
    } finally {
        client.release();
    }
});

// Customer Login (no token)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user by email
        const user = await pool.query('SELECT * FROM Customers WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        if (user.rows[0].pass !== password) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Return role and cust_id
        res.status(200).json({
            role: user.rows[0].role,
            cust_id: user.rows[0].cust_id,
        });
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch Customer Balance (no token)
router.get('/balance', async (req, res) => {
    const { cust_id } = req.query;

    if (!cust_id || isNaN(cust_id)) {
        return res.status(400).json({ message: 'Invalid or missing Customer ID' });
    }

    try {
        const account = await pool.query('SELECT balance FROM Accounts WHERE cust_id = $1', [parseInt(cust_id)]);
        if (account.rows.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json({ balance: account.rows[0].balance });
    } catch (err) {
        console.error('Error fetching balance:', err.message);
        res.status(500).json({ message: 'Failed to fetch balance' });
    }
});

// Create Customer Account (no token)
router.post('/create-account', async (req, res) => {
    const { cust_id } = req.body;

    if (!cust_id || isNaN(cust_id)) {
        return res.status(400).json({ message: 'Invalid or missing Customer ID' });
    }

    try {
        const existingAccount = await pool.query('SELECT * FROM Accounts WHERE cust_id = $1', [parseInt(cust_id)]);

        if (existingAccount.rows.length > 0) {
            return res.status(400).json({ message: 'Account already exists' });
        }

        const accountNumber = Math.floor(100000000000 + Math.random() * 900000000000);

        const newAccount = await pool.query(
            'INSERT INTO Accounts (cust_id, acc_no, balance) VALUES ($1, $2, $3) RETURNING *',
            [parseInt(cust_id), accountNumber, 0]
        );

        res.status(201).json({
            message: 'Account created successfully',
            account: newAccount.rows[0],
        });
    } catch (err) {
        console.error('Error creating account:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Money to Account (Admin Only)
router.post('/admin/add-money', async (req, res) => {
    const { cust_id, amount } = req.body;

    console.log('Received Add Money Request:', { cust_id, amount });

    try {
        if (!cust_id || !amount || amount <= 0) {
            console.log('Invalid Input:', { cust_id, amount });
            return res.status(400).json({ message: 'Invalid input' });
        }

        const updatedAccount = await pool.query(
            'UPDATE Accounts SET balance = balance + $1 WHERE cust_id = $2 RETURNING *',
            [amount, cust_id]
        );

        console.log('Update Query Result:', updatedAccount.rows);

        if (updatedAccount.rows.length === 0) {
            console.log('Account Not Found for cust_id:', cust_id);
            return res.status(404).json({ message: 'Account not found' });
        }

        res.json({ message: 'Money added successfully', account: updatedAccount.rows[0] });
    } catch (err) {
        console.error('Error in /admin/add-money:', err.message);
        res.status(500).json({ message: 'Failed to add money' });
    }
});
// Fetch All Transactions (Admin Only)
router.get('/admin/transactions', async (req, res) => {
    try {
        const transactions = await pool.query('SELECT * FROM Transactions ORDER BY date_time DESC');
        res.json(transactions.rows);
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Fetch All Customers (Admin Only)
router.get('/admin/customers', async (req, res) => {
    try {
        const customers = await pool.query('SELECT * FROM Customers');
        res.json(customers.rows);
    } catch (err) {
        console.error('Error fetching customers:', err.message);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});
// Fetch Customer Profile Details
router.get('/profile', async (req, res) => {
    try {
        const { cust_id } = req.query;
        if (!cust_id) {
            return res.status(400).json({ message: 'Customer ID is required' });
        }
        const customer = await pool.query('SELECT f_name, l_name, email, phone, cnic, u_name FROM Customers WHERE cust_id = $1', [cust_id]);
        if (customer.rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer.rows[0]);
    } catch (err) {
        console.error('Error fetching profile details:', err.message);
        res.status(500).json({ message: 'Failed to fetch profile details' });
    }
});
// Fetch Customer Transactions
router.get('/transactions', async (req, res) => {
    const { cust_id } = req.query;

    if (!cust_id) {
        return res.status(400).json({ message: 'Customer ID is required' });
    }

    try {
        const transactions = await pool.query(
            `SELECT transaction_id, sender_id, receiver_id, amount, date_time 
             FROM Transactions 
             WHERE sender_id = $1 OR receiver_id = $1 
             ORDER BY date_time DESC`,
            [cust_id]
        );

        res.json(transactions.rows);
    } catch (err) {
        console.error('Error fetching transactions:', err.message);
        res.status(500).json({ message: 'Failed to fetch transactions' });
    }
});
// Updated customer.js
// Updated /transfer endpoint in customer.js
router.post('/transfer', async (req, res) => {
    console.log('Incoming request body:', req.body);

    const { sender_id, receiver_account, amount } = req.body;

    // Input validation
    if (!sender_id || isNaN(sender_id)) {
        console.error('Invalid sender ID:', sender_id);
        return res.status(400).json({ message: 'Invalid sender ID' });
    }
    if (!receiver_account || isNaN(receiver_account)) {
        console.error('Invalid receiver account:', receiver_account);
        return res.status(400).json({ message: 'Invalid receiver account' });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
        console.error('Invalid transfer amount:', amount);
        return res.status(400).json({ message: 'Invalid transfer amount' });
    }

    console.log('Validated request data:', { sender_id, receiver_account, amount });

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check sender account
        const senderAccount = await client.query(
            'SELECT balance FROM Accounts WHERE cust_id = $1',
            [parseInt(sender_id)]
        );

        if (senderAccount.rows.length === 0) {
            console.error('Sender account not found:', sender_id);
            throw new Error('Sender account not found');
        }

        if (senderAccount.rows[0].balance < amount) {
            console.error('Insufficient balance:', senderAccount.rows[0].balance);
            throw new Error('Insufficient balance');
        }

        // Check receiver account
        const receiverAccount = await client.query(
            'SELECT cust_id FROM Accounts WHERE acc_no = $1',
            [parseInt(receiver_account)]
        );

        if (receiverAccount.rows.length === 0) {
            console.error('Receiver account not found:', receiver_account);
            throw new Error('Receiver account not found');
        }

        // Deduct amount from sender
        await client.query(
            'UPDATE Accounts SET balance = balance - $1 WHERE cust_id = $2',
            [parseFloat(amount), parseInt(sender_id)]
        );

        // Add amount to receiver
        await client.query(
            'UPDATE Accounts SET balance = balance + $1 WHERE acc_no = $2',
            [parseFloat(amount), parseInt(receiver_account)]
        );

        // Log the transaction
        await client.query(
            'INSERT INTO Transactions (sender_id, receiver_id, amount, date_time) VALUES ($1, $2, $3, NOW())',
            [parseInt(sender_id), parseInt(receiver_account), parseFloat(amount)]
        );

        await client.query('COMMIT');
        console.log('Transfer successful');
        res.status(200).json({ message: 'Transfer successful' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error during transfer:', err.message);
        res.status(500).json({ message: err.message || 'Transfer failed' });
    } finally {
        client.release();
    }
});
    module.exports = router;
