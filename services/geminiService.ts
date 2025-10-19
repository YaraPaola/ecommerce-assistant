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

Create ENERGETIC, conversion-optimized product descriptions with personality and structure.

DESCRIPTION STRUCTURE (MUST be HTML with emojis):

1. **POWER HOOK (2-3 sentences)**
   - Start with an attention-grabbing statement or problem
   - Use emojis strategically (🔥, ⚡, 💎, etc.)
   - Make it impossible to scroll past

2. **🔥 Why This [Product Type] Dominates:** (or similar exciting header)
   - <ul> with 3-4 <li> items
   - Each point: emoji + BOLD BENEFIT + supporting detail
   - Focus on transformation, not just features
   - Example format: "🌿 <strong>SUSTAINABLE SWAG</strong> – Made from ultra-durable material (eco-warriors rejoice!)"

3. **🎯 Built For:** (target audience section)
   - <ul> with 3-4 <li> items  
   - Define who needs this and why
   - Use emojis (🏆, 📸, 🎁, etc.)
   - Example: "🏆 <strong>Multi-Console Pros</strong> – Keep your arsenal organized"

4. **⚙️ [Clever Name] Specs:** (technical details with personality)
   - <ul> with key specifications
   - Keep it concise and readable
   - Bullets for: size, material, capacity, weight, etc.

5. **💡 Pro Tactics/Tips:** (optional usage ideas)
   - 2-3 <li> items with creative use suggestions
   - Make customers visualize using it

6. **⏳ Limited Offer/Bundle Section:** (create urgency)
   - Special promotion or bundle deal if applicable
   - "First X orders get..." format
   - Use emojis 🔹 for bullet points

7. **👉 STRONG CALL TO ACTION**
   - One punchy line encouraging purchase
   - Use brackets for clickable text effect: [ORDER NOW]
   - Add urgency or FOMO

8. **⚠️ IMPORTANT DISCLAIMERS** (REQUIRED)
   - <strong>Note:</strong> Any items like accessories, controllers, phones, etc. are <strong>sold separately</strong>
   - Mention if there are visible layer lines, print marks, or handmade qualities
   - Any other necessary quality notes or limitations
   - Example: "Slight layer lines add tactical texture (and bragging rights)"

9. **HASHTAG CLOSING**
   - 3-5 relevant hashtags
   - End with personality: "P.S. [witty remark about the product] 🎮"

TITLE REQUIREMENTS:
- Start with relevant emoji
- 50-60 characters max
- Include primary keyword
- Make it irresistible and benefit-focused

TAGS REQUIREMENTS:
- 8-12 highly specific tags
- Mix trending + niche keywords
- Include: material, use-case, style, audience
- Examples: #GamerSetup, #ControllerOrganizer, #3DPrintedDecor`;
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
