import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { ImageFile, ToastInfo } from '../types';
import { ImageEditor, ImageEditorHandle } from './ImageEditor';
import { changeImageColor } from '../services/imageService';

interface BackgroundPreset {
    name: string;
    prompt: string;
}

interface EnhanceImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (editedImage: { base64: string, mimeType: string }, customPrompt: string, size: string) => void;
    backgroundPresets: BackgroundPreset[];
    image: ImageFile;
    showToast: (type: ToastInfo['type'], message: string) => void;
    onObjectRemovalRequest?: (image: ImageFile) => void;
    isRemovingObject?: boolean;
}

const SIZES = [
    { id: '1:1', name: 'Square (1:1)' },
    { id: '9:16', name: 'Portrait (9:16)' },
    { id: '16:9', name: 'Landscape (16:9)' },
];

export const EnhanceImageModal: React.FC<EnhanceImageModalProps> = ({ isOpen, onClose, onGenerate, backgroundPresets, image, showToast, onObjectRemovalRequest, isRemovingObject }) => {
    const [customPrompt, setCustomPrompt] = useState(backgroundPresets[0].prompt);
    const [selectedSize, setSelectedSize] = useState(SIZES[0].id);
    const [editedImageFile, setEditedImageFile] = useState<ImageFile>(image);
    const [isChangingColor, setIsChangingColor] = useState(false);

    const editorRef = useRef<ImageEditorHandle>(null);

    if (!isOpen) return null;

    const handleGenerate = () => {
        const editedImageData = editorRef.current?.getEditedImageData();
        if (editedImageData) {
            if (!customPrompt.trim()) {
                showToast('error', 'Please select a background preset or write a custom prompt.');
                return;
            }
            onGenerate(editedImageData, customPrompt, selectedSize);
        }
    };

    const handleColorChangeRequest = async (color: string) => {
        if (!color.trim()) {
            showToast('error', 'Please enter a color.');
            return;
        }
        setIsChangingColor(true);
        showToast('info', `Changing color to ${color}...`);
        try {
            const newImage = await changeImageColor(editedImageFile, color);
            setEditedImageFile(newImage);
            showToast('success', 'Color changed successfully!');
        } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Failed to change image color.');
        } finally {
            setIsChangingColor(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl transform transition-all h-[95vh] flex flex-col">
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Edit & Enhance Image</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                       <Icon name="x" />
                    </button>
                </div>
                <div className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden min-h-0">
                    {/* Image Editor Column */}
                    <div className="lg:col-span-3 bg-gray-100 rounded-lg p-3 flex flex-col h-full">
                       <ImageEditor
                            ref={editorRef}
                            image={editedImageFile}
                        />
                    </div>

                    {/* AI Settings Column */}
                    <div className="lg:col-span-1 space-y-3 overflow-y-auto">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Image Size</h4>
                            <div className="grid grid-cols-1 gap-1.5">
                                {SIZES.map(size => (
                                    <button key={size.id} onClick={() => setSelectedSize(size.id)}
                                        className={`px-2 py-1.5 text-xs font-medium rounded transition-colors border ${selectedSize === size.id ? 'bg-primary-accent text-white border-transparent' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                        {size.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Background Preset</h4>
                            <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
                                {backgroundPresets.map((preset: BackgroundPreset) => (
                                    <button key={preset.name} onClick={() => setCustomPrompt(preset.prompt)}
                                        className={`px-2 py-1 text-xs font-medium rounded transition-colors text-left ${customPrompt === preset.prompt ? 'bg-primary-accent text-white border-transparent' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Custom Prompt</h4>
                            <textarea id="custom-prompt" rows={4} value={customPrompt}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomPrompt(e.target.value)}
                                placeholder="A sunlit, minimalist studio with a marble countertop..."
                                className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-primary-accent focus:border-primary-accent text-xs p-2"
                            ></textarea>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-3 bg-gray-50 flex justify-end border-t">
                    <Button onClick={handleGenerate} variant="primary">
                        <Icon name="sparkles" className="mr-2"/>
                        Generate Enhanced Image
                    </Button>
                </div>
            </div>
        </div>
    );
};
