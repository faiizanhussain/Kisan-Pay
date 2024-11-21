// Import statements using ES modules
import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

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

// // Customer Login (no token)
// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         // Fetch user by email
//         const user = await pool.query('SELECT * FROM Customers WHERE email = $1', [email]);

//         if (user.rows.length === 0) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Check password
//         if (user.rows[0].pass !== password) {
//             return res.status(401).json({ message: 'Incorrect password' });
//         }

//         // Return role and cust_id
//         res.status(200).json({
//             role: user.rows[0].role,
//             cust_id: user.rows[0].cust_id,
//         });
//     } catch (err) {
//         console.error('Error during login:', err.message);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

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

// Customer Login (plain-text password)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Fetch user by email
        const userResult = await pool.query(
            `SELECT c.cust_id, c.role, c.pass, a.acc_no 
             FROM Customers c
             LEFT JOIN Accounts a ON c.cust_id = a.cust_id
             WHERE c.email = $1`,
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];

        // Check if the provided password matches the one stored in the database
        if (user.pass !== password) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Return role, cust_id, and acc_no to the frontend
        res.status(200).json({
            role: user.role,  // Ensure the role is either "customer" or "admin"
            cust_id: user.cust_id,
            acc_no: user.acc_no,  // Include the account number
        });
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ message: 'Server error' });
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

// Transfer endpoint
// router.post('/transfer', async (req, res) => {
//     console.log('Incoming request body:', req.body);

//     const { sender_id, receiver_account, amount } = req.body;

//     // Input validation
//     if (!sender_id || isNaN(sender_id)) {
//         console.error('Invalid sender ID:', sender_id);
//         return res.status(400).json({ message: 'Invalid sender ID' });
//     }
//     if (!receiver_account || isNaN(receiver_account)) {
//         console.error('Invalid receiver account:', receiver_account);
//         return res.status(400).json({ message: 'Invalid receiver account' });
//     }
//     if (!amount || isNaN(amount) || amount <= 0) {
//         console.error('Invalid transfer amount:', amount);
//         return res.status(400).json({ message: 'Invalid transfer amount' });
//     }

//     console.log('Validated request data:', { sender_id, receiver_account, amount });

//     const client = await pool.connect();

//     try {
//         await client.query('BEGIN');

//         // Check sender account
//         const senderAccount = await client.query(
//             'SELECT balance FROM Accounts WHERE cust_id = $1',
//             [parseInt(sender_id)]
//         );

//         if (senderAccount.rows.length === 0) {
//             console.error('Sender account not found:', sender_id);
//             throw new Error('Sender account not found');
//         }

//         if (senderAccount.rows[0].balance < amount) {
//             console.error('Insufficient balance:', senderAccount.rows[0].balance);
//             throw new Error('Insufficient balance');
//         }

//         // Check receiver account
//         const receiverAccount = await client.query(
//             'SELECT cust_id FROM Accounts WHERE acc_no = $1',
//             [parseInt(receiver_account)]
//         );

//         if (receiverAccount.rows.length === 0) {
//             console.error('Receiver account not found:', receiver_account);
//             throw new Error('Receiver account not found');
//         }

//         // Deduct amount from sender
//         await client.query(
//             'UPDATE Accounts SET balance = balance - $1 WHERE cust_id = $2',
//             [parseFloat(amount), parseInt(sender_id)]
//         );

//         // Add amount to receiver
//         await client.query(
//             'UPDATE Accounts SET balance = balance + $1 WHERE acc_no = $2',
//             [parseFloat(amount), parseInt(receiver_account)]
//         );

//         // Log the transaction
//         await client.query(
//             'INSERT INTO Transactions (sender_id, receiver_id, amount, date_time) VALUES ($1, $2, $3, NOW())',
//             [parseInt(sender_id), parseInt(receiver_account), parseFloat(amount)]
//         );

//         await client.query('COMMIT');
//         console.log('Transfer successful');
//         res.status(200).json({ message: 'Transfer successful' });
//     } catch (err) {
//         await client.query('ROLLBACK');
//         console.error('Error during transfer:', err.message);
//         res.status(500).json({ message: err.message || 'Transfer failed' });
//     } finally {
//         client.release();
//     }
// });

// Transfer endpoint
router.post('/transfer', async (req, res) => {
    console.log('Incoming request body:', req.body);

    const { cust_id, receiver_account, amount } = req.body;

    // Input validation
    if (!cust_id || isNaN(cust_id)) {
        console.error('Invalid customer ID:', cust_id);
        return res.status(400).json({ message: 'Invalid customer ID' });
    }
    if (!receiver_account || isNaN(receiver_account)) {
        console.error('Invalid receiver account:', receiver_account);
        return res.status(400).json({ message: 'Invalid receiver account' });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
        console.error('Invalid transfer amount:', amount);
        return res.status(400).json({ message: 'Invalid transfer amount' });
    }

    console.log('Validated request data:', { cust_id, receiver_account, amount });

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Get sender account details
        const senderAccountResult = await client.query(
            'SELECT acc_no, balance FROM Accounts WHERE cust_id = $1',
            [parseInt(cust_id)]
        );

        if (senderAccountResult.rows.length === 0) {
            console.error('Sender account not found:', cust_id);
            throw new Error('Sender account not found');
        }

        const sender_acc_no = senderAccountResult.rows[0].acc_no;
        const senderBalance = parseFloat(senderAccountResult.rows[0].balance);

        if (senderBalance < amount) {
            console.error('Insufficient balance:', senderBalance);
            throw new Error('Insufficient balance');
        }

        // Check receiver account
        const receiverAccountResult = await client.query(
            'SELECT cust_id FROM Accounts WHERE acc_no = $1',
            [parseInt(receiver_account)]
        );

        if (receiverAccountResult.rows.length === 0) {
            console.error('Receiver account not found:', receiver_account);
            throw new Error('Receiver account not found');
        }

        const receiver_cust_id = receiverAccountResult.rows[0].cust_id;

        // Deduct amount from sender
        await client.query(
            'UPDATE Accounts SET balance = balance - $1 WHERE cust_id = $2',
            [parseFloat(amount), parseInt(cust_id)]
        );

        // Add amount to receiver
        await client.query(
            'UPDATE Accounts SET balance = balance + $1 WHERE acc_no = $2',
            [parseFloat(amount), parseInt(receiver_account)]
        );

        // Log the transaction
        await client.query(
            'INSERT INTO Transactions (acc_no, amount, date_time, transfer_to, sender_id, receiver_id) VALUES ($1, $2, NOW(), $3, $4, $5)',
            [sender_acc_no, parseFloat(amount), parseInt(receiver_account), parseInt(cust_id), parseInt(receiver_cust_id)]
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

export default router;
