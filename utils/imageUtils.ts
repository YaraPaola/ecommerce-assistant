import { ImageFile } from '../types';

export const urlToImageFile = async (url: string, referer?: string): Promise<ImageFile> => {
    try {
        if (!url) throw new Error("URL is empty");
        
        // Use the /api/proxy endpoint to fetch the image and bypass CORS issues.
        let proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        if (referer) {
            proxyUrl += `&referer=${encodeURIComponent(referer)}`;
        }
        const response = await fetch(proxyUrl);

        if (!response.ok) {
            const errorBody = await response.text().catch(() => 'Could not read error response body.');
            let reason = errorBody;
            // Attempt to parse as JSON for a more specific error message if available
            try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson.error) {
                    reason = errorJson.error;
                }
            } catch (e) {
                // Not a JSON response, the raw text is the best we have for debugging.
            }
            throw new Error(`Failed to fetch image via proxy for ${url}. Status: ${response.status}. Reason: ${reason}`);
        }

        // Get the image blob
        const blob = await response.blob();
        const mimeType = blob.type || 'image/jpeg';

        // Convert blob to base64 and check dimensions
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
                const base64Data = base64String.split(',')[1];

                // Extract filename from URL
                let filename = 'image.jpg';
                try {
                    const urlObj = new URL(url);
                    const pathname = urlObj.pathname;
                    const parts = pathname.split('/');
                    const lastPart = parts[parts.length - 1];
                    if (lastPart && lastPart.includes('.')) {
                        filename = lastPart;
                    }
                } catch (e) {
                    // If URL parsing fails, use default filename
                }

                // Check image dimensions
                const img = new Image();
                img.onload = () => {
                    console.log(`📷 Image: ${filename} - ${img.width}x${img.height}px (${Math.round(blob.size / 1024)}KB)`);

                    if (img.width < 500 || img.height < 500) {
                        console.warn(`⚠️ Low resolution image detected: ${filename} is only ${img.width}x${img.height}px. Consider using higher quality images (recommended: 1500px+)`);
                    }

                    resolve({
                        id: crypto.randomUUID(),
                        name: filename,
                        base64: base64Data,
                        mimeType: mimeType,
                        selected: true,
                    });
                };
                img.onerror = () => {
                    // If we can't load the image for dimension check, still resolve with the file
                    resolve({
                        id: crypto.randomUUID(),
                        name: filename,
                        base64: base64Data,
                        mimeType: mimeType,
                        selected: true,
                    });
                };
                img.src = base64String;
            };
            reader.onerror = () => {
                reject(new Error(`Failed to convert image to base64 for ${url}`));
            };
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error(`Error converting URL to ImageFile for ${url}:`, error);
        throw error;
    }
};
