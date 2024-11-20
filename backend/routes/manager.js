// Import statements using ES modules
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Create a manager
router.post('/', async (req, res) => {
    const { employee_id, f_name, l_name } = req.body;
    try {
        const newManager = await pool.query(
            'INSERT INTO Manager (employee_id, f_name, l_name) VALUES ($1, $2, $3) RETURNING *',
            [employee_id, f_name, l_name]
        );
        res.json(newManager.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all managers
router.get('/', async (req, res) => {
    try {
        const managers = await pool.query('SELECT * FROM Manager');
        res.json(managers.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific manager by Employee ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const manager = await pool.query('SELECT * FROM Manager WHERE employee_id = $1', [id]);
        if (manager.rows.length === 0) {
            return res.status(404).json({ message: 'Manager not found' });
        }
        res.json(manager.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a manager
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { f_name, l_name } = req.body;
    try {
        const updatedManager = await pool.query(
            'UPDATE Manager SET f_name = $1, l_name = $2 WHERE employee_id = $3 RETURNING *',
            [f_name, l_name, id]
        );
        if (updatedManager.rows.length === 0) {
            return res.status(404).json({ message: 'Manager not found' });
        }
        res.json(updatedManager.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a manager
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedManager = await pool.query(
            'DELETE FROM Manager WHERE employee_id = $1 RETURNING *',
            [id]
        );
        if (deletedManager.rows.length === 0) {
            return res.status(404).json({ message: 'Manager not found' });
        }
        res.json({ message: 'Manager deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
