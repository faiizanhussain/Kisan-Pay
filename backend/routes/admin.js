// Import statements using ES modules
import express from 'express';
import pool from '../config/db.js'; // Include the .js extension for ES modules

const router = express.Router();

// Admin-only route to add money to a user's account
router.post('/add-money', async (req, res) => {
  const { cust_id, amount } = req.body;
  console.log('Incoming add money request:', { cust_id, amount }); // Debug log

  if (!cust_id || isNaN(cust_id)) {
    console.error('Invalid customer ID:', cust_id);
    return res.status(400).json({ message: 'Invalid customer ID' });
  }
  if (!amount || isNaN(amount) || amount <= 0) {
    console.error('Invalid amount:', amount);
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    const account = await pool.query(
      'SELECT * FROM Accounts WHERE cust_id = $1',
      [parseInt(cust_id)]
    );
    if (account.rows.length === 0) {
      console.error('Account not found for customer ID:', cust_id);
      return res.status(404).json({ message: 'Account not found' });
    }

    const updatedAccount = await pool.query(
      'UPDATE Accounts SET balance = balance + $1 WHERE cust_id = $2 RETURNING *',
      [parseFloat(amount), parseInt(cust_id)]
    );

    res
      .status(200)
      .json({
        message: 'Money added successfully',
        account: updatedAccount.rows[0],
      });
  } catch (err) {
    console.error('Error adding money:', err.message);
    res.status(500).json({ message: 'Failed to add money' });
  }
});

// Admin-only route to fetch all transactions
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await pool.query(
      'SELECT * FROM Transactions ORDER BY date_time DESC'
    );
    res.json(transactions.rows);
  } catch (err) {
    console.error('Error fetching transactions:', err.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Admin-only route to fetch all customers
router.get('/customers', async (req, res) => {
  try {
    const customers = await pool.query('SELECT * FROM Customers');
    res.json(customers.rows);
  } catch (err) {
    console.error('Error fetching customers:', err.message);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// New route to add a product
router.post('/add-product', async (req, res) => {
  const { product_name, description, base_price } = req.body;

  if (!product_name || product_name.trim() === '') {
    return res.status(400).json({ message: 'Product name is required' });
  }
  if (!base_price || isNaN(base_price) || base_price <= 0) {
    return res.status(400).json({ message: 'Invalid base price' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO Products (product_name, description, base_price) VALUES ($1, $2, $3) RETURNING *',
      [product_name, description || null, parseFloat(base_price)]
    );
    res
      .status(201)
      .json({
        message: 'Product added successfully',
        product: result.rows[0],
      });
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).json({ message: 'Failed to add product' });
  }
});

// New route to fetch all products
router.get('/products', async (req, res) => {
  try {
    const products = await pool.query(
      'SELECT * FROM Products ORDER BY product_id DESC'
    );
    res.json(products.rows);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/inventories', async (req, res) => {
  try {
    const inventories = await pool.query(`
      SELECT 
        i.inventory_id, 
        i.supplier_id, 
        c.f_name AS supplier_first_name, 
        c.l_name AS supplier_last_name,
        p.product_name, 
        i.quantity, 
        i.price
      FROM Inventory i
      JOIN Customers c ON i.supplier_id = c.cust_id
      JOIN Products p ON i.product_id = p.product_id
      ORDER BY i.inventory_id DESC
    `);
    res.json(inventories.rows);
  } catch (err) {
    console.error('Error fetching inventories:', err.message);
    res.status(500).json({ error: 'Failed to fetch inventories' });
  }
});

// **New Route**: Admin-only route to fetch all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await pool.query(`
      SELECT 
        o.order_id, 
        o.order_date, 
        o.total_price AS order_total, 
        od.order_detail_id, 
        od.quantity, 
        od.price, 
        od.total_price AS item_total,
        b.cust_id AS buyer_id, 
        b.f_name AS buyer_first_name, 
        b.l_name AS buyer_last_name,
        s.cust_id AS supplier_id, 
        s.f_name AS supplier_first_name, 
        s.l_name AS supplier_last_name,
        p.product_name
      FROM Orders o
      JOIN OrderDetails od ON o.order_id = od.order_id
      JOIN Customers b ON od.buyer_id = b.cust_id
      JOIN Customers s ON od.supplier_id = s.cust_id
      JOIN Inventory i ON od.inventory_id = i.inventory_id
      JOIN Products p ON i.product_id = p.product_id
      ORDER BY o.order_date DESC
    `);
    res.json(orders.rows);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

export default router;
