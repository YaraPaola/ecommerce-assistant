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
    // Clean & Minimalist
    { 
        name: 'Studio White', 
        prompt: 'Professional studio photo with pure white seamless background, soft diffused lighting, clean shadows, minimalist and elegant.' 
    },
    { 
        name: 'Studio Black', 
        prompt: 'Dramatic studio photo with pure black seamless background, subtle rim lighting highlighting edges, sophisticated and modern.' 
    },
    { 
        name: 'Soft Gradient', 
        prompt: 'Smooth gradient background transitioning from soft pastel pink to light blue, dreamy and ethereal lighting, minimal and peaceful.' 
    },
    
    // Warm & Cozy
    { 
        name: 'Cozy Home', 
        prompt: 'Product on a rustic wooden table with warm afternoon sunlight streaming through a window, soft bokeh background with houseplants and natural textures.' 
    },
    { 
        name: 'Golden Hour', 
        prompt: 'Bathed in warm golden hour sunlight with a soft glow, background has warm orange and amber tones, peaceful and luxurious atmosphere.' 
    },
    { 
        name: 'Candlelight Ambiance', 
        prompt: 'Intimate setting with warm candlelight creating soft flickering glows, dark cozy background with wooden elements and soft textiles.' 
    },
    
    // Nature & Outdoor
    { 
        name: 'Garden Fresh', 
        prompt: 'Surrounded by lush green plants and fresh flowers, natural daylight, botanical garden atmosphere, vibrant and refreshing.' 
    },
    { 
        name: 'Beach Vibes', 
        prompt: 'Sandy beach surface with soft ocean waves blurred in background, bright coastal sunlight, tropical and breezy feel.' 
    },
    { 
        name: 'Forest Morning', 
        prompt: 'Placed on moss-covered wood in a misty forest, soft morning light filtering through trees, natural and earthy tones.' 
    },
    { 
        name: 'Mountain View', 
        prompt: 'Set against a blurred mountain landscape with clear blue sky, natural stone surface, crisp and adventurous atmosphere.' 
    },
    
    // Modern & Tech
    { 
        name: 'Neon Lights', 
        prompt: 'Futuristic setting with vibrant neon lights in purple, blue, and pink, dark background with modern geometric shapes, cyberpunk aesthetic.' 
    },
    { 
        name: 'Tech Minimal', 
        prompt: 'Ultra-modern minimalist desk with matte black surface, subtle LED accent lighting in cool blue, clean tech-focused environment.' 
    },
    { 
        name: 'RGB Gaming', 
        prompt: 'Gaming setup with dynamic RGB lighting cycling through rainbow colors, dark background with modern gaming peripherals visible but blurred.' 
    },
    
    // Artistic & Creative
    { 
        name: 'Watercolor Dream', 
        prompt: 'Soft watercolor painted background with flowing pastel colors blending together, artistic and whimsical, delicate and creative.' 
    },
    { 
        name: 'Abstract Geometry', 
        prompt: 'Bold geometric shapes and patterns in the background with vibrant contrasting colors, modern art gallery aesthetic, dynamic and eye-catching.' 
    },
    { 
        name: 'Vintage Film', 
        prompt: 'Retro vintage aesthetic with warm film grain, muted nostalgic colors, soft vignette, classic and timeless feel.' 
    },
    { 
        name: 'Pop Art', 
        prompt: 'Bold pop art style background with bright saturated colors, comic book dots pattern, energetic and playful vibe.' 
    },
    
    // Luxurious & Elegant
    { 
        name: 'Marble Luxury', 
        prompt: 'Placed on pristine white marble surface with gold veining, soft elegant lighting, background shows luxurious interior with subtle bokeh.' 
    },
    { 
        name: 'Velvet Elegance', 
        prompt: 'Rich jewel-toned velvet fabric background in deep burgundy or emerald, soft dramatic lighting, opulent and sophisticated.' 
    },
    { 
        name: 'Champagne Glow', 
        prompt: 'Sparkling champagne-colored background with soft golden bokeh lights, celebratory and glamorous atmosphere.' 
    },
    
    // Seasonal & Festive
    { 
        name: 'Winter Wonderland', 
        prompt: 'Snowy background with soft white bokeh, cool blue-tinted lighting, frosted elements, magical and serene winter atmosphere.' 
    },
    { 
        name: 'Autumn Cozy', 
        prompt: 'Warm autumn setting with orange and red fall leaves, cozy blankets or knits visible, warm amber lighting, nostalgic fall vibes.' 
    },
    { 
        name: 'Spring Blossom', 
        prompt: 'Surrounded by delicate cherry blossom or spring flowers, soft pink and white tones, gentle natural lighting, fresh and romantic.' 
    },
    
    // Urban & Industrial
    { 
        name: 'Urban Concrete', 
        prompt: 'Industrial concrete wall texture background in gray tones, natural urban lighting, modern and edgy atmosphere.' 
    },
    { 
        name: 'Brick Loft', 
        prompt: 'Exposed brick wall background in warm terracotta tones, industrial loft lighting with large windows, trendy and authentic.' 
    },
    { 
        name: 'Neon City Night', 
        prompt: 'Night cityscape with blurred neon signs and street lights, cool blue and purple tones, urban and metropolitan vibe.' 
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
