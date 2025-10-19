// This file acts as a server-side proxy to fetch images from external URLs.
// It is intended to be deployed as a serverless function at the `/api/proxy` endpoint.
// This bypasses browser CORS (Cross-Origin Resource Sharing) restrictions.

export default async (req: Request): Promise<Response> => {
    // 1. Get the target image URL and optional referer from the query parameters.
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');
    const referer = url.searchParams.get('referer');

    if (!imageUrl) {
        return new Response(JSON.stringify({ error: 'URL parameter is missing' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // 2. Fetch the image from the target URL.
        const imageResponse = await fetch(imageUrl, {
            headers: {
                // Mimic a browser request more closely to avoid simple anti-scraping measures.
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                // Use the provided referer, or a generic fallback, to bypass hotlinking protection.
                'Referer': referer || 'https://www.google.com/'
            }
        });

        if (!imageResponse.ok) {
            // Forward the error status from the target server.
            return new Response(JSON.stringify({ error: `Failed to fetch image. Status: ${imageResponse.status}` }), {
                status: imageResponse.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 3. Create a new response, forwarding the image data and headers.
        const headers = new Headers({
            'Content-Type': imageResponse.headers.get('Content-Type') || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*', // Crucially, allow any origin to access this proxy's response.
        });

        return new Response(imageResponse.body, {
            status: 200,
            headers: headers,
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch image through proxy.', details: error instanceof Error ? error.message : 'Unknown error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};