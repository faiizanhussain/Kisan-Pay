// Import statements using ES modules
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Create an inventory item
router.post('/', async (req, res) => {
    const { item_name, quantity, price } = req.body;
    try {
        const newItem = await pool.query(
            'INSERT INTO Inventory (item_name, quantity, price) VALUES ($1, $2, $3) RETURNING *',
            [item_name, quantity, price]
        );
        res.json(newItem.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all inventory items
router.get('/', async (req, res) => {
    try {
        const items = await pool.query('SELECT * FROM Inventory');
        res.json(items.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific inventory item by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const item = await pool.query('SELECT * FROM Inventory WHERE item_id = $1', [id]);
        if (item.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an inventory item
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { item_name, quantity, price } = req.body;
    try {
        const updatedItem = await pool.query(
            'UPDATE Inventory SET item_name = $1, quantity = $2, price = $3 WHERE item_id = $4 RETURNING *',
            [item_name, quantity, price, id]
        );
        if (updatedItem.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(updatedItem.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an inventory item
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedItem = await pool.query('DELETE FROM Inventory WHERE item_id = $1 RETURNING *', [id]);
        if (deletedItem.rows.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
