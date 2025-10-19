 import React, { useState, useCallback } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { EnhanceImageModal } from './components/EnhanceImageModal';
import { GenerateVideoModal } from './components/GenerateVideoModal';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { MontageModal } from './components/MontageModal';
import { GenerateMusicModal } from './components/GenerateMusicModal';
import { VideoPreviewModal } from './components/VideoPreviewModal';
import { ImageSelectionModal } from './components/ImageSelectionModal';
import { Toast } from './components/Toast';

import { ProductData, SEOContent, ImageFile, VideoFile, ToastInfo, FinishGroup } from './types';
import { BACKGROUND_PRESETS, initialVariantOptions } from './constants';

import { generateSEOContent } from './services/geminiService';
import { enhanceImage, createImageMontage } from './services/imageService';
import { generateVideo } from './services/videoService';
import { generateMusic } from './services/musicService';
import { fetchProductFromURL, extractProductFromHtml } from './services/scrapingService';
import { urlToImageFile } from './utils/imageUtils';
import { downloadSelectedImages } from './services/imageDownloadService';
import { exportToShopifyCsv } from './services/exportService';
import { publishToShopify } from './services/shopifyService';

const initialProductData: ProductData = {
    importUrl: '',
    description: '',
    images: [],
    videos: [],
    audio: [],
    basePrice: 19.99,
    compareAtPrice: 29.99,
    variants: JSON.parse(JSON.stringify(initialVariantOptions)), // Deep copy
    shopifyStore: '',
    shopifyToken: '',
};

