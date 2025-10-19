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
        systemInstruction = `You are an expert e-commerce copywriter for platforms like Shopify and Etsy. Your tone is ${tone}.
        Your task is to generate compelling, SEO-optimized product content.
        
        The 'description' field in the JSON output must be well-structured HTML, including:
        -   A main paragraph describing the product's value.
        -   A bulleted list (<ul><li>) highlighting key features and benefits.
        -   Bold tags (<strong>) for emphasis on important words.`;
    }

    try {
        // FIX: The function was incomplete, causing a 'must return a value' error. This completes the function by adding logic to handle all platforms, call the Gemini API, and parse the response.
        const parts: any[] = [];
        if (image) {
             parts.push({
                inlineData: {
                    data: image.base64,
                    mimeType: image.mimeType,
                }
            });
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
