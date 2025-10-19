import { GoogleGenAI } from "@google/genai";
import { ImageFile, VideoFile } from "../types";

// Note: Veo generation can take several minutes.
// Polling interval is set to 10 seconds.
const POLLING_INTERVAL_MS = 10000;

export const generateVideo = async (
    image: ImageFile,
    prompt: string,
    aspectRatio: string,
    resolution: string,
    onProgress: (message: string) => void
): Promise<VideoFile> => {
    try {
        // Re-create the AI instance each time to ensure the latest API key from the aistudio dialog is used.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        onProgress('Sending video generation request to the model...');

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: image.base64,
                mimeType: image.mimeType,
            },
            config: {
                numberOfVideos: 1,
                resolution: resolution as ('720p' | '1080p'),
                aspectRatio: aspectRatio as ('16:9' | '9:16'),
            }
        });

        onProgress('Request accepted. Your video is being generated. This may take a few minutes...');

        let pollCount = 0;
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
            pollCount++;
            onProgress(`Checking video status (${pollCount})...`);
            
            try {
                 operation = await ai.operations.getVideosOperation({ operation: operation });
            } catch (error) {
                // More robustly handle potential errors during polling, which may not be Error instances.
                let pollErrorMessage = "An unknown polling error occurred.";
                if (typeof error === 'string') {
                    pollErrorMessage = error;
                } else if (error instanceof Error) {
                    pollErrorMessage = error.message;
                } else if (error && typeof error === 'object') {
                    // The error from the API might be an object, stringify it to get details.
                    pollErrorMessage = JSON.stringify(error);
                }

                if (pollErrorMessage.includes("Requested entity was not found.")) {
                   // This specific error can occur if the API key becomes invalid between polls.
                   throw new Error("API key error. Please try generating again and re-select your key.");
                }
                // Re-throw other polling errors with more context.
                throw new Error(`Polling for video status failed: ${pollErrorMessage}`);
            }
        }
        
        onProgress('Video generation complete!');

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation succeeded, but the download link was not provided.");
        }

        return {
            id: crypto.randomUUID(),
            name: `video_${image.name.split('.')[0]}.mp4`,
            url: downloadLink,
            sourceImage: image,
            selected: true,
        };
    } catch (error) {
        console.error("Error generating video:", error);
        // More robustly handle potential errors from the initial API call.
        let errorMessage = "An unknown error occurred during video generation.";
        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        } else if (error && typeof error === 'object') {
             // The error from the API might be an object, stringify it to get details.
            errorMessage = JSON.stringify(error);
        }

        if (errorMessage.includes("Requested entity was not found.")) {
            throw new Error("API key error. Please try generating again and re-select your key.");
        }
        throw new Error(`Video generation failed: ${errorMessage}`);
    }
};