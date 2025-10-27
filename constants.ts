import { FinishGroup } from './types';

export const PLATFORMS = [
    { id: 'shopify', name: 'Shopify' },
    { id: 'etsy', name: 'Etsy' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'tiktok', name: 'TikTok' },
];

export const TONES = [
    { id: 'professional', name: 'Professional' },
    { id: 'luxury', name: 'Luxury' },
    { id: 'casual', name: 'Casual' },
    { id: 'persuasive', name: 'Persuasive' },
    { id: 'witty', name: 'Witty' },
];

export const BACKGROUND_PRESETS = [
    // Studio Variations
    {
        name: 'Studio - White Clean',
        prompt: 'Professional, clean product photo in a minimalist studio setting with soft, even lighting and a seamless pure white background.'
    },
    {
        name: 'Studio - Soft Gray',
        prompt: 'Professional studio with seamless soft gray background, gentle diffused lighting creating subtle shadows, minimal and sophisticated.'
    },
    {
        name: 'Studio - Black Dramatic',
        prompt: 'Dramatic studio photo with pure black seamless background, subtle rim lighting highlighting product edges, bold and modern.'
    },
    {
        name: 'Studio - Gradient Blue',
        prompt: 'Studio setting with smooth gradient background from light to darker blue, professional lighting with soft shadows.'
    },
    {
        name: 'Studio - Flat Lay White',
        prompt: 'Flat lay showing the ITEM surrounded by complementary supplies (pen, notebook, glasses). Clean white background.'
    },
    {
        name: 'Studio - Vibrant Teal',
        prompt: 'ITEM placed on a seamless vibrant teal background. Studio lighting with strong contrast and shadows to emphasize its shape.'
    },
    {
        name: 'Studio - Holiday Accents',
        prompt: 'ITEM nestled amongst subtle holiday decorations (pine sprig, copper ornaments). Soft, warm bokeh lights in the blurred background.'
    },
    
    // Twinkly Lights Variations (Expanded)
    { 
        name: 'Twinkly Lights - Warm Table', 
        prompt: 'Lay the item on a wooden table in low light. Background out of focus with warm, twinkly fairy lights and subtle greenery.' 
    },
    { 
        name: 'Twinkly Lights - Cozy Window', 
        prompt: 'Item on rustic surface near a window at dusk, soft twinkly string lights in background creating warm bokeh, plants visible.' 
    },
    { 
        name: 'Twinkly Lights - Cool Blue', 
        prompt: 'Product on dark surface with cool-toned white/blue twinkly lights in blurred background, modern and serene ambiance.' 
    },
    { 
        name: 'Twinkly Lights - Rainbow Mix', 
        prompt: 'Item on dark wood surface, background filled with multicolored twinkly lights creating vibrant bokeh, festive and playful.' 
    },
    
    // Gaming Room Variations (Expanded)
    { 
        name: 'Gaming Room - RGB Purple', 
        prompt: 'Lay item on gaming desk with low light. Background features purple and pink RGB LED lights, tech props visible but blurred.' 
    },
    { 
        name: 'Gaming Room - Neon Green', 
        prompt: 'Product on modern desk in gaming room, vibrant green RGB strips and neon accents in blurred background, energetic vibe.' 
    },
    { 
        name: 'Gaming Room - Blue Cyber', 
        prompt: 'Item on sleek desk with blue LED lighting dominating the background, futuristic gaming setup visible but out of focus.' 
    },
    { 
        name: 'Gaming Room - Rainbow RGB', 
        prompt: 'Lay item on gaming surface with dynamic rainbow RGB lighting cycling through colors, gaming peripherals and monitors blurred.' 
    },
    
    // Tech Room Variations (Expanded)
    { 
        name: 'Tech Room - Cool Blue Minimal', 
        prompt: 'Lay item on modern desk in tech-focused room. Background low-light with cool blue LED strips and minimal greenery.' 
    },
    { 
        name: 'Tech Room - White Ambient', 
        prompt: 'Product on minimalist white desk, background with soft white ambient LED lighting, clean tech workspace aesthetic.' 
    },
    { 
        name: 'Tech Room - Dark Industrial', 
        prompt: 'Item on matte black desk surface, background with subtle red LED accents and industrial tech elements, dark and sleek.' 
    },
    { 
        name: 'Tech Room - Warm Oak', 
        prompt: 'Product on warm oak desk in modern home office, soft warm LED backlighting, tech gadgets visible but blurred.' 
    },
    
    // Wall Mounted Variations (Expanded)
    { 
        name: 'Wall Mounted - LED Blue', 
        prompt: 'Place item on wall in tech room with low light. Background features cool blue ambient LED lighting with greenery.' 
    },
    { 
        name: 'Wall Mounted - Neon Purple', 
        prompt: 'Item mounted on dark wall, background with purple neon strip lighting creating dramatic glow, modern and bold.' 
    },
    { 
        name: 'Wall Mounted - Warm Wood', 
        prompt: 'Product on wooden wall panel, background with warm amber LED accent lighting, cozy and natural feel.' 
    },
    { 
        name: 'Wall Mounted - Gallery White', 
        prompt: 'Item on clean white wall in gallery-style setting, subtle spotlighting, minimalist and professional.' 
    },
    
    // Lifestyle Variations (Expanded)
    { 
        name: 'Lifestyle - Living Room Cozy', 
        prompt: 'Product in natural real-world setting on a cozy living room coffee table with soft textures, warm lighting, lived-in feel.' 
    },
    { 
        name: 'Lifestyle - Kitchen Bright', 
        prompt: 'Item on bright kitchen counter with natural daylight, fresh produce or kitchen items visible blurred in background.' 
    },
    { 
        name: 'Lifestyle - Bedroom Calm', 
        prompt: 'Product on nightstand in serene bedroom, soft morning light through curtains, peaceful and intimate atmosphere.' 
    },
    { 
        name: 'Lifestyle - Desk Workspace', 
        prompt: 'Item on busy home office desk with coffee cup, notebook, and plants visible but out of focus, productive vibe.' 
    },
    
    // Office Space Variations
    {
        name: 'Office - Scandinavian Light',
        prompt: 'ITEM on light pine desk in Scandinavian-style office, window with bright natural light, plants and simple decor in soft focus.'
    },
    {
        name: 'Office - Executive Mahogany',
        prompt: 'ITEM on a large, mahogany desk. Background includes a leather blotter and a framed landscape painting. Dark, rich tones and controlled studio light.'
    },
    {
        name: 'Office - Loft Coworking',
        prompt: 'ITEM next to a laptop on a distressed wood table in a loft-style co-working space. Exposed brick in the background. Bright, cool white light with a dynamic feel.'
    },
    {
        name: 'Office - Floating Shelf Pastel',
        prompt: 'ITEM on a white floating shelf above a desk. Pale pastel wall in the background. High-key, airy photo focused on functionality.'
    },
    {
        name: 'Office - Oak Natural',
        prompt: 'Product on warm oak wood desk in modern home office. Softly blurred background showing window with daylight and green plants, realistic shadows.'
    },
    {
        name: 'Office - White Minimal',
        prompt: 'Item on pristine white desk, background with soft natural light from large windows, minimalist modern office aesthetic.'
    },
    {
        name: 'Office - Industrial Dark',
        prompt: 'Product on dark walnut desk in industrial-style office, exposed brick visible but blurred, moody dramatic lighting.'
    },
    
    // Living Room Variations
    {
        name: 'Living Room - Bookshelf',
        prompt: 'ITEM on a dark wood, open-back bookshelf. Soft, warm lighting from a nearby lamp. Background features hardback books and a subtle succulent. Shallow depth of field.'
    },
    {
        name: 'Living Room - Marble Coffee Table',
        prompt: 'ITEM centered on a round, low-profile marble coffee table. A single art book and a small, delicate vase of flowers are nearby. Focus on clean lines and negative space.'
    },
    {
        name: 'Living Room - Fireplace Mantel',
        prompt: 'ITEM prominently displayed on a painted white fireplace mantel. A cluster of pillar candles and a framed mirror are visible. Soft, focused light highlighting the item as a centerpiece.'
    },
    {
        name: 'Living Room - Cozy Armchair',
        prompt: 'ITEM on a small wooden side table next to a chunky knit, overstuffed armchair. A mug of hot tea and a reading light create a warm, inviting atmosphere.'
    },
    {
        name: 'Living Room - Dusk Window',
        prompt: 'Item on rustic surface near a window at dusk, soft lights in background creating warm bokeh, plants visible.'
    },

    // Kitchen Variations
    {
        name: 'Kitchen - White Marble Counter',
        prompt: 'ITEM on a bright white marble kitchen counter. Background shows a textured tile backsplash and a stainless steel appliance. Abundant, clear daylight.'
    },
    {
        name: 'Kitchen - Reclaimed Wood Shelf',
        prompt: 'ITEM on a reclaimed wood open shelf in a kitchen. Background shows a jar of dry goods and a mortar and pestle. Warm, overhead lighting emphasizing texture and utility.'
    },
    {
        name: 'Kitchen - Grey Quartz Island',
        prompt: 'ITEM placed centrally on a dark grey quartz kitchen island. Background features blurred stainless steel appliances. High contrast, focused studio light.'
    },

    // Bedside Table Variations
    {
        name: 'Bedside - Oak Table Morning',
        prompt: 'ITEM on a round oak bedside table. Linen sheets in the background. Soft, diffused morning light and a tranquil mood.'
    },

    // Entryway Variations
    {
        name: 'Entryway - Mid-Century Console',
        prompt: 'ITEM on a narrow, mid-century modern console. Sun streaming in from the side, creating long shadows. Warm and welcoming.'
    },
    {
        name: 'Entryway - Woven Bench',
        prompt: 'ITEM resting on a small, woven bench below a set of brass wall hooks. Background includes a textured, white macrame wall hanging. Soft, low-angle light.'
    },

    // Bathroom Variations
    {
        name: 'Bathroom - Concrete Vanity',
        prompt: 'ITEM on a smooth, grey concrete vanity. Background shows a large mirror with an LED light. Focus on texture and clean, spa-like lines.'
    },
    {
        name: 'Bathroom - Shower Niche Spa',
        prompt: 'ITEM set inside a tiled shower niche. Subtle water droplets on the item and surrounding tiles. Dark, dramatic lighting to enhance a high-end, spa feel.'
    },
    {
        name: 'Bathroom - Double Vanity',
        prompt: 'ITEM positioned between two sinks on a white porcelain double vanity. A colorful towel and a small rubber duck are visible in the soft focus background. Bright, diffused daylight.'
    },

    // Game Room Variations
    {
        name: 'Game Room - Neon Shelf',
        prompt: 'ITEM sitting on a dedicated shelf next to a stack of classic board games and a vintage video game console. Vibrant, neon-like lighting (e.g., blue and magenta).'
    },

    // Green Room Variations
    {
        name: 'Green Room - Lush Plants',
        prompt: 'ITEM surrounded by large, lush house plants (e.g., Monstera, Fiddle Leaf Fig) on a sun-drenched floor. Direct natural light creating high-contrast leaf shadows.'
    },

    // Outdoor Variations
    {
        name: 'Outdoor - Forest Moss',
        prompt: 'Outdoor shot on natural mossy wood surface, softly blurred forest background with dappled sunlight through trees.'
    },
    {
        name: 'Outdoor - Beach Sand',
        prompt: 'Product on smooth sandy surface, blurred ocean waves and blue sky in background, bright coastal sunlight.'
    },
    {
        name: 'Outdoor - Garden Stone',
        prompt: 'Item on natural stone surface in garden setting, vibrant flowers and greenery softly out of focus, fresh daylight.'
    },
    {
        name: 'Outdoor - Mountain Rock',
        prompt: 'Product on rocky mountain surface, blurred dramatic mountain landscape and clouds in background, crisp and adventurous.'
    }
];

