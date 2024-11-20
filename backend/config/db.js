// Load environment variables first
import { config } from 'dotenv';
config({ path: './config/.env' });

// Import the entire pg module as a default import
import pkg from 'pg';
const { Pool } = pkg;

// Create a new pool instance
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Listen for connection events
pool.on('connect', () => {
    console.log('Connected to the database');
});

// Handle errors on the pool
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Export the pool instance
export default pool;
