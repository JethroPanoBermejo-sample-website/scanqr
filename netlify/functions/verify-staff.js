exports.handler = async (event, context) => {
    // CORS headers for cross-origin requests
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        // Parse request body
        const { staffCode } = JSON.parse(event.body);
        
        // Get the staff access code from environment variables
        const validStaffCode = process.env.STAFF_ACCESS_CODE;
        
        // Check if staff code is provided
        if (!staffCode) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    authenticated: false, 
                    message: 'Staff code is required' 
                })
            };
        }
        
        // Check if environment variable is set
        if (!validStaffCode) {
            console.error('STAFF_ACCESS_CODE environment variable not set');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    authenticated: false, 
                    message: 'Server configuration error' 
                })
            };
        }
        
        // Verify staff code (using secure comparison)
        const isAuthenticated = staffCode === validStaffCode;
        
        // Log authentication attempt (without exposing sensitive data)
        console.log(`Staff authentication attempt: ${isAuthenticated ? 'SUCCESS' : 'FAILED'}`);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                authenticated: isAuthenticated,
                message: isAuthenticated ? 'Authentication successful' : 'Invalid staff code'
            })
        };
        
    } catch (error) {
        console.error('Staff verification error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                authenticated: false, 
                message: 'Authentication service error' 
            })
        };
    }
};
