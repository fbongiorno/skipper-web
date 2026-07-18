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
app.use(express.static(path.join(__dirname, 'skipper-content')));

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
        CREATE TABLE IF NOT EXISTS waitlist_signups (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS subscribers (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            source VARCHAR(120),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);
    isDbInitialized = true;
    console.log('Database table verified/created successfully.');
}

// Waitlist Endpoint
app.post('/api/waitlist', async (req, res) => {
    const { email } = req.body;

    console.log(`[API POST] Received waitlist request for: ${email}`);

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email address is required.' });
    }

    try {
        if (process.env.DATABASE_URL) {
            console.log(`[API POST] DATABASE_URL is defined. Ensuring DB is initialized...`);
            await ensureDbInitialized();
            
            console.log(`[API POST] Executing insert query...`);
            const dbRes = await pool.query(
                'INSERT INTO waitlist_signups (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING *',
                [email]
            );
            console.log(`[API POST] Query successful. Rows inserted: ${dbRes.rowCount}`);
        } else {
            console.log(`[API POST] WARNING: DATABASE_URL is missing. Skipping DB insert.`);
        }
        
        console.log(`[SKIP EMAIL] New sign up saved and notification ready to send: ${email}`);
        res.status(200).json({ success: true, message: 'Successfully joined the waitlist!' });
    } catch (err) {
        console.error('[API POST] CRITICAL ERROR saving waitlist entry:', err);
        res.status(500).json({ error: 'Failed to process waitlist entry.' });
    }
});

// Admin Route to Verify Database Directly
app.get('/api/admin/waitlist', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL) {
             return res.send('<h2>DATABASE_URL is not connected to this app!</h2>');
        }
        await ensureDbInitialized();
        const result = await pool.query('SELECT * FROM waitlist_signups');
        res.json({
            count: result.rows.length,
            records: result.rows,
            message: "If count is 0, the database is genuinely empty."
        });
    } catch (err) {
        console.error('[ADMIN] Error fetching records:', err);
        res.status(500).send('Database connection completely failed: ' + err.message);
    }
});

