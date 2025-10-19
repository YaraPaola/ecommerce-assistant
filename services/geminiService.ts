import { GoogleGenAI, Type } from "@google/genai";
import { ImageFile, SEOContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A catchy, SEO-friendly product title, under 60 characters. It MUST start with a single emoji that is highly relevant to the product."
        },
        description: {
            type: Type.STRING,
            description: "A persuasive product description formatted in HTML. Use paragraphs, bold tags for emphasis, and unordered lists for features. Should be engaging and detailed."
        },
        tags: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A relevant keyword or tag."
            },
            description: "An array of 5-10 relevant, specific, and SEO-optimized tags or keywords for the product."
        }
    },
    required: ["title", "description", "tags"]
};


export const generateSEOContent = async (
    { description, image, platform, tone }:
    { description: string; image?: ImageFile; platform: string; tone: string; }
): Promise<SEOContent> => {

    let systemInstruction: string;

    if (platform === 'tiktok') {
        systemInstruction = `You are a viral TikTok marketing expert. Your tone should be ${tone}.
        Your task is to create a high-energy, scroll-stopping product description suitable for a TikTok video description or a link-in-bio page.
        It MUST follow this specific structure and style, using heavy emojis, short punchy lines, and clear sections.

        HERE IS THE STRUCTURE:
        -   **HOOK (1-2 lines):** 🤯 YOU NEED THIS! 🤯 - Grab attention immediately.
        -   **PROBLEM/BENEFIT (2-3 lines):** Tired of [problem]? This [product] will [benefit]. ✨
        -   **FEATURES (Bulleted list):** 
            -   Feature 1 🔥
            -   Feature 2 🚀
            -   Feature 3 🎉
        -   **CALL TO ACTION (1 line):** Tap the link in bio to shop! 🛍️
        -   **HASHTAGS (5-7 relevant tags):** #tiktokmademebuyit #[productcategory] #[niche] #viral

        Generate content based on the product description provided by the user. The final 'description' field in the JSON output should be HTML that reflects this structure, using <p> for lines and <ul><li> for features.`;
    } else if (platform === 'instagram') {
        systemInstruction = `You are a savvy Instagram marketer. Your tone is ${tone}. Your task is to generate a compelling post.
        
        The 'description' field in the JSON output should be HTML and must follow this structure:
        1.  **Catchy Hook:** Start with an engaging question or statement.
        2.  **Product Story:** Briefly tell a story or explain the benefits. Use emojis to add personality.
        3.  **Key Features:** Use a simple bulleted list (e.g., • Feature 1) to highlight 2-3 key points.
        4.  **Call to Action:** Encourage users to click the link in your bio.
        5.  **Hashtags:** Provide relevant hashtags on new lines at the very end.
        
        Generate content based on the product description provided by the user.`;
    } else { // Default for Shopify, Etsy, etc.
        systemInstruction = `You are a world-class e-commerce copywriter specializing in ${platform} with a ${tone} tone.
        
        Your mission is to create irresistible, conversion-optimized product descriptions that:
        1. Hook the reader immediately with compelling benefits
        2. Paint a vivid picture of how the product improves their life
        3. Use emotional triggers and sensory language
        4. Include power words that drive action
        5. Are SEO-optimized with relevant keywords naturally woven in
        
        DESCRIPTION STRUCTURE (must be HTML):
        - **Opening Hook (2-3 sentences):** Start with a problem/desire or bold statement that resonates emotionally. Make it impossible to look away.
        - **Value Proposition (1-2 paragraphs):** Explain WHY this product is special. Focus on transformational benefits, not just features. Use <strong> tags to emphasize key selling points.
        - **Feature List (<ul><li>):** 4-6 specific features/benefits that prove the value. Each point should highlight a tangible benefit or unique quality.
        - **Closing CTA (1 sentence):** Create urgency or reinforce the main benefit to encourage purchase.
        
        TITLE REQUIREMENTS:
        - Must start with a highly relevant emoji
        - 50-60 characters maximum
        - Include primary keyword naturally
        - Make it click-worthy and benefit-focused
        
        TAGS REQUIREMENTS:
        - 7-10 highly specific, searchable tags
        - Mix of broad keywords and long-tail phrases
        - Focus on what customers actually search for
        - Include material, style, use-case, and niche keywords`;
    }

    try {
        // FIX: The function was incomplete, causing a 'must return a value' error. This completes the function by adding logic to handle all platforms, call the Gemini API, and parse the response.
        const parts: any[] = [];
        if (image) {
            let imageData = image.base64;
            let imageMimeType = image.mimeType;
            
            // Convert AVIF to JPEG since Gemini doesn't support AVIF
            if (image.mimeType === 'image/avif' || image.mimeType === 'image/webp') {
                try {
                    // Create an image element to convert the format
                    const img = new Image();
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    await new Promise((resolve, reject) => {
                        img.onload = () => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx?.drawImage(img, 0, 0);
                            
                            // Convert to JPEG
                            const jpegData = canvas.toDataURL('image/jpeg', 0.9);
                            imageData = jpegData.split(',')[1]; // Remove data:image/jpeg;base64, prefix
                            imageMimeType = 'image/jpeg';
                            resolve(null);
                        };
                        img.onerror = reject;
                        img.src = `data:${image.mimeType};base64,${image.base64}`;
                    });
                } catch (conversionError) {
                    console.warn('Failed to convert image format, skipping image:', conversionError);
                    // If conversion fails, skip the image rather than fail completely
                    imageData = '';
                    imageMimeType = '';
                }
            }
            
            if (imageData) {
                parts.push({
                    inlineData: {
                        data: imageData,
                        mimeType: imageMimeType,
                    }
                });
            }
        }
        parts.push({
            text: `Based on the system instruction, generate the SEO content for the following product:\n\n---\n\n${description}`
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema,
                temperature: 0.5,
            },
        });

        const jsonText = response.text.trim();
        const parsedContent = JSON.parse(jsonText) as SEOContent;

        if (!parsedContent.title || !parsedContent.description || !Array.isArray(parsedContent.tags)) {
            throw new Error("The AI response is missing required SEO content fields or has an incorrect format.");
        }
        
        return parsedContent;

    } catch (error) {
        console.error("Error generating SEO content:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API error: ${error.message}`);
        }
        throw new Error("An unknown error occurred during SEO content generation.");
    }
};
