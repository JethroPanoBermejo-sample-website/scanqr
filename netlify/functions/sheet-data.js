exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const SHEET_ID = '1arfuqxGfXoYAzyZB3ZnLkByEAaQ1_j1VAFkAdeGPG24';
        const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
        const RANGE = 'Sheet1!A:F';

        // Check if API key exists
        if (!API_KEY) {
            console.error('GOOGLE_SHEETS_API_KEY environment variable not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'API key not configured' })
            };
        }

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
        
        console.log('Fetching from Google Sheets with API key...');
        
        // Use global fetch or import node-fetch
        let fetchFunction;
        if (typeof fetch === 'undefined') {
            const { default: nodeFetch } = await import('node-fetch');
            fetchFunction = nodeFetch;
        } else {
            fetchFunction = fetch;
        }
        
        const response = await fetchFunction(url);
        
        if (!response.ok) {
            console.error('Google Sheets API error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };
        
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to fetch sheet data',
                details: error.message 
            })
        };
    }
};
