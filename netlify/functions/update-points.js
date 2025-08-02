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

        // Use Google Apps Script webhook for writing data
        const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
        
        // Check if Apps Script URL exists
        if (!APPS_SCRIPT_URL) {
            console.error('GOOGLE_APPS_SCRIPT_URL environment variable not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Apps Script URL not configured. Please set up Google Apps Script webhook.' })
            };
        }
        
        const currentDate = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
        
        console.log('Updating row:', rowIndex, 'with points:', newPoints);
        
        // Use global fetch or import node-fetch
        let fetchFunction;
        if (typeof fetch === 'undefined') {
            const { default: nodeFetch } = await import('node-fetch');
            fetchFunction = nodeFetch;
        } else {
            fetchFunction = fetch;
        }
        
        const response = await fetchFunction(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'updatePoints',
                rowIndex: rowIndex,
                newPoints: newPoints,
                timestamp: currentDate
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Apps Script error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
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
