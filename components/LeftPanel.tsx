import React, { useRef } from 'react';
import { ProductData, FinishGroup, ImageFile, SEOContent, VideoFile } from '../types';
import { TONES, PLATFORMS } from '../constants';
import { ImageUploader } from './ImageUploader';
import { VariantSelector } from './VariantSelector';
import { VideoGallery } from './VideoGallery';
import { AudioGallery } from './AudioGallery';
import { Button } from './Button';
import { Section } from './Section';
import { Icon } from './Icon';

interface LeftPanelProps {
    productData: ProductData;
    onProductDataChange: <K extends keyof ProductData>(key: K, value: ProductData[K]) => void;
    targetPlatform: string;
    setTargetPlatform: (platform: string) => void;
    toneOfVoice: string;
    setToneOfVoice: (tone: string) => void;
    contentLength: string;
    setContentLength: (length: string) => void;
    onFetchUrl: () => void;
    isFetchingUrl: boolean;
    onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isImportingFromFile: boolean;
    onGenerateImage: (image: ImageFile) => void;
    isGeneratingImage: boolean;
    onGenerateVideo: (image: ImageFile) => void;
    onEditVideo: (video: ImageFile) => void;
    isGeneratingVideo: boolean;
    onGenerateMusic: () => void;
    isGeneratingMusic: boolean;
    onPreviewVideo: (video: VideoFile) => void;
    onVariantChange: (variants: FinishGroup[]) => void;
    onGenerateSeo: () => void;
    isGeneratingSeo: boolean;
    seoContent: SEOContent | null;
    onExport: () => void;
    onPublish: () => void;
    isPublishing: boolean;
    onDownloadImages: () => void;
    onGenerateMontage: () => void;
    onDownloadSelectedImages: () => void;
    onAddCustomOption: (groupName: string, optionName: string) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
    productData,
    onProductDataChange,
    targetPlatform,
    setTargetPlatform,
    toneOfVoice,
    setToneOfVoice,
    contentLength,
    setContentLength,
    onFetchUrl,
    isFetchingUrl,
    onFileImport,
    isImportingFromFile,
    onGenerateImage,
    isGeneratingImage,
    onGenerateVideo,
    onEditVideo,
    isGeneratingVideo,
    onGenerateMusic,
    isGeneratingMusic,
    onPreviewVideo,
    onVariantChange,
    onGenerateSeo,
    isGeneratingSeo,
    seoContent,
    onExport,
    onPublish,
    isPublishing,
    onDownloadImages,
    onGenerateMontage,
    onDownloadSelectedImages,
    onAddCustomOption,
}) => {
    const isAnyImageSelected = productData.images.some(img => img.selected);
    const isAnyVariantSelected = productData.variants.some(g => g.options.some(o => o.selected));
    const canExport = seoContent && isAnyVariantSelected;
    const canPublish = canExport && productData.shopifyStore && productData.shopifyToken;
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-8">
            <Section 
                title="1. Configure AI Settings" 
                icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                }
                gradient={true}
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-3">Target Platform</label>
                        <div className="flex flex-wrap gap-3">
                            {PLATFORMS.map(p => (
                                <button key={p.id} onClick={() => setTargetPlatform(p.id)}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover-lift ${
                                        targetPlatform === p.id 
                                            ? 'bg-primary-accent text-white shadow-lg border-primary-accent' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-200'
                                    }`}>
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-3">Tone of Voice</label>
                        <div className="flex flex-wrap gap-3">
                            {TONES.map(t => (
                                <button key={t.id} onClick={() => setToneOfVoice(t.id)}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover-lift ${
                                        toneOfVoice === t.id 
                                            ? 'bg-primary-accent text-white shadow-lg border-primary-accent' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-200'
                                    }`}>
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-text-primary mb-3">Content Length</label>
                        <div className="flex flex-wrap gap-3">
                            {[{ id: 'short', name: 'Short' }, { id: 'medium', name: 'Medium' }, { id: 'long', name: 'Long' }].map(len => (
                                <button key={len.id} onClick={() => setContentLength(len.id)}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover-lift ${
                                        contentLength === len.id 
                                            ? 'bg-primary-accent text-white shadow-lg border-primary-accent' 
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-200'
                                    }`}>
                                    {len.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            <Section 
                title="2. Provide Product Details"
                icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                }
            >
                 <div className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="import-url" className="block text-sm font-semibold text-text-primary mb-2">Import from URL</label>
                            <div className="flex rounded-xl shadow-soft border border-border overflow-hidden">
                                <input type="text" id="import-url" value={productData.importUrl}
                                    onChange={(e) => onProductDataChange('importUrl', e.target.value)}
                                    className="flex-1 block w-full border-0 focus:ring-2 focus:ring-primary-accent focus:outline-none sm:text-sm px-4 py-3 bg-white/80"
                                    placeholder="https://example.com/product-page" />
                                <Button onClick={onFetchUrl} disabled={isFetchingUrl} variant="gradient" size="sm" className="rounded-none">
                                    {isFetchingUrl ? <Icon name="spinner" className="animate-spin" /> : 'Fetch'}
                                </Button>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-border-light" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white/80 px-4 text-sm text-text-muted font-medium">
                                Or
                                </span>
                            </div>
                        </div>

                         <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-accent/5 to-secondary/5 rounded-xl border border-primary-accent/20">
                             <label htmlFor="import-file" className="block text-sm font-semibold text-text-primary">Import from HTML File</label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={onFileImport}
                                className="hidden"
                                accept=".html,.htm"
                                id="import-file"
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isImportingFromFile}
                                variant="secondary"
                                size="sm"
                            >
                                {isImportingFromFile ? (
                                    <>
                                        <Icon name="spinner" className="animate-spin mr-2" /> Importing...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="upload" className="mr-2" /> Upload File
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-text-primary mb-2">Product Description</label>
                        <textarea id="description" rows={6} value={productData.description}
                            onChange={(e) => onProductDataChange('description', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-border shadow-soft focus:ring-2 focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-4 bg-white/80 resize-none"
                            placeholder="Describe your product in detail..."
                        ></textarea>
                    </div>
                </div>
                 <ImageUploader 
                    images={productData.images} 
                    onImagesChange={(images) => onProductDataChange('images', images)}
                        onEnhanceClick={onGenerateImage}
                        isEnhancing={isGeneratingImage}
                        onGenerateVideoClick={onGenerateVideo}
                        onEditVideoClick={onEditVideo}
                        isGeneratingVideo={isGeneratingVideo}
                        onGenerateMusicClick={onGenerateMusic}
                        isGeneratingMusic={isGeneratingMusic}
                    onMontageClick={onGenerateMontage}
                    onDownloadSelectedImages={onDownloadSelectedImages}
                />
                 {productData.videos.length > 0 && (
                    <VideoGallery
                        videos={productData.videos}
                        onVideosChange={(videos) => onProductDataChange('videos', videos)}
                        onPreviewClick={onPreviewVideo}
                    />
                )}
                 {productData.audio.length > 0 && (
                    <AudioGallery
                        audioFiles={productData.audio}
                        onAudioFilesChange={(audio) => onProductDataChange('audio', audio)}
                    />
                )}
            </Section>
            
            <Section 
                title="3. Configure Product Variants"
                icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                }
            >
               <VariantSelector 
                    basePrice={productData.basePrice}
                    onBasePriceChange={(price) => onProductDataChange('basePrice', price)}
                    compareAtPrice={productData.compareAtPrice}
                    onCompareAtPriceChange={(price) => onProductDataChange('compareAtPrice', price)}
                    finishGroups={productData.variants} 
                    onVariantChange={onVariantChange}
                    onAddCustomOption={onAddCustomOption}
                    key={productData.variants.length} // Force re-render when variants change
                />
            </Section>
            
            <Section title="4. Generate & Publish" iconName="bolt">
                <div className="space-y-4">
                    <button onClick={onGenerateSeo} disabled={isGeneratingSeo} title="Generate SEO Content (Ctrl/Cmd + G)" className="w-full px-6 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white shadow-lg hover:from-[#7c3aed] hover:to-[#db2777] hover-lift transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                        {isGeneratingSeo ? <><Icon name="spinner" className="animate-spin mr-2" /> Generating...</> : <>⚡ Generate SEO Content</>}
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onDownloadImages} disabled={!isAnyImageSelected} title="Download selected images (Ctrl/Cmd + Shift + D)" className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-[#6366f1] hover:bg-[#4f46e5] shadow-md hover:shadow-lg hover-lift transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                            📥 Download
                        </button>
                        <button onClick={onExport} disabled={!canExport} title={!canExport ? 'Please generate SEO content and select at least one variant.' : ''} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-[#6366f1] hover:bg-[#4f46e5] shadow-md hover:shadow-lg hover-lift transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                            📤 Export
                        </button>
                    </div>
                    
                    <button onClick={onPublish} disabled={!canPublish || isPublishing} title={!canPublish ? 'Please fill Shopify details, generate SEO content and select variants.' : 'Publish to Shopify (Ctrl/Cmd + Alt + P)'} className="w-full px-6 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-lg hover:from-[#059669] hover:to-[#047857] hover-lift transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                        {isPublishing ? <><Icon name="spinner" className="animate-spin mr-2" /> Publishing...</> : <>🚀 Publish to Shopify</>}
                    </button>
                </div>
            </Section>

            <Section 
                title="5. Connect to Shopify (Optional)"
                icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                }
            >
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="shopify-store" className="block text-sm font-semibold text-text-primary mb-2">Shopify Store URL</label>
                        <input type="text" id="shopify-store" value={productData.shopifyStore}
                            onChange={(e) => onProductDataChange('shopifyStore', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-border shadow-soft focus:ring-2 focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-4 bg-white/80"
                            placeholder="your-store-name.myshopify.com"
                        />
                         <p className="mt-2 text-xs text-text-muted">Enter your full Shopify URL (e.g., your-store-name.myshopify.com).</p>
                    </div>
                    <div>
                        <label htmlFor="shopify-token" className="block text-sm font-semibold text-text-primary mb-2">Shopify Admin API Access Token</label>
                        <input type="password" id="shopify-token" value={productData.shopifyToken}
                            onChange={(e) => onProductDataChange('shopifyToken', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-border shadow-soft focus:ring-2 focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-4 bg-white/80"
                            placeholder="shpat_..."
                        />
                    </div>
                </div>
            </Section>
        </div>
    );
};
