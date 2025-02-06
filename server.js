const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for frontend requests
const corsOptions = {
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions)); 

app.use(express.json()); // Parse JSON request bodies
app.use(express.static('public')); // Serve static files (index.html)

// Shopify API credentials from .env file
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_PASSWORD = process.env.SHOPIFY_PASSWORD;
const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP;

app.get('/orders', async (req, res) => {
    const email = req.query.email;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const response = await axios.get(
            `https://${SHOPIFY_SHOP}/admin/api/2025-01/orders.json?email=${encodeURIComponent(email)}`,
            {
                auth: {
                    username: SHOPIFY_API_KEY,
                    password: SHOPIFY_PASSWORD
                }
            }
        );

        res.json(response.data.orders);
        console.log(response.data.orders);
        
    } catch (error) {
        console.error('Error fetching orders:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Fetch orders by phone number using Surge Backend API
app.post('/orders/by-phone', async (req, res) => {
    const { website_url, phone } = req.body;

    if (!website_url || !phone) {
        return res.status(400).json({ error: 'Website URL and phone number are required' });
    }

    try {
        const response = await axios.post(
            'https://surge-backend.erg.st/api/orders/search',
            { website_url, phone },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching orders by phone:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch orders by phone' });
    }
});

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
