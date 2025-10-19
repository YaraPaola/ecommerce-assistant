// This file acts as a server-side proxy for fetching images to bypass CORS issues.
// It is intended to be deployed as a serverless function at the `/api/proxy` endpoint.

export default async (req: Request): Promise<Response> => {
    try {
        const url = new URL(req.url, `http://${req.headers.get('host')}`);
        const imageUrl = url.searchParams.get('url');
        const referer = url.searchParams.get('referer');

        if (!imageUrl) {
            return new Response(JSON.stringify({ error: 'URL parameter is missing' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const imageResponse = await fetch(imageUrl, {
            headers: {
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': referer || 'https://www.google.com/'
            }
        });

        if (!imageResponse.ok) {
            return new Response(JSON.stringify({ error: `Failed to fetch image. Status: ${imageResponse.status}` }), {
                status: imageResponse.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const contentType = imageResponse.headers.get('Content-Type') || 'application/octet-stream';

        return new Response(imageResponse.body, {
            status: imageResponse.status,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            },
        });
    } catch (error) {
        console.error('Image proxy error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: 'Failed to fetch image through proxy.', details: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};