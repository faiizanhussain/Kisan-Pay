// Import statements using ES modules
import express from 'express';
import cors from 'cors';
import pool from './config/db.js'; // Ensure the file extension is included
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import route handlers
import customerRoutes from './routes/customers.js';
import accountRoutes from './routes/accounts.js';
import transactionRoutes from './routes/transactions.js';
import loanRoutes from './routes/loans.js';
import managerRoutes from './routes/manager.js';
import inventoryRoutes from './routes/inventory.js';
import salesRoutes from './routes/sales.js';
import purchaseRoutes from './routes/purchase.js';
import billingRoutes from './routes/billing.js';
import employeeRoutes from './routes/employees.js';
import adminRoutes from './routes/admin.js';


import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';

app.use(bodyParser.json());

// Use the imported routes
app.use('/api', authRoutes); // Unified Auth Routes
app.use('/api/customers', customerRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/admin', adminRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('KisanPay API is running!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.url}` });
});
