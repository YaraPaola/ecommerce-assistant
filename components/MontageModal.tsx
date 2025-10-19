
import React, { useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { ImageFile } from '../types';

interface BackgroundPreset {
    name: string;
    prompt: string;
}

interface MontageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (prompt: string, size: string) => void;
    images: ImageFile[];
    backgroundPresets: BackgroundPreset[];
}

const SIZES = [
    { id: '1:1', name: 'Square (1:1)' },
    { id: '16:9', name: 'Landscape (16:9)' },
    { id: '9:16', name: 'Portrait (9:16)' },
];

export const MontageModal: React.FC<MontageModalProps> = ({ isOpen, onClose, onGenerate, images, backgroundPresets }) => {
    const [customPrompt, setCustomPrompt] = useState(backgroundPresets[0].prompt);
    const [selectedSize, setSelectedSize] = useState(SIZES[0].id);

    if (!isOpen) return null;

    const handleGenerate = () => {
        onGenerate(customPrompt, selectedSize);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Create Product Montage</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                       <Icon name="x" />
                    </button>
                </div>
                <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                    <div className="space-y-4">
                         <h4 className="text-base font-semibold text-gray-800">Images to Combine ({images.length})</h4>
                         <div className="grid grid-cols-4 gap-2 bg-gray-100 p-2 rounded-lg">
                             {images.map(img => (
                                 <div key={img.id} className="aspect-square rounded overflow-hidden ring-1 ring-gray-200">
                                     <img src={`data:${img.mimeType};base64,${img.base64}`} alt={img.name} className="w-full h-full object-cover" />
                                 </div>
                             ))}
                         </div>
                         <p className="text-xs text-gray-500">The AI will extract the products from these images and arrange them in a new scene.</p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-base font-semibold text-gray-800 mb-2">1. Select Image Size</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {SIZES.map(size => (
                                    <button key={size.id} onClick={() => setSelectedSize(size.id)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${selectedSize === size.id ? 'bg-primary-accent text-white border-transparent' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                        {size.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-base font-semibold text-gray-800 mb-2">2. Choose a Background Preset</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {backgroundPresets.map(preset => (
                                    <button key={preset.name} onClick={() => setCustomPrompt(preset.prompt)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors text-left ${customPrompt === preset.prompt ? 'bg-primary-accent text-white border-transparent' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-base font-semibold text-gray-800 mb-2">3. Customize Your Prompt</h4>
                            <textarea id="custom-prompt" rows={4} value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="A sunlit, minimalist studio with a marble countertop..."
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-3"
                            ></textarea>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end border-t">
                    <Button onClick={handleGenerate} variant="primary">
                        <Icon name="sparkles" className="mr-2"/>
                        Generate Montage
                    </Button>
                </div>
            </div>
        </div>
    );
};