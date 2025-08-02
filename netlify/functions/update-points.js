const { GoogleAuth } = require('google-auth-library');

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

    if (event.httpMethod !== 'PUT') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { rowIndex, newPoints } = JSON.parse(event.body);
        
        if (!rowIndex || newPoints === undefined) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing rowIndex or newPoints' })
            };
        }

        const SHEET_ID = '1arfuqxGfXoYAzyZB3ZnLkByEAaQ1_j1VAFkAdeGPG24';
        
        // Check if service account credentials exist
        const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountKey) {
            console.error('GOOGLE_SERVICE_ACCOUNT_KEY environment variable not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Service account key not configured' })
            };
        }

        // Parse the service account key
        const credentials = JSON.parse(serviceAccountKey);
        
        // Initialize Google Auth
        const auth = new GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        // Get access token
        const authClient = await auth.getClient();
        const accessToken = await authClient.getAccessToken();
        
        const currentDate = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
        
        const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!E${rowIndex}:F${rowIndex}?valueInputOption=RAW`;
        
        console.log('Updating row:', rowIndex, 'with points:', newPoints);
        
        // Use global fetch or import node-fetch
        let fetchFunction;
        if (typeof fetch === 'undefined') {
            const { default: nodeFetch } = await import('node-fetch');
            fetchFunction = nodeFetch;
        } else {
            fetchFunction = fetch;
        }
        
        const response = await fetchFunction(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: [[newPoints, currentDate]]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Sheets update error:', errorData);
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const result = await response.json();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };
        
    } catch (error) {
        console.error('Error updating points:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to update points',
                details: error.message 
            })
        };
    }
};
