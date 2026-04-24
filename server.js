const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const isProduction = process.env.NODE_ENV === 'production';

// Database setup
// Railway sets process.env.DATABASE_URL automatically when you connect a PG database plugin
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isProduction && { ssl: { rejectUnauthorized: false } })
});

let isDbInitialized = false;

async function ensureDbInitialized() {
    if (isDbInitialized || !process.env.DATABASE_URL) return;
    
    await pool.query(`
        CREATE TABLE IF NOT EXISTS waitlist (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
    isDbInitialized = true;
    console.log('Database table verified/created successfully.');
}

// Waitlist Endpoint
app.post('/api/waitlist', async (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email address is required.' });
    }

    try {
        if (process.env.DATABASE_URL) {
            await ensureDbInitialized();
            await pool.query(
                'INSERT INTO waitlist (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
                [email]
            );
        }
        
        // Simulating the email functionality requested to be skipped for now
        console.log(`[SKIP EMAIL] New sign up saved and notification ready to send: ${email}`);

        res.status(200).json({ success: true, message: 'Successfully joined the waitlist!' });
    } catch (err) {
        console.error('Error saving waitlist entry:', err);
        res.status(500).json({ error: 'Failed to process waitlist entry.' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
