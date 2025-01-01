import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import pool from '../config/db.js';

const router = express.Router();

// Email validation function
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Sanitize input
const sanitizeInput = (str) => {
    return str.trim().replace(/[<>]/g, '');
};

// Rate limiter: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many login attempts. Please try again later.' }
});

// Apply rate limiter to login route
router.use('/login', loginLimiter);

router.post('/login', async (req, res) => {
    let { role, email, password } = req.body;

    // Input validation
    if (!role || !email || !password) {
        return res.status(400).json({ message: 'Role, email, and password are required.' });
    }

    // Sanitize inputs
    email = sanitizeInput(email);
    password = sanitizeInput(password);
    role = sanitizeInput(role);

    // Validate email format
    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Generic error message for security
    const invalidCredentials = 'Invalid credentials';

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
                return res.status(401).json({ message: invalidCredentials });
            }

            const admin = adminResult.rows[0];
            const validPassword = await bcrypt.compare(password, admin.password);

            if (!validPassword || !admin.is_manager) {
                return res.status(401).json({ message: invalidCredentials });
            }

            const token = jwt.sign(
                { id: admin.employee_id, role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Successful Admin Login
            return res.status(200).json({
                role: 'admin',
                token
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
                return res.status(401).json({ message: invalidCredentials });
            }

            const customer = customerResult.rows[0];
            const validPassword = await bcrypt.compare(password, customer.pass);

            if (!validPassword) {
                return res.status(401).json({ message: invalidCredentials });
            }

            const token = jwt.sign(
                { id: customer.cust_id, role: 'customer' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Successful Customer Login
            return res.status(200).json({
                role: 'customer',
                token
            });
        } else {
            return res.status(400).json({ 
                message: 'Invalid role. Must be either "admin" or "customer".' 
            });
        }
    } catch (err) {
        console.error('Login Error:', err);
        return res.status(500).json({ 
            message: 'An internal server error occurred.'
        });
    }
});

export default router;
