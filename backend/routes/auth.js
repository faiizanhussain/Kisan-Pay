// backend/routes/auth.js

import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Unified Login Route
router.post('/login', async (req, res) => {
    const { role, email, password } = req.body;

    if (!role || !email || !password) {
        return res.status(400).json({ message: 'Role, email, and password are required.' });
    }

    try {
        if (role === 'admin') {
            // Validate Admin Credentials
            const adminResult = await pool.query(
                `SELECT e.employee_id, e.email, e.password, m.employee_id as is_manager
                 FROM Employees e
                 JOIN Manager m ON e.employee_id = m.employee_id
                 WHERE e.email = $1`,
                [email]
            );

            if (adminResult.rows.length === 0) {
                return res.status(404).json({ message: 'Admin not found.' });
            }

            const admin = adminResult.rows[0];

            // Check password (plain-text comparison as per current implementation)
            if (admin.password !== password) {
                return res.status(401).json({ message: 'Incorrect password.' });
            }

            // Check if the employee is a manager
            if (!admin.is_manager) {
                return res.status(403).json({ message: 'Access denied. Not a manager.' });
            }

            // Successful Admin Login
            return res.status(200).json({
                role: 'admin',
                employee_id: admin.employee_id,
            });
        } else if (role === 'customer') {
            // Validate Customer Credentials
            const customerResult = await pool.query(
                `SELECT c.cust_id, c.email, c.pass, a.acc_no
                 FROM Customers c
                 LEFT JOIN Accounts a ON c.cust_id = a.cust_id
                 WHERE c.email = $1`,
                [email]
            );

            if (customerResult.rows.length === 0) {
                return res.status(404).json({ message: 'Customer not found.' });
            }

            const customer = customerResult.rows[0];

            // Check password (plain-text comparison as per current implementation)
            if (customer.pass !== password) {
                return res.status(401).json({ message: 'Incorrect password.' });
            }

            // Successful Customer Login
            return res.status(200).json({
                role: 'customer',
                cust_id: customer.cust_id,
                acc_no: customer.acc_no,
            });
        } else {
            return res.status(400).json({ message: 'Invalid role specified.' });
        }
    } catch (err) {
        console.error('Login Error:', err.message);
        return res.status(500).json({ message: 'Server error during login.' });
    }
});

export default router;
