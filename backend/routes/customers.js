// Import statements using ES modules
import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Fetch all customers
router.get('/', async (req, res) => {
  try {
    const customers = await pool.query('SELECT * FROM Customers');
    res.json(customers.rows);
  } catch (err) {
    console.error('Error fetching customers:', err.message);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Customer signup (IMPLEMENTED AS TRANSACTION)
router.post('/signup', async (req, res) => 
{
  const { f_name, l_name, email, phone, pass, cnic, u_name, role } = req.body;

  if (!['Buyer', 'Seller'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role. Must be Buyer or Seller.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const newCustomer = await client.query(
      'INSERT INTO Customers (f_name, l_name, email, phone, pass, cnic, u_name, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING cust_id',
      [f_name, l_name, email, phone, pass, cnic, u_name, role]
    );

    // Automatically create an account for the customer
    const accountNumber = Math.floor(100000000000 + Math.random() * 900000000000);
    await client.query('INSERT INTO Accounts (cust_id, acc_no, balance) VALUES ($1, $2, $3)', [
      newCustomer.rows[0].cust_id,
      accountNumber,
      0,
    ]);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Signup successful', cust_id: newCustomer.rows[0].cust_id });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during signup:', err.message);
    res.status(500).json({ error: 'Signup failed' });
  } finally {
    client.release();
  }
});

// Fetch Customer Balance
router.get('/balance', async (req, res) => {
  const { cust_id } = req.query;

  if (!cust_id || isNaN(cust_id)) {
    return res.status(400).json({ message: 'Invalid or missing Customer ID' });
  }

  try {
    const account = await pool.query('SELECT balance FROM Accounts WHERE cust_id = $1', [parseInt(cust_id)]);
    if (account.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json({ balance: account.rows[0].balance });
  } catch (err) {
    console.error('Error fetching balance:', err.message);
    res.status(500).json({ message: 'Failed to fetch balance' });
  }
});

// Create Customer Account
router.post('/create-account', async (req, res) => {
  const { cust_id } = req.body;

  if (!cust_id || isNaN(cust_id)) {
    return res.status(400).json({ message: 'Invalid or missing Customer ID' });
  }

  try {
    const existingAccount = await pool.query('SELECT * FROM Accounts WHERE cust_id = $1', [parseInt(cust_id)]);

    if (existingAccount.rows.length > 0) {
      return res.status(400).json({ message: 'Account already exists' });
    }

    const accountNumber = Math.floor(100000000000 + Math.random() * 900000000000);

    const newAccount = await pool.query(
      'INSERT INTO Accounts (cust_id, acc_no, balance) VALUES ($1, $2, $3) RETURNING *',
      [parseInt(cust_id), accountNumber, 0]
    );

    res.status(201).json({
      message: 'Account created successfully',
      account: newAccount.rows[0],
    });
  } catch (err) {
    console.error('Error creating account:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Customer Login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (role === 'admin') {
      // Handle admin login
      const adminResult = await pool.query('SELECT employee_id, role, pass FROM Employees WHERE email = $1', [email]);

      if (adminResult.rows.length === 0) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      const admin = adminResult.rows[0];

      // Check password
      if (admin.pass !== password) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      // Return admin data
      res.status(200).json({
        role: admin.role,
        employee_id: admin.employee_id,
      });
    } 
    
    else if (role === 'Buyer' || role === 'Seller') {
      // Handle customer login
      const userResult = await pool.query(
        `SELECT c.cust_id, c.role, c.pass, a.acc_no 
         FROM Customers c
         LEFT JOIN Accounts a ON c.cust_id = a.cust_id
         WHERE c.email = $1 AND c.role = $2`,
        [email, role]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = userResult.rows[0];

      // Check password
      if (user.pass !== password) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      // Return customer data
      res.status(200).json({
        role: user.role,
        cust_id: user.cust_id,
        acc_no: user.acc_no,
      });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Customer Profile Details
router.get('/profile', async (req, res) => {
  try {
    const { cust_id } = req.query;
    if (!cust_id) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }
    const customer = await pool.query(
      'SELECT f_name, l_name, email, phone, cnic, u_name, role, acc_no FROM Customers cc join accounts ac on cc.cust_id = ac.cust_id WHERE cc.cust_id = $1',
      [cust_id]
    );
    if (customer.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer.rows[0]);
  } catch (err) {
    console.error('Error fetching profile details:', err.message);
    res.status(500).json({ message: 'Failed to fetch profile details' });
  }
});

// Fetch Customer Transactions
router.get('/transactions', async (req, res) => {
  const { cust_id } = req.query;

  if (!cust_id) {
    return res.status(400).json({ message: 'Customer ID is required' });
  }

  try {
    const transactions = await pool.query(
      `SELECT transaction_id, sender_id, receiver_id, amount, date_time 
       FROM Transactions 
       WHERE sender_id = $1 OR receiver_id = $1 
       ORDER BY date_time DESC`,
      [cust_id]
    );

    res.json(transactions.rows);
  } catch (err) {
    console.error('Error fetching transactions:', err.message);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// Transfer Logic (IMPLEMENTED AS TRANSACTION))
router.post('/transfer', async (req, res) => {
  console.log('Incoming request body:', req.body);

  const { cust_id, receiver_account, amount } = req.body;

  // Input validation
  if (!cust_id || isNaN(cust_id)) {
    console.error('Invalid customer ID:', cust_id);
    return res.status(400).json({ message: 'Invalid customer ID' });
  }
  if (!receiver_account || isNaN(receiver_account)) {
    console.error('Invalid receiver account:', receiver_account);
    return res.status(400).json({ message: 'Invalid receiver account' });
  }
  if (!amount || isNaN(amount) || amount <= 0) {
    console.error('Invalid transfer amount:', amount);
    return res.status(400).json({ message: 'Invalid transfer amount' });
  }

  console.log('Validated request data:', { cust_id, receiver_account, amount });

  const client = await pool.connect();

  try {
  
    await client.query('BEGIN');

    //called the transfer_funds function from the database
    const result = await client.query('SELECT transfer_funds($1, $2, $3)', [
      parseInt(cust_id),
      parseInt(receiver_account),
      parseFloat(amount),
    ]);

    await client.query('COMMIT');
    console.log('Transfer successful');
    res.status(200).json({ message: 'Transfer successful' });
  } catch (err) {
    // Rollback the transaction
    await client.query('ROLLBACK');
    console.error('Error during transfer:', err.message);

    // error handling
    let statusCode = 500;
    let errorMessage = 'Transfer failed';

    if (err.message.includes('Insufficient balance')) {
      statusCode = 400;
      errorMessage = 'Insufficient balance';
    } else if (err.message.includes('Receiver account not found')) {
      statusCode = 400;
      errorMessage = 'Receiver account not found';
    } else if (err.message.includes('Sender account not found')) {
      statusCode = 400;
      errorMessage = 'Sender account not found';
    } else if (err.message.includes('Transfer amount must be positive')) {
      statusCode = 400;
      errorMessage = 'Invalid transfer amount';
    } else if (err.message.includes('Invalid input parameters')) {
      statusCode = 400;
      errorMessage = 'Invalid input parameters';
    }

    res.status(statusCode).json({ message: errorMessage });
  } finally {
    client.release();
  }
});

// Route to add product to inventory
router.post('/inventory/add', async (req, res) => {
  const { cust_id, product_name, quantity, price } = req.body;

  // Input validation
  if (!cust_id || isNaN(cust_id)) {
    return res.status(400).json({ message: 'Invalid customer ID' });
  }
  if (!product_name || product_name.trim() === '') {
    return res.status(400).json({ message: 'Product name is required' });
  }
  if (!quantity || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }
  if (!price || isNaN(price) || price <= 0) {
    return res.status(400).json({ message: 'Invalid price' });
  }

  try {
    // Verify customer role
    const customerResult = await pool.query('SELECT role FROM Customers WHERE cust_id = $1', [cust_id]);
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const role = customerResult.rows[0].role;
    if (role !== 'Seller') {
      return res.status(403).json({ message: 'Only sellers can add products to inventory' });
    }

    // Check if product exists
    const productResult = await pool.query('SELECT product_id FROM Products WHERE product_name = $1', [product_name]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found in products list' });
    }
    const product_id = productResult.rows[0].product_id;

    const count = await pool.query('SELECT count(*) FROM Inventory WHERE supplier_id = $1 AND product_id = $2', [cust_id, product_id]);

    //if product already exists in inventory, update the quantity and price
    if (count.rows[0].count > 0) {
      const insertResult = await pool.query(
        'UPDATE Inventory SET quantity = $1, price = $2 WHERE supplier_id = $3 AND product_id = $4', [quantity,price, cust_id, product_id]);
      res.status(201).json({ message: 'Product updated to inventory', inventory: insertResult.rows[0] });
    }
    else
    // else if product does not exists in inventory Insert into Inventory
    {
      const insertResult = await pool.query(
        'INSERT INTO Inventory (supplier_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
        [cust_id, product_id, quantity, price]    
      );
      res.status(201).json({ message: 'Product added to inventory', inventory: insertResult.rows[0] });
    }

    // res.status(201).json({ message: 'Product added/updated to inventory', inventory: insertResult.rows[0] });
  } catch (err) {
    console.error('Error adding product to inventory:', err.message);
    res.status(500).json({ message: 'Failed to add/update product to inventory' });
  }
});

// get specific seller's inventory
router.get('/inventory', async (req, res) => {
  const { cust_id } = req.query;

  if (!cust_id || isNaN(cust_id)) {
    return res.status(400).json({ message: 'Invalid customer ID' });
  }

  try {
    // Verify customer role
    const customerResult = await pool.query('SELECT role FROM Customers WHERE cust_id = $1', [cust_id]);
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const role = customerResult.rows[0].role;
    if (role !== 'Seller') {
      return res.status(403).json({ message: 'Only sellers can access inventory' });
    }

    // Fetch inventory items
    const inventoryResult = await pool.query(
      `SELECT i.inventory_id, p.product_name, i.quantity, i.price
       FROM Inventory i
       JOIN Products p ON i.product_id = p.product_id
       WHERE i.supplier_id = $1`,
      [cust_id]
    );

    res.json(inventoryResult.rows);
  } catch (err) {
    console.error('Error fetching inventory:', err.message);
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
});

// get all available inventory items for buyers
router.get('/inventory/all', async (req, res) => {
  try {
    const inventoryResult = await pool.query(
      `SELECT i.inventory_id, p.product_name, i.quantity, i.price, c.f_name AS seller_first_name, c.l_name AS seller_last_name
       FROM Inventory i
       JOIN Products p ON i.product_id = p.product_id
       JOIN Customers c ON i.supplier_id = c.cust_id
       WHERE i.quantity > 0`
    );

    res.json(inventoryResult.rows);
  } catch (err) {
    console.error('Error fetching all inventory items:', err.message);
    res.status(500).json({ message: 'Failed to fetch inventory items' });
  }
});

// Route to handle purchase of products (for buyers) [IMPLEMENTED AS TRANSACTION]
router.post('/purchase', async (req, res) => {
  const { buyer_id, inventory_id, quantity } = req.body;

  // Input validation
  if (!buyer_id || isNaN(buyer_id)) {
    return res.status(400).json({ message: 'Invalid buyer ID' });
  }
  if (!inventory_id || isNaN(inventory_id)) {
    return res.status(400).json({ message: 'Invalid inventory ID' });
  }
  if (!quantity || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid quantity' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Fetch buyer account details
    const buyerAccountResult = await client.query('SELECT acc_no, balance FROM Accounts WHERE cust_id = $1', [buyer_id]);
    if (buyerAccountResult.rows.length === 0) {
      throw new Error('Buyer account not found');
      
    }
    const buyer_acc_no = buyerAccountResult.rows[0].acc_no;
    const buyerBalance = parseFloat(buyerAccountResult.rows[0].balance);

    // Fetch inventory item
    const inventoryResult = await client.query(
      `SELECT i.*, p.product_name, c.cust_id AS supplier_id
       FROM Inventory i
       JOIN Products p ON i.product_id = p.product_id
       JOIN Customers c ON i.supplier_id = c.cust_id
       WHERE i.inventory_id = $1`,
      [inventory_id]
    );
    if (inventoryResult.rows.length === 0) {
      throw new Error('Inventory item not found');
    }
    const inventoryItem = inventoryResult.rows[0];

    if (quantity > inventoryItem.quantity) {
      throw new Error('Not enough quantity available');
    }

    const totalPrice = parseFloat(inventoryItem.price) * quantity;

    if (buyerBalance < totalPrice) {
      throw new Error('Insufficient funds');
    }

    // Fetch supplier account details
    const supplierAccountResult = await client.query('SELECT acc_no, balance FROM Accounts WHERE cust_id = $1', [
      inventoryItem.supplier_id,
    ]);
    if (supplierAccountResult.rows.length === 0) {
      throw new Error('Supplier account not found');
    }
    const supplier_acc_no = supplierAccountResult.rows[0].acc_no;

    // Update buyer's balance
    await client.query('UPDATE Accounts SET balance = balance - $1 WHERE cust_id = $2', [totalPrice, buyer_id]);

    // Update supplier's balance
    await client.query('UPDATE Accounts SET balance = balance + $1 WHERE cust_id = $2', [
      totalPrice,
      inventoryItem.supplier_id,
    ]);

    // Update inventory quantity
    await client.query('UPDATE Inventory SET quantity = quantity - $1 WHERE inventory_id = $2', [
      quantity,
      inventory_id,
    ]);

    // Create order
    const orderResult = await client.query('INSERT INTO Orders (buyer_id, total_price, order_date) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING order_id', [
      buyer_id,
      totalPrice,
    ]);
    const order_id = orderResult.rows[0].order_id;

    // Create order detail
    await client.query(
      `INSERT INTO OrderDetails (order_id, buyer_id, supplier_id, inventory_id, quantity, price)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [order_id, buyer_id, inventoryItem.supplier_id, inventory_id, quantity, inventoryItem.price]
    );

    // Log transaction from buyer to supplier
    await client.query(
      `INSERT INTO Transactions (acc_no, amount, date_time, transfer_to, sender_id, receiver_id)
       VALUES ($1, $2, NOW(), $3, $4, $5)`,
      [buyer_acc_no, totalPrice, supplier_acc_no, buyer_id, inventoryItem.supplier_id]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: 'Purchase successful' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during purchase:', err.message);
    res.status(500).json({ message: err.message || 'Purchase failed' });
  } finally {
    client.release();
  }
});

// Route to get buyer's orders
router.get('/orders', async (req, res) => {
  const { buyer_id } = req.query;

  if (!buyer_id || isNaN(buyer_id)) {
    return res.status(400).json({ message: 'Invalid buyer ID' });
  }

  try {
    const ordersResult = await pool.query(
      `SELECT od.order_detail_id, o.order_id, o.order_date, o.total_price AS order_total, od.quantity, od.price, od.total_price AS item_total, p.product_name, c.f_name AS seller_first_name, c.l_name AS seller_last_name
       FROM Orders o
       JOIN OrderDetails od ON o.order_id = od.order_id
       JOIN Inventory i ON od.inventory_id = i.inventory_id
       JOIN Products p ON i.product_id = p.product_id
       JOIN Customers c ON od.supplier_id = c.cust_id
       WHERE o.buyer_id = $1
       ORDER BY o.order_date DESC`,
      [buyer_id]
    );

    res.json(ordersResult.rows);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// ... existing imports and router setup

// Fetch Seller's Sold Orders
router.get('/seller/orders', async (req, res) => {
  const { cust_id } = req.query;

  if (!cust_id || isNaN(cust_id)) {
    return res.status(400).json({ message: 'Invalid or missing Customer ID' });
  }

  try {
    const sellerOrders = await pool.query(
      `SELECT 
         od.order_detail_id,
         o.order_id,
         o.order_date,
         od.quantity,
         od.price,
         od.total_price,
         p.product_name,
         c.f_name AS buyer_first_name,
         c.l_name AS buyer_last_name,
         a.acc_no AS buyer_account_number
       FROM OrderDetails od
       JOIN Orders o ON od.order_id = o.order_id
       JOIN Inventory i ON od.inventory_id = i.inventory_id
       JOIN Products p ON i.product_id = p.product_id
       JOIN Customers c ON o.buyer_id = c.cust_id
       JOIN Accounts a ON c.cust_id = a.cust_id
       WHERE od.supplier_id = $1
       ORDER BY o.order_date DESC`,
      [parseInt(cust_id)]
    );

    res.json(sellerOrders.rows);
  } catch (err) {
    console.error('Error fetching seller orders:', err.message);
    res.status(500).json({ message: 'Failed to fetch seller orders' });
  }
});

// ... existing routes

export default router;
