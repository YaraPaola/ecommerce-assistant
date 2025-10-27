
import React, { useRef } from 'react';
import { ImageFile } from '../types';
import { Icon } from './Icon';
import { downloadImage } from '../services/imageDownloadService';
import { Button } from './Button';

interface ImageUploaderProps {
    images: ImageFile[];
    onImagesChange: (images: ImageFile[]) => void;
    onEnhanceClick: (image: ImageFile) => void;
    isEnhancing: boolean;
    onGenerateVideoClick: (image: ImageFile) => void;
    isGeneratingVideo: boolean;
    onGenerateMusicClick: () => void;
    isGeneratingMusic: boolean;
    onMontageClick: () => void;
    onEditVideoClick: (video: ImageFile) => void;
    onDownloadSelectedImages: () => void;
    onEditImageClick: (image: ImageFile) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange, onEnhanceClick, isEnhancing, onGenerateVideoClick, isGeneratingVideo, onGenerateMusicClick, isGeneratingMusic, onMontageClick, onEditVideoClick, onDownloadSelectedImages, onEditImageClick }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = event.target.files;
            const newImages: ImageFile[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files.item(i);
                if (file) {
                    // For videos, use blob URL instead of base64 for better performance
                    if (file.type.startsWith('video/')) {
                        const blobUrl = URL.createObjectURL(file);
                        newImages.push({
                            id: crypto.randomUUID(),
                            name: file.name,
                            base64: blobUrl, // Store blob URL in base64 field for videos
                            mimeType: file.type,
                            selected: true,
                        });
                    } else {
                        const base64 = await fileToBase64(file);
                        newImages.push({
                            id: crypto.randomUUID(),
                            name: file.name,
                            base64: base64.split(',')[1],
                            mimeType: file.type,
                            selected: true,
                        });
                    }
                }
            }
            onImagesChange([...images, ...newImages]);
        }
    };

    const removeImage = (id: string) => {
        onImagesChange(images.filter((image) => image.id !== id));
    };

    const toggleSelection = (id: string) => {
        const updatedImages = images.map(img =>
            img.id === id ? { ...img, selected: !img.selected } : img
        );
        onImagesChange(updatedImages);
    };

    const allSelected = images.length > 0 && images.every(img => img.selected);

    const handleToggleSelectAll = () => {
        const newSelectionState = !allSelected;
        const updatedImages = images.map(img => ({ ...img, selected: newSelectionState }));
        onImagesChange(updatedImages);
    };

    const handleDownloadClick = (e: React.MouseEvent, image: ImageFile) => {
        e.stopPropagation();
        downloadImage(image);
    };

    const selectedImagesCount = images.filter(img => img.selected).length;
    const canCreateMontage = selectedImagesCount > 1;

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-4">
                    <label className="block text-sm font-medium text-gray-700">Product Images & Videos</label>
                    {images.length > 0 && (
                        <button
                            onClick={handleToggleSelectAll}
                            className="text-sm font-medium text-primary-accent hover:text-primary-accent-hover transition-colors"
                        >
                            {allSelected ? 'Deselect All' : `Select All (${images.length})`}
                        </button>
                    )}
                    {selectedImagesCount > 0 && (
                        <Button 
                            onClick={onDownloadSelectedImages}
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            title="Download selected images"
                        >
                            <Icon name="download" className="mr-1.5 h-4 w-4" />
                            Download Selected ({selectedImagesCount})
                        </Button>
                    )}
                </div>
                 <div className="flex items-center gap-2">
                    <Button 
                        onClick={onGenerateMusicClick}
                        disabled={isGeneratingMusic}
                        variant="secondary"
                        className="px-3 py-1.5 text-xs"
                        title="Generate background music"
                    >
                        <Icon name="musical-note" className="mr-1.5 h-4 w-4" />
                        Generate Music
                    </Button>
                    <Button 
                        onClick={onMontageClick} 
                        disabled={!canCreateMontage} 
                        variant="secondary" 
                        className="px-3 py-1.5 text-xs" 
                        title={!canCreateMontage ? 'Select 2 or more images to create a montage' : 'Combine selected images into one'}
                    >
                        <Icon name="sparkles" className="mr-1.5 h-4 w-4" />
                        Create Montage ({selectedImagesCount})
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {images.map((image, index) => (
                    <div key={image.id} className="relative group">
                        <div 
                            className={`w-full aspect-square rounded-lg transition-all overflow-hidden ${image.selected ? 'ring-2 ring-offset-2 ring-primary-accent' : 'ring-1 ring-gray-200'} bg-gray-900`}
                        >
                            {image.mimeType.startsWith('video/') ? (
                                <video 
                                    src={image.base64.startsWith('blob:') ? image.base64 : `data:${image.mimeType};base64,${image.base64}`}
                                    className="w-full h-full object-cover"
                                    controls
                                    preload="metadata"
                                />
                            ) : (
                                <img src={`data:${image.mimeType};base64,${image.base64}`} alt={image.name} className="w-full h-full object-cover" />
                            )}
                        </div>
                        
                        {/* Selection Checkbox */}
                        <button
                            onClick={() => toggleSelection(image.id)}
                            className={`absolute top-2 left-2 z-20 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors shadow-md
                                ${image.selected ? 'bg-primary-accent border-primary-accent' : 'bg-white/90 border-gray-400 group-hover:border-gray-600'}
                            `}
                            aria-label={`Select image ${image.name}`}
                            title={image.selected ? `Deselect image` : `Select image`}
                        >
                            {image.selected && <Icon name="check" className="w-4 h-4 text-white" />}
                        </button>
                        
                        {/* Actions Menu Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === image.id ? null : image.id); }}
                            className="absolute top-2 right-2 z-20 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100"
                            title="Actions"
                        >
                            <Icon name="menu" className="w-5 h-5 text-gray-700" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openMenuId === image.id && (
                            <>
                                <div 
                                    className="fixed inset-0 z-30" 
                                    onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute top-12 right-2 z-40 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px]">
                                    {image.mimeType.startsWith('video/') ? (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onEditVideoClick(image); }}
                                            className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-blue-50 transition-colors"
                                        >
                                            <Icon name="scissors" className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-700">Edit Video</span>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onEditImageClick(image); }}
                                                className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <Icon name="pencil" className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-700">Edit Image</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); onGenerateVideoClick(image); }}
                                                disabled={isGeneratingVideo}
                                                className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <Icon name="film" className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm font-medium text-gray-700">Create Video</span>
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); handleDownloadClick(e, image); }}
                                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-green-50 transition-colors"
                                    >
                                        <Icon name="download" className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-gray-700">Download</span>
                                    </button>
                                    <div className="border-t border-gray-200 my-1" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); removeImage(image.id); }}
                                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-red-50 transition-colors"
                                    >
                                        <Icon name="trash" className="w-4 h-4 text-red-500" />
                                        <span className="text-sm font-medium text-red-600">Delete Image</span>
                                    </button>
                                </div>
                            </>
                        )}
                        
                        {/* Primary Badge */}
                        {index === 0 && (
                             <span className="absolute top-2 left-11 bg-primary-accent text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">Primary</span>
                        )}
                    </div>
                ))}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-accent hover:bg-violet-50 transition-colors"
                >
                    <Icon name="upload" className="w-8 h-8 text-gray-400"/>
                    <span className="mt-2 text-xs text-center text-gray-500">Add More</span>
                </div>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/png, image/jpeg, image/webp, video/mp4, video/quicktime, video/webm, video/x-m4v"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};