function App() {
    // State management
    const [productData, setProductData] = useState<ProductData>(initialProductData);
    const [seoContent, setSeoContent] = useState<SEOContent | null>(null);
    const [targetPlatform, setTargetPlatform] = useState('shopify');
    const [toneOfVoice, setToneOfVoice] = useState('professional');
    const [toastInfo, setToastInfo] = useState<ToastInfo | null>(null);
    const [hasApiKey, setHasApiKey] = useState(true); // Assume key exists initially

    // Loading states
    const [isFetchingUrl, setIsFetchingUrl] = useState(false);
    const [isImportingFromFile, setIsImportingFromFile] = useState(false);
    const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isImportingImages, setIsImportingImages] = useState(false);

    // Modal states and data
    const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);
    const [imageToEdit, setImageToEdit] = useState<ImageFile | null>(null);
    const [generatedImagePreview, setGeneratedImagePreview] = useState<ImageFile | null>(null);
    const [enhanceImageArgs, setEnhanceImageArgs] = useState<{ customPrompt: string, size: string } | null>(null);

    const [isGenerateVideoModalOpen, setIsGenerateVideoModalOpen] = useState(false);
    const [imageForVideo, setImageForVideo] = useState<ImageFile | null>(null);
    const [generatedVideoPreview, setGeneratedVideoPreview] = useState<VideoFile | null>(null);
    const [videoPreviewMode, setVideoPreviewMode] = useState<'accept_discard' | 'view_only'>('view_only');

    const [isMontageModalOpen, setIsMontageModalOpen] = useState(false);

    const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);

    const [isImageSelectionOpen, setIsImageSelectionOpen] = useState(false);
    const [imageUrlsToSelect, setImageUrlsToSelect] = useState<string[]>([]);


    // Callbacks and handlers
    const showToast = useCallback((type: ToastInfo['type'], message: string, link?: string) => {
        setToastInfo({ type, message, link });
    }, []);

    const onProductDataChange = <K extends keyof ProductData>(key: K, value: ProductData[K]) => {
        setProductData(prev => ({ ...prev, [key]: value }));
    };

    const onVariantChange = (variants: FinishGroup[]) => {
        setProductData(prev => ({ ...prev, variants }));
    };

    const handleFetchUrl = async () => {
        if (!productData.importUrl) {
            showToast('error', 'Please enter a URL to fetch.');
            return;
        }
        setIsFetchingUrl(true);
        showToast('info', 'Fetching product data from URL...');
        try {
            const { title, description, price, imageUrls } = await fetchProductFromURL(productData.importUrl);
            console.log('Fetched product data:', { title, description, price, imageUrlsCount: imageUrls?.length, imageUrls });
            
            setProductData(prev => ({
                ...prev,
                description: `${title}\n\n${description}`,
                basePrice: price > 0 ? price : prev.basePrice,
            }));
            
            if (imageUrls && imageUrls.length > 0) {
                showToast('success', `Successfully fetched product data with ${imageUrls.length} images. Please select images to import.`);
                setImageUrlsToSelect(imageUrls);
                setIsImageSelectionOpen(true);
            } else {
                showToast('error', 'Product info was fetched, but no images were found. Gemini may not have been able to extract image URLs from this page. Try uploading the HTML file instead or use a different product URL.');
            }
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setIsFetchingUrl(false);
        }
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        setIsImportingFromFile(true);
        showToast('info', 'Importing from HTML file...');
        try {
            const htmlContent = await file.text();
            const { title, description, price, imageUrls } = await extractProductFromHtml(htmlContent);
            setProductData(prev => ({
                ...prev,
                description: `${title}\n\n${description}`,
                basePrice: price > 0 ? price : prev.basePrice,
            }));
            showToast('success', 'Successfully parsed product info. Please select images to import.');
            
            if (imageUrls && imageUrls.length > 0) {
                setImageUrlsToSelect(imageUrls);
                setIsImageSelectionOpen(true);
            }
        } catch (error) {
            showToast('error', `Failed to import from file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsImportingFromFile(false);
            event.target.value = ''; // Reset file input
        }
    };

    const handleImageSelectionConfirm = async (selectedUrls: string[]) => {
        setIsImageSelectionOpen(false);
        if (selectedUrls.length === 0) return;
    
        setIsImportingImages(true);
        showToast('info', `Importing ${selectedUrls.length} selected images...`);
    
        const results = await Promise.allSettled(selectedUrls.map(url => urlToImageFile(url, productData.importUrl)));
        
        const newImages: ImageFile[] = [];
        let failedCount = 0;
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                newImages.push(result.value);
            } else {
                failedCount++;
                console.error(`Failed to import image from ${selectedUrls[index]}:`, result.reason);
            }
        });
    
        if(newImages.length > 0) {
            setProductData(prev => ({...prev, images: [...prev.images, ...newImages]}));
            showToast('success', `Successfully imported ${newImages.length} of ${selectedUrls.length} images.`);
        }
        if (failedCount > 0) {
            showToast('error', `Failed to import ${failedCount} images. See console for details.`);
        }
        
        setIsImportingImages(false);
        setImageUrlsToSelect([]);
    };
    
    const handleGenerateSeo = async () => {
        if (!productData.description) {
            showToast('error', 'Please provide a product description first.');
            return;
        }
        setIsGeneratingSeo(true);
        try {
            const primaryImage = productData.images.find(img => img.selected) || productData.images[0];
            const content = await generateSEOContent({
                description: productData.description,
                image: primaryImage,
                platform: targetPlatform,
                tone: toneOfVoice,
            });
            setSeoContent(content);
            showToast('success', 'SEO content generated successfully!');
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Failed to generate SEO content.');
        } finally {
            setIsGeneratingSeo(false);
        }
    };

    const handleGenerateImage = (image: ImageFile) => {
        setImageToEdit(image);
        setIsEnhanceModalOpen(true);
    };

    const handleEnhanceImage = async (editedImage: { base64: string; mimeType: string; }, customPrompt: string, size: string) => {
        if (!imageToEdit) return;
        setIsGeneratingImage(true);
        setIsEnhanceModalOpen(false);
        showToast('info', 'Generating enhanced image...');
        setEnhanceImageArgs({ customPrompt, size });
        
        try {
            const sourceImage = { ...imageToEdit, ...editedImage }; // combine original data with edited data
            const newImage = await enhanceImage(sourceImage, customPrompt, size);
            setGeneratedImagePreview(newImage);
            showToast('success', 'Image generated! Please review.');
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Failed to enhance image.');
            setEnhanceImageArgs(null);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleAcceptPreview = () => {
        if (generatedImagePreview) {
            onProductDataChange('images', [...productData.images, generatedImagePreview]);
        }
        setGeneratedImagePreview(null);
        setEnhanceImageArgs(null);
    };

    const handleDiscardPreview = () => {
        setGeneratedImagePreview(null);
        setEnhanceImageArgs(null);
    };

    const handleRedoPreview = async () => {
        if (imageToEdit && enhanceImageArgs && generatedImagePreview) {
             const originalSourceImage = productData.images.find(img => img.id === imageToEdit.id);
             if (originalSourceImage) {
                 await handleEnhanceImage({ base64: originalSourceImage.base64, mimeType: originalSourceImage.mimeType }, enhanceImageArgs.customPrompt, enhanceImageArgs.size);
             }
        }
    };

    const checkApiKeyAndProceed = async (callback: () => void) => {
        // @ts-ignore
        if (typeof window.aistudio === 'undefined') {
            showToast('error', 'AI Studio context is not available.');
            return;
        }
        
        let hasKey = hasApiKey;
        if (hasKey) {
            try {
                // @ts-ignore
                hasKey = await window.aistudio.hasSelectedApiKey();
            } catch (e) {
                console.error("Error checking for API key:", e);
                hasKey = false;
            }
        }

        if (hasKey) {
            setHasApiKey(true);
            callback();
        } else {
            showToast('info', 'Please select an API key to generate videos.');
            try {
                // @ts-ignore
                await window.aistudio.openSelectKey();
                setHasApiKey(true);
                callback();
            } catch (e) {
                console.error("API key selection was cancelled or failed.", e);
                setHasApiKey(false);
                showToast('error', 'API key selection is required for video generation.');
            }
        }
    };

    const handleGenerateVideo = (image: ImageFile) => {
        checkApiKeyAndProceed(() => {
            setImageForVideo(image);
            setIsGenerateVideoModalOpen(true);
        });
    };
    
    const handleVideoGeneration = async (prompt: string, aspectRatio: string, resolution: string) => {
        if (!imageForVideo) return;
        setIsGeneratingVideo(true);
        setIsGenerateVideoModalOpen(false);
        try {
            const newVideo = await generateVideo(imageForVideo, prompt, aspectRatio, resolution, (message) => {
                showToast('info', message);
            });
            onProductDataChange('videos', [...productData.videos, newVideo]);
            showToast('success', 'Video generated successfully!');
            setGeneratedVideoPreview(newVideo);
            setVideoPreviewMode('view_only');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            if (errorMessage.includes("API key error")) {
                setHasApiKey(false); // Reset key state if it's invalid
            }
            showToast('error', errorMessage);
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    const handleDownloadImages = () => {
        const selectedImages = productData.images.filter(img => img.selected);
        if (selectedImages.length === 0) {
            showToast('error', 'No images selected for download.');
            return;
        }
        downloadSelectedImages(selectedImages);
        showToast('success', `Downloading ${selectedImages.length} images.`);
    };

    const handleGenerateMontage = () => {
        const selectedCount = productData.images.filter(img => img.selected).length;
        if (selectedCount < 2) {
            showToast('error', 'Please select at least 2 images to create a montage.');
            return;
        }
        setIsMontageModalOpen(true);
    };

    const handleMontageGeneration = async (prompt: string, size: string) => {
        const selectedImages = productData.images.filter(img => img.selected);
        setIsGeneratingImage(true);
        setIsMontageModalOpen(false);
        showToast('info', 'Generating image montage...');
        try {
            const newImage = await createImageMontage(selectedImages, prompt, size);
            setGeneratedImagePreview(newImage);
            showToast('success', 'Montage generated! Please review.');
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Failed to create montage.');
        } finally {
            setIsGeneratingImage(false);
        }
    };
    
    const handleGenerateMusic = () => {
        setIsMusicModalOpen(true);
    };

    const handleMusicGeneration = async (genre: string, mood: string, duration: number) => {
        setIsGeneratingMusic(true);
        setIsMusicModalOpen(false);
        showToast('info', `Generating ${duration}s of ${mood} ${genre} music...`);
        try {
            const newAudio = await generateMusic({ genre, mood, duration });
            onProductDataChange('audio', [...productData.audio, newAudio]);
            showToast('success', 'Music generated successfully!');
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Failed to generate music.');
        } finally {
            setIsGeneratingMusic(false);
        }
    };

    const handleExport = () => {
        if (!seoContent) {
            showToast('error', 'Please generate SEO content before exporting.');
            return;
        }
        const selectedVariants = productData.variants
            .flatMap(group => group.options
                .filter(option => option.selected)
                .map(option => ({
                    finish: group.name,
                    color: option.name,
                    price: productData.basePrice + group.priceModifier,
                }))
            );
        
        if (selectedVariants.length === 0) {
            showToast('error', 'Please select at least one variant to export.');
            return;
        }

        const exportData = {
            ...productData,
            seoContent,
            selectedVariants,
        };
        exportToShopifyCsv(exportData);
        showToast('success', 'CSV file has been downloaded.');
    };

    const handlePublish = async () => {
         if (!seoContent) {
            showToast('error', 'Please generate SEO content before publishing.');
            return;
        }
        const selectedVariants = productData.variants
            .flatMap(group => group.options
                .filter(option => option.selected)
                .map(option => ({
                    finish: group.name,
                    color: option.name,
                    price: productData.basePrice + group.priceModifier,
                }))
            );
        if (selectedVariants.length === 0) {
            showToast('error', 'Please select at least one variant.');
            return;
        }
        const selectedImages = productData.images.filter(img => img.selected);
        const selectedVideos = productData.videos.filter(vid => vid.selected);

        if (selectedImages.length === 0 && selectedVideos.length === 0) {
            showToast('error', 'Please select at least one image or video to publish.');
            return;
        }
        
        setIsPublishing(true);
        showToast('info', 'Starting publish process to Shopify...');
        try {
            const { productAdminUrl } = await publishToShopify({
                productData,
                seoContent,
                selectedVariants,
                selectedImages,
                selectedVideos,
                showToast
            });
            showToast('success', 'Successfully published product to Shopify!', productAdminUrl);
        } catch (error) {
             showToast('error', `Publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="animated-bg min-h-screen flex flex-col">
            {/* Modern Header with Gradient */}
            <header className="glass sticky top-0 z-40 border-b border-white/20">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-accent to-secondary rounded-xl flex items-center justify-center shadow-glow">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold gradient-text">AI E-Commerce Assistant</h1>
                                <p className="text-sm text-text-secondary">Transform your products with AI-powered content</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-2">
                            <div className="px-3 py-1 bg-primary-accent/10 text-primary-accent text-xs font-medium rounded-full">
                                ✨ AI-Powered
                            </div>
                            <div className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                                🚀 Modern
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content with Modern Layout */}
            <main className="flex-grow max-w-screen-2xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="flex h-full gap-8">
                    {/* Left Scrollable Column with Modern Card */}
                    <div className="w-full lg:w-2/3 h-full overflow-y-auto pr-4 custom-scrollbar">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-8 hover-lift">
                            <LeftPanel
                                productData={productData}
                                onProductDataChange={onProductDataChange}
                                targetPlatform={targetPlatform}
                                setTargetPlatform={setTargetPlatform}
                                toneOfVoice={toneOfVoice}
                                setToneOfVoice={setToneOfVoice}
                                onFetchUrl={handleFetchUrl}
                                isFetchingUrl={isFetchingUrl || isImportingImages}
                                onFileImport={handleFileImport}
                                isImportingFromFile={isImportingFromFile || isImportingImages}
                                onGenerateImage={handleGenerateImage}
                                isGeneratingImage={isGeneratingImage || (!!generatedImagePreview && isGeneratingImage)}
                                onGenerateVideo={handleGenerateVideo}
                                isGeneratingVideo={isGeneratingVideo}
                                onGenerateMusic={handleGenerateMusic}
                                isGeneratingMusic={isGeneratingMusic}
                                onPreviewVideo={(video) => { setGeneratedVideoPreview(video); setVideoPreviewMode('view_only'); }}
                                onVariantChange={onVariantChange}
                                onGenerateSeo={handleGenerateSeo}
                                isGeneratingSeo={isGeneratingSeo}
                                seoContent={seoContent}
                                onExport={handleExport}
                                onPublish={handlePublish}
                                isPublishing={isPublishing}
                                onDownloadImages={handleDownloadImages}
                                onGenerateMontage={handleGenerateMontage}
                            />
                        </div>
                    </div>
                    
                    {/* Right Sticky Column with Modern Card */}
                    <div className="hidden lg:block lg:w-1/3 h-full">
                        <div className="sticky top-24">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6 hover-lift">
                                <RightPanel content={seoContent} isLoading={isGeneratingSeo} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {isEnhanceModalOpen && imageToEdit && (
                <EnhanceImageModal
                    isOpen={isEnhanceModalOpen}
                    onClose={() => setIsEnhanceModalOpen(false)}
                    onGenerate={handleEnhanceImage}
                    backgroundPresets={BACKGROUND_PRESETS}
                    image={imageToEdit}
                    showToast={showToast}
                />
            )}

            {isImageSelectionOpen && (
                <ImageSelectionModal
                    isOpen={isImageSelectionOpen}
                    onClose={() => {
                        setIsImageSelectionOpen(false);
                        setImageUrlsToSelect([]);
                    }}
                    imageUrls={imageUrlsToSelect}
                    onConfirm={handleImageSelectionConfirm}
                    title="Select Images to Import"
                    productUrl={productData.importUrl}
                />
            )}
            
            {generatedImagePreview && (
                <ImagePreviewModal
                    image={generatedImagePreview}
                    onAccept={handleAcceptPreview}
                    onDiscard={handleDiscardPreview}
                    onRedo={handleRedoPreview}
                />
            )}

            {isGenerateVideoModalOpen && imageForVideo && (
                <GenerateVideoModal
                    isOpen={isGenerateVideoModalOpen}
                    onClose={() => setIsGenerateVideoModalOpen(false)}
                    onGenerate={handleVideoGeneration}
                    image={imageForVideo}
                />
            )}
            
            {generatedVideoPreview && (
                <VideoPreviewModal
                    video={generatedVideoPreview}
                    onClose={() => setGeneratedVideoPreview(null)}
                    {...(videoPreviewMode === 'accept_discard' ? {
                        onAccept: () => { /* Logic to accept */ setGeneratedVideoPreview(null); },
                        onDiscard: () => { /* Logic to discard */ setGeneratedVideoPreview(null); }
                    } : {})}
                />
            )}

            {isMontageModalOpen && (
                 <MontageModal
                    isOpen={isMontageModalOpen}
                    onClose={() => setIsMontageModalOpen(false)}
                    onGenerate={handleMontageGeneration}
                    images={productData.images.filter(img => img.selected)}
                    backgroundPresets={BACKGROUND_PRESETS}
                 />
            )}
            
            {isMusicModalOpen && (
                <GenerateMusicModal
                    isOpen={isMusicModalOpen}
                    onClose={() => setIsMusicModalOpen(false)}
                    onGenerate={handleMusicGeneration}
                />
            )}

            {toastInfo && (
                <Toast info={toastInfo} onClose={() => setToastInfo(null)} />
            )}
        </div>
    );
}

export default App;
