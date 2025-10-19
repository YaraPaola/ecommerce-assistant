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
    { 
        name: 'Studio', 
        prompt: 'A professional, clean product photo in a minimalist studio setting with soft, even lighting and a seamless, neutral-colored background.' 
    },
    { 
        name: 'Twinkly Lights', 
        prompt: 'Lay the item on a flat surface like a wooden table in a room with low light. The background should be out of focus with some warm, twinkly lights and subtle greenery.' 
    },
    { 
        name: 'Gaming Room', 
        prompt: 'Lay the item on a flat surface like a desk in a gaming room with low light. The background should feature colorful RGB/LED lights and some tech-related props or greenery.' 
    },
    { 
        name: 'Tech Room', 
        prompt: 'Lay the item on a flat surface like a modern desk in a tech-focused room. The background is low-light with cool-toned LED strips and minimal greenery.'
    },
    { 
        name: 'Wall Mounted', 
        prompt: 'Place the item on a wall in a tech-themed room with low light. The background should feature ambient LED lighting and some subtle greenery.'
    },
    { 
        name: 'Lifestyle', 
        prompt: 'A lifestyle photo showing the product in a natural, real-world setting, such as a cozy living room, a busy kitchen, or a neat office desk.'
    },
    { 
        name: 'Office Space', 
        prompt: 'A photorealistic image of the product placed naturally on a warm oak wood desk in a modern home office. The background is softly blurred (bokeh) showing a window with gentle daylight streaming in and some green plants. The lighting on the product should match the scene, with soft shadows cast onto the desk for a realistic effect.'
    },
     { 
        name: 'Outdoor', 
        prompt: 'An outdoor shot of the product, placed on a natural surface like mossy wood or a smooth rock, with a softly blurred background of a forest or garden.'
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