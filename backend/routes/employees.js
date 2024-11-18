const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Create an employee
router.post('/', async (req, res) => {
    const { username, cnic, phone, email, password, f_name, l_name, position } = req.body;
    try {
        const newEmployee = await pool.query(
            'INSERT INTO Employees (username, cnic, phone, email, password, f_name, l_name, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [username, cnic, phone, email, password, f_name, l_name, position]
        );
        res.json(newEmployee.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all employees
router.get('/', async (req, res) => {
    try {
        const employees = await pool.query('SELECT * FROM Employees');
        res.json(employees.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get an employee by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const employee = await pool.query('SELECT * FROM Employees WHERE employee_id = $1', [id]);
        if (employee.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an employee
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { username, cnic, phone, email, password, f_name, l_name, position } = req.body;
    try {
        const updatedEmployee = await pool.query(
            'UPDATE Employees SET username = $1, cnic = $2, phone = $3, email = $4, password = $5, f_name = $6, l_name = $7, position = $8 WHERE employee_id = $9 RETURNING *',
            [username, cnic, phone, email, password, f_name, l_name, position, id]
        );
        if (updatedEmployee.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(updatedEmployee.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an employee
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedEmployee = await pool.query(
            'DELETE FROM Employees WHERE employee_id = $1 RETURNING *',
            [id]
        );
        if (deletedEmployee.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
