exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    };

    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            message: 'Function is working!',
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey ? apiKey.length : 0,
            environment: process.env.NODE_ENV || 'unknown',
            // Show first 10 characters for debugging (safe)
            apiKeyPreview: apiKey ? apiKey.substring(0, 10) + '...' : 'Not found'
        })
    };
};
