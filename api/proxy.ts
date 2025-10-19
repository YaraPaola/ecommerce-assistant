// Vercel Edge Function to proxy image requests
// This bypasses CORS restrictions when fetching images from external URLs

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
    // Enable CORS
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        // Parse the URL
        const url = new URL(req.url);
        const imageUrl = url.searchParams.get('url');
        const referer = url.searchParams.get('referer');

        // Validate image URL parameter
        if (!imageUrl) {
            return new Response(
                JSON.stringify({ error: 'URL parameter is missing' }), 
                {
                    status: 400,
                    headers: { 
                        ...corsHeaders,
                        'Content-Type': 'application/json' 
                    },
                }
            );
        }

        // Fetch the image with proper headers
        const imageResponse = await fetch(imageUrl, {
            headers: {
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': referer || 'https://www.google.com/',
            },
        });

        // Check if fetch was successful
        if (!imageResponse.ok) {
            return new Response(
                JSON.stringify({ 
                    error: `Failed to fetch image. Status: ${imageResponse.status}` 
                }), 
                {
                    status: imageResponse.status,
                    headers: { 
                        ...corsHeaders,
                        'Content-Type': 'application/json' 
                    },
                }
            );
        }

        // Get the image data
        const imageBuffer = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get('Content-Type') || 'application/octet-stream';

        // Return the image with proper headers
        return new Response(imageBuffer, {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error) {
        console.error('Proxy error:', error);
        
        return new Response(
            JSON.stringify({ 
                error: 'Failed to fetch image through proxy.', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            }), 
            {
                status: 500,
                headers: { 
                    ...corsHeaders,
                    'Content-Type': 'application/json' 
                },
            }
        );
    }
}
