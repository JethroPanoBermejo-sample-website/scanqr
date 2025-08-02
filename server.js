// Simple Node.js server to proxy Google Sheets requests
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configuration
const SHEET_ID = '1arfuqxGfXoYAzyZB3ZnLkByEAaQ1_j1VAFkAdeGPG24';
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY; // Securely loaded from environment

// Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API route to fetch sheet data
app.get('/api/sheet-data', async (req, res) => {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A:F?key=${API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        res.status(500).json({ error: 'Failed to fetch sheet data' });
    }
});

// API route to update points
app.put('/api/update-points', async (req, res) => {
    try {
        const { rowIndex, newPoints } = req.body;
        
        if (!rowIndex || newPoints === undefined) {
            return res.status(400).json({ error: 'Missing rowIndex or newPoints' });
        }
        
        const currentDate = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
        
        const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!E${rowIndex}:F${rowIndex}?valueInputOption=RAW&key=${API_KEY}`;
        
        const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: [[newPoints, currentDate]]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const result = await response.json();
        res.json(result);
        
    } catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ error: 'Failed to update points' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');
});
