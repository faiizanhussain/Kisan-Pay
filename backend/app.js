const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
require('dotenv').config();


// console.log("JWT_SECRET:", process.env.JWT_SECRET);  // Add this line to check the value

const app = express();  
app.use(cors());
app.use(express.json());



const customerRoutes = require('./routes/customers');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const loanRoutes = require('./routes/loans');
const managerRoutes = require('./routes/manager');
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');
const purchaseRoutes = require('./routes/purchase');
const billingRoutes = require('./routes/billing');
const employeeRoutes = require('./routes/employees');
const adminRoutes = require('./routes/admin');

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

app.use((req, res) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.url}` });
});
