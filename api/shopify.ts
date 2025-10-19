// This file acts as a server-side proxy to the Shopify Admin API.
// It is intended to be deployed as a serverless function at the `/api/shopify` endpoint.
// It bypasses browser CORS restrictions by making the API call from the server.

export default async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // More robustly parse the body to prevent hangs
        const bodyText = await req.text();
        const { store, token, query, variables } = JSON.parse(bodyText);

        if (!store || !token || !query) {
            return new Response(JSON.stringify({ error: 'Missing required parameters: store, token, and query.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // The Shopify API version is hardcoded to the stable release for reliability.
        const SHOPIFY_API_VERSION = '2024-04';
        const shopifyApiUrl = `https://${store}.myshopify.com/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

        const response = await fetch(shopifyApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': token,
            },
            body: JSON.stringify({ query, variables }),
        });

        // Forward Shopify's response (both successful and error) to the client
        const responseBody = await response.text();
        
        // Create headers object for the new response
        const responseHeaders = new Headers();
        responseHeaders.set('Content-Type', 'application/json');

        return new Response(responseBody, {
            status: response.status,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error('Error in Shopify proxy:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown internal error occurred.';
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};