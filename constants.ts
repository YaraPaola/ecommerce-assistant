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
    // Studio Variations (Expanded)
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
    
    // Office Space Variations (Expanded)
    { 
        name: 'Office Space - Oak Natural', 
        prompt: 'Product on warm oak wood desk in modern home office. Softly blurred background showing window with daylight and green plants, realistic shadows.' 
    },
    { 
        name: 'Office Space - White Minimal', 
        prompt: 'Item on pristine white desk, background with soft natural light from large windows, minimalist modern office aesthetic.' 
    },
    { 
        name: 'Office Space - Industrial Dark', 
        prompt: 'Product on dark walnut desk in industrial-style office, exposed brick visible but blurred, moody dramatic lighting.' 
    },
    { 
        name: 'Office Space - Scandinavian Light', 
        prompt: 'Item on light pine desk in Scandinavian-style office, bright natural light, plants and simple decor in soft focus.' 
    },
    
    // Outdoor Variations (Expanded)
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