export const MUSIC_GENRES = [ 'Lofi', 'Cinematic', 'Electronic', 'Acoustic', 'Ambient', 'Upbeat Pop' ];
export const MUSIC_MOODS = [ 'Calm', 'Happy', 'Exciting', 'Mysterious', 'Sad', 'Energetic' ];


export const initialVariantOptions: FinishGroup[] = [
    {
        id: 'gloss',
        name: 'Gloss',
        priceModifier: 0,
        open: true,
        options: [
            { name: 'GREY', selected: false }, { name: 'WHITE', selected: false }, { name: 'BLACK', selected: false },
            { name: 'SPACE GREY', selected: false }, { name: 'YELLOW', selected: false }, { name: 'ORANGE', selected: false },
            { name: 'RED', selected: false }, { name: 'PINK', selected: false }, { name: 'MAGENTA', selected: false },
            { name: 'LAVENDER', selected: false }, { name: 'VIOLET', selected: false }, { name: 'PURPLE', selected: false },
            { name: 'LIGHT BLUE', selected: false }, { name: 'DARK BLUE', selected: false }, { name: 'SEA GREEN', selected: false },
            { name: 'BRIGHT GREEN', selected: false }, { name: 'SPRING LEAF', selected: false }, { name: 'BEIGE', selected: false },
            { name: 'LIGHT BROWN', selected: false }
        ]
    },
    {
        id: 'matte',
        name: 'Matte',
        priceModifier: 2,
        open: false,
        options: [
            { name: 'WHITE', selected: false }, { name: 'BLACK', selected: false }, { name: 'BEIGE', selected: false },
            { name: 'SLATE GREY', selected: false }, { name: 'SAKURA PINK', selected: false }, { name: 'LAVENDER PURPLE', selected: false },
            { name: 'RUBY RED', selected: false }, { name: 'SUNSHINE YELLOW', selected: false }, { name: 'MINT GREEN', selected: false },
            { name: 'NAVY BLUE', selected: false }, { name: 'ICE BLUE', selected: false }, { name: 'TEAL GREEN', selected: false },
            { name: 'ASH GREY', selected: false }, { name: 'OLIVE GREEN', selected: false }, { name: 'CHERRY RED', selected: false },
            { name: 'CLAY', selected: false }, { name: 'OFF WHITE', selected: false }, { name: 'CREAM', selected: false },
            { name: 'PALE SAGE', selected: false }, { name: 'SEAFOAM MIST', selected: false }, { name: 'SKY MIST', selected: false },
            { name: 'BLUSH PINK', selected: false }, { name: 'LAVENDER', selected: false }, { name: 'FROSTED LILAC', selected: false }
        ]
    },
    {
        id: 'silk',
        name: 'Silk',
        priceModifier: 4,
        open: false,
        options: [
            { name: 'GREY', selected: false },
            { name: 'WHITE', selected: false },
            { name: 'SILVER', selected: false },
            { name: 'GOLD', selected: false },
            { name: 'METAL BLUE', selected: false },
            { name: 'BLACK/ BLUE', selected: false },
            { name: 'SILVER / GOLD', selected: false },
            { name: 'BRONZE', selected: false },
            { name: 'BLACK/ PURPLE', selected: false },
            { name: 'BLACK/ GREEN', selected: false },
            { name: 'ROSE GOLD', selected: false },
            { name: 'MYSTERY', selected: false }
        ]
    },
    {
        id: 'multicolor',
        name: 'Multicolor',
        priceModifier: 5,
        open: false,
        options: [
            { name: 'GLOSS PASTEL', selected: false }, { name: 'GLOSS NEON', selected: false }, { name: 'GLOSS RAINBOW', selected: false },
            { name: 'MATTE PASTEL', selected: false }, { name: 'MATTE NEON', selected: false }, { name: 'MATTE RAINBOW', selected: false },
            { name: 'SILK PASTEL', selected: false }, { name: 'SILK RAINBOW', selected: false }
        ]
    }
];

// Collect all unique color options from initialVariantOptions for new custom groups
export const ALL_COLORS_FROM_VARIANTS = (() => {
    const uniqueColors = new Set<string>();
    initialVariantOptions.forEach(group => {
        group.options.forEach(option => {
            uniqueColors.add(option.name);
        });
    });
    return Array.from(uniqueColors).sort((a, b) => a.localeCompare(b));
})();

// Map to store color name to its finish type
export const COLOR_TO_FINISH_MAP = (() => {
    const map = new Map<string, string>();
    initialVariantOptions.forEach(group => {
        group.options.forEach(option => {
            map.set(option.name, group.name);
        });
    });
    return map;
})();
