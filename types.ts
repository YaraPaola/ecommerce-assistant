export interface ImageFile {
    id: string;
    name: string;
    base64: string;
    mimeType: string;
    selected: boolean;
}

export interface VideoFile {
    id: string;
    name: string;
    url: string; // URL from the video generation service
    sourceImage: ImageFile; // The image used to generate the video
    selected: boolean;
}

export interface AudioFile {
    id: string;
    name: string;
    base64: string; // Base64 encoded raw PCM audio data
    mimeType: string; // Should be 'audio/pcm'
    sampleRate: number;
    numChannels: number;
}


export interface FinishOption {
    name: string;
    selected: boolean;
}

export interface FinishGroup {
    id: string;
    name: string;
    priceModifier: number;
    options: FinishOption[];
    open: boolean;
}

export interface ProductData {
    importUrl: string;
    description: string;
    images: ImageFile[];
    videos: VideoFile[];
    audio: AudioFile[];
    basePrice: number;
    compareAtPrice: number | null;
    variants: FinishGroup[];
    shopifyStore?: string;
    shopifyToken?: string;
}

export interface SEOContent {
    title: string;
    description: string; // This will be HTML
    tags: string[];
}

export interface Variant {
    finish: string;
    color: string;
    price: number;
}

export interface ExportData extends ProductData {
    seoContent: SEOContent;
    selectedVariants: Variant[];
}

export interface ToastInfo {
    type: 'success' | 'error' | 'info';
    message: string;
    link?: string;
}