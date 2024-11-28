// Import statements using ES modules
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Import route handlers
import customerRoutes from './routes/customers.js';
import accountRoutes from './routes/accounts.js';
import loanRoutes from './routes/loans.js';
import adminRoutes from './routes/admin.js';


import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';

app.use(bodyParser.json());

// Use the imported routes
app.use('/api', authRoutes); // Unified Auth Routes
app.use('/api/customers', customerRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/loans', loanRoutes);

app.use('/api/admin', adminRoutes);


app.get('/', (req, res) => {
    res.send('KisanPay API is running!');
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use((req, res) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.url}` });
});
