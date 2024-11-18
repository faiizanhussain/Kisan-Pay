const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Create a sale
router.post('/', async (req, res) => {
    const { item_id, cust_id, date_time, quantity, amount } = req.body;
    try {
        const newSale = await pool.query(
            'INSERT INTO Sales (item_id, cust_id, date_time, quantity, amount) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [item_id, cust_id, date_time, quantity, amount]
        );
        res.json(newSale.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all sales
router.get('/', async (req, res) => {
    try {
        const sales = await pool.query('SELECT * FROM Sales');
        res.json(sales.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific sale by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sale = await pool.query('SELECT * FROM Sales WHERE sale_id = $1', [id]);
        if (sale.rows.length === 0) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        res.json(sale.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a sale
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedSale = await pool.query('DELETE FROM Sales WHERE sale_id = $1 RETURNING *', [id]);
        if (deletedSale.rows.length === 0) {
            return res.status(404).json({ message: 'Sale not found' });
        }
        res.json({ message: 'Sale deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
