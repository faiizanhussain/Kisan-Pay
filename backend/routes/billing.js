// Import statements using ES modules
import express from 'express';
import pool from '../config/db.js'; // Include the .js extension for ES modules

const router = express.Router();

// Create a bill
router.post('/', async (req, res) => {
    const { transaction_id, cust_id, amount, date_time } = req.body;
    try {
        const newBill = await pool.query(
            'INSERT INTO Billing (transaction_id, cust_id, amount, date_time) VALUES ($1, $2, $3, $4) RETURNING *',
            [transaction_id, cust_id, amount, date_time]
        );
        res.json(newBill.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all bills
router.get('/', async (req, res) => {
    try {
        const bills = await pool.query('SELECT * FROM Billing');
        res.json(bills.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific bill by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const bill = await pool.query('SELECT * FROM Billing WHERE bill_id = $1', [id]);
        if (bill.rows.length === 0) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        res.json(bill.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a bill
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBill = await pool.query('DELETE FROM Billing WHERE bill_id = $1 RETURNING *', [id]);
        if (deletedBill.rows.length === 0) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        res.json({ message: 'Bill deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
