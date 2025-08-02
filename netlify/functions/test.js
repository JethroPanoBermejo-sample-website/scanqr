exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    };

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            message: 'Function is working!',
            hasApiKey: !!process.env.GOOGLE_SHEETS_API_KEY,
            apiKeyLength: process.env.GOOGLE_SHEETS_API_KEY ? process.env.GOOGLE_SHEETS_API_KEY.length : 0,
            environment: process.env.NODE_ENV || 'unknown'
        })
    };
};
