import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Admin-only route to fetch all orders
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
  