// Newsletter subscribe endpoint
app.post('/api/subscribe', async (req, res) => {
    const { email, source } = req.body;
    if (!email || !email.includes('@') || email.length > 254) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    try {
        if (process.env.DATABASE_URL) {
            await ensureDbInitialized();
            await pool.query(
                'INSERT INTO subscribers (email, source) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
                [email.trim().toLowerCase(), (source || 'site').slice(0, 120)]
            );
        }
        res.status(200).json({ success: true, message: "You're on the list. Check your inbox for the guide." });
    } catch (err) {
        console.error('[SUBSCRIBE] Error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
});

// Admin: view subscribers
app.get('/api/admin/subscribers', async (req, res) => {
    try {
        if (!process.env.DATABASE_URL) return res.send('<h2>DATABASE_URL not connected.</h2>');
        await ensureDbInitialized();
        const result = await pool.query('SELECT * FROM subscribers ORDER BY created_at DESC');
        res.json({ count: result.rows.length, records: result.rows });
    } catch (err) {
        res.status(500).send('Database error: ' + err.message);
    }
});

// Admin: submit all sitemap URLs to IndexNow (Bing, Yandex, etc.)
app.get('/api/admin/indexnow', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const sitemap = fs.readFileSync(path.join(__dirname, 'sitemap.xml'), 'utf8');
        const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
        const payload = JSON.stringify({
            host: 'www.skipper.com',
            key: 'fe134aab0171aeb2bfc6e3f031624134',
            keyLocation: 'https://www.skipper.com/fe134aab0171aeb2bfc6e3f031624134.txt',
            urlList: urls
        });
        const https = require('https');
        const result = await new Promise((resolve, reject) => {
            const r = https.request({
                hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(payload) }
            }, (resp) => {
                let body = '';
                resp.on('data', c => body += c);
                resp.on('end', () => resolve({ status: resp.statusCode, body }));
            });
            r.on('error', reject);
            r.write(payload);
            r.end();
        });
        res.json({ submitted: urls.length, indexnow_status: result.status, note: result.status === 200 || result.status === 202 ? 'Success — URLs submitted to IndexNow (Bing/Yandex)' : 'Unexpected status: ' + result.body });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 301 Redirects: old site URLs -> new structure ───
const redirects = {
  '/waitlist/': '/plan/',
  '/waitlist': '/plan/',
  '/destinations.html': '/destinations/',
  '/destinations/greece.html': '/destinations/europe/greece/',
  '/destinations/croatia.html': '/destinations/europe/croatia/',
  '/destinations/italy.html': '/destinations/europe/italy/',
  '/destinations/turkey.html': '/destinations/europe/turkey/',
  '/destinations/french-riviera.html': '/destinations/europe/france/',
  '/destinations/monaco.html': '/destinations/europe/france/',
  '/destinations/bahamas.html': '/destinations/caribbean/bahamas/',
  '/destinations/caribbean.html': '/destinations/caribbean/',
  '/destinations/australia.html': '/destinations/pacific/whitsundays/',
  '/destinations/south-pacific.html': '/destinations/pacific/french-polynesia/',
  '/destinations/southeast-asia.html': '/destinations/',
  '/destinations/indian-ocean.html': '/destinations/',
  '/destinations/red-sea.html': '/destinations/',
  '/destinations/dubai.html': '/destinations/',
  '/destinations/galapagos.html': '/destinations/pacific/',
  '/destinations/florida.html': '/destinations/caribbean/',
  '/destinations/mexico.html': '/destinations/caribbean/',
  '/destinations/new-england.html': '/destinations/',
  '/destinations/pacific-northwest.html': '/destinations/',
  '/destinations/norway.html': '/destinations/europe/',
  '/home': '/',
};

app.get(Object.keys(redirects), (req, res) => {
  res.redirect(301, redirects[req.path]);
});

// ─── 410 Gone: legacy syndicated news-widget URLs ───
// These are leftover pages from an old third-party news feed (boating
// accident/news syndication), never part of Skipper.com's own content.
// Returning 410 tells Google they're permanently gone so it stops
// re-crawling and re-flagging them as 404s.
const legacyNewsUrlPattern = /^\/\d{5,}\/.+/;
const legacyContentGoPattern = /^\/content\/go\/\d+/;

app.use((req, res, next) => {
  if (legacyNewsUrlPattern.test(req.path) || legacyContentGoPattern.test(req.path)) {
    return res.status(410).send('Gone');
  }
  next();
});

// Itinerary generation endpoint
app.post('/api/itinerary', async (req, res) => {
    const key = process.env.GEMINI_KEY;
    if (!key) return res.status(503).json({ error: 'AI not configured' });

    const { destination, days, guests, boat, charter, routes, bases, season } = req.body;

    const prompt = 'You are an expert yacht charter guide. Write a detailed day-by-day itinerary.\n\n' +
        'Trip: ' + days + '-day ' + charter + ' ' + boat + ' in ' + destination + ' for ' + guests + ' guests.\n' +
        'Route: ' + routes + '\n' +
        'Base: ' + bases + '\n' +
        'Season: ' + season + '\n\n' +
        'For each day write:\n' +
        '- Day X: [From] to [To] heading\n' +
        '- Sailing distance in nautical miles\n' +
        '- Morning, afternoon and evening activities\n' +
        '- Overnight anchorage or marina\n' +
        '- One restaurant or local tip\n\n' +
        'Start immediately with Day 1. No introduction. No conclusion. Just the days.';

    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + key;

    try {
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
            })
        });
        const data = await response.json();
        if (!response.ok) return res.status(502).json({ error: data.error && data.error.message || 'Gemini error' });
        const text = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || '';
        res.json({ itinerary: text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Gemini key endpoint — serves key from env var, never exposed in repo
app.get('/api/gemini-key', (req, res) => {
    const key = process.env.GEMINI_KEY;
    if (!key) return res.status(404).json({ error: 'Not configured' });
    res.json({ key });
});

// Custom 404 handler — must be last, after all other routes and static middleware
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'skipper-content', '404', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
