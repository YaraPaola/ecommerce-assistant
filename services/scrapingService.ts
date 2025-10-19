import { GoogleGenAI, Type } from "@google/genai";

// Uses Gemini with Google Search to fetch live product data (original method restored)
export const fetchProductFromURL = async (url: string): Promise<{ title: string; description: string; price: number; imageUrls: string[] }> => {
    console.log(`Fetching real data for URL: ${url}`);
    
    if (!url || !url.startsWith('http')) {
        throw new Error("Please provide a valid URL.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const prompt = `Your task is to act as a web scraper. You will be given a URL.
1. Use your search tool to access the content of the URL.
2. From the HTML content, identify and extract the main product's title, its detailed description, its price, and an array of all main product image URLs.
3. The price must be a single number (e.g., extract 19.99 from "$19.99"). If a price range is given, use the lower value. If no price is found, return 0.
4. Image URLs must be complete, absolute URLs.
5. Format the extracted data into a single, valid JSON object.
6. The JSON object must have exactly four keys: "title", "description", "price", and "imageUrls".
7. CRITICAL: Your entire response must be ONLY the JSON object. Do not include any other text, explanations, or markdown formatting like \`\`\`json.

If you are unable to access the URL or cannot find the required information, you MUST return the following JSON object:
{
  "title": "Error: Could not retrieve data",
  "description": "The tool was unable to access the provided URL or find product information on the page. Please check the URL and try again.",
  "price": 0,
  "imageUrls": []
}

URL to process: ${url}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.1,
            },
        });

        let jsonText = response.text?.trim() ?? '';

        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
             throw new Error("Could not find a valid JSON object in the AI response. This might be due to a blocked response or an issue with the source URL.");
        }
        jsonText = jsonMatch[0];

        const parsedData = JSON.parse(jsonText) as { title: string, description: string, price: number, imageUrls: string[] };

        if (parsedData.title === "Error: Could not retrieve data") {
            throw new Error(parsedData.description);
        }

        if (!parsedData.title || !parsedData.description || typeof parsedData.price !== 'number' || !Array.isArray(parsedData.imageUrls)) {
            throw new Error("The fetched data is incomplete or malformed.");
        }

        return parsedData;

    } catch (error) {
        console.error("Error fetching product data from URL:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred while fetching product data.");
    }
};

export const extractProductFromHtml = async (htmlContent: string): Promise<{ title: string; description: string; price: number; imageUrls: string[] }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The main title of the product." },
            description: { type: Type.STRING, description: "The detailed product description." },
            price: { type: Type.NUMBER, description: "The product price, as a number, without currency symbols. If a price range, use the lower value. If no price, return 0." },
            imageUrls: {
                type: Type.ARRAY,
                description: "An array of full, absolute URLs for the main product images.",
                items: { type: Type.STRING }
            }
        },
        required: ["title", "description", "price", "imageUrls"]
    };

    try {
        const prompt = `Your task is to act as an expert HTML parser for a product page. You will be given the full HTML content.
1. Analyze the HTML to extract the main product's title, its detailed description, its price, and all main product image URLs.
2. The price must be a single number (e.g., extract 19.99 from "$19.99" or "£19.99"). If a price range is given (e.g., "$19.99 - $24.99"), use the lower value. If no price can be found, you MUST return 0.
3. Image URLs must be complete, absolute URLs.
4. Format the extracted data into a single, valid JSON object that strictly adheres to the provided schema.
5. CRITICAL: Your entire response must be ONLY the JSON object. Do not include any other text, explanations, or markdown formatting.

HTML Content to process:
---
${htmlContent}
---`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema,
                temperature: 0,
            },
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        if (!parsedData.title || !parsedData.description || typeof parsedData.price !== 'number' || !Array.isArray(parsedData.imageUrls)) {
            throw new Error("The AI response is missing required fields or has incorrect types.");
        }

        return parsedData;

    } catch (error) {
        console.error("Error extracting product data from HTML:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred while extracting product data from HTML.");
    }
};
