exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    };

    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            message: 'Function is working!',
            hasServiceAccountKey: !!serviceAccountKey,
            serviceAccountKeyLength: serviceAccountKey ? serviceAccountKey.length : 0,
            environment: process.env.NODE_ENV || 'unknown',
            // Show first 50 characters for debugging (safe)
            serviceAccountPreview: serviceAccountKey ? serviceAccountKey.substring(0, 50) + '...' : 'Not found'
        })
    };
};
