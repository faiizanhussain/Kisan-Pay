const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Create a purchase
router.post('/', async (req, res) => {
    const { item_id, date_time, quantity, amount } = req.body;
    try {
        const newPurchase = await pool.query(
            'INSERT INTO Purchase (item_id, date_time, quantity, amount) VALUES ($1, $2, $3, $4) RETURNING *',
            [item_id, date_time, quantity, amount]
        );
        res.json(newPurchase.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all purchases
router.get('/', async (req, res) => {
    try {
        const purchases = await pool.query('SELECT * FROM Purchase');
        res.json(purchases.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific purchase by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const purchase = await pool.query('SELECT * FROM Purchase WHERE purchase_id = $1', [id]);
        if (purchase.rows.length === 0) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        res.json(purchase.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a purchase
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedPurchase = await pool.query('DELETE FROM Purchase WHERE purchase_id = $1 RETURNING *', [id]);
        if (deletedPurchase.rows.length === 0) {
            return res.status(404).json({ message: 'Purchase not found' });
        }
        res.json({ message: 'Purchase deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
