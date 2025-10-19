import React, { useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface ImageSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrls: string[];
    onConfirm: (selectedUrls: string[]) => void;
    title?: string;
    productUrl?: string; // Add productUrl to use as a referer
}

export const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
    isOpen,
    onClose,
    imageUrls,
    onConfirm,
    title = 'Select Images to Import',
    productUrl
}) => {
    const [selected, setSelected] = useState<Set<string>>(new Set(imageUrls));

    if (!isOpen) return null;

    const toggleSelection = (url: string) => {
        setSelected(prev => {
            const newSet = new Set(prev);
            if (newSet.has(url)) {
                newSet.delete(url);
            } else {
                newSet.add(url);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selected.size === imageUrls.length) {
            setSelected(new Set()); // Deselect all
        } else {
            setSelected(new Set(imageUrls)); // Select all
        }
    };
    
    const handleConfirm = () => {
        onConfirm(Array.from(selected));
    };

    const getProxyUrl = (imageUrl: string) => {
        let proxyUrl = `/api/proxy?url=${encodeURIComponent(imageUrl)}`;
        if (productUrl) {
            proxyUrl += `&referer=${encodeURIComponent(productUrl)}`;
        }
        return proxyUrl;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl transform transition-all flex flex-col h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-500">Found {imageUrls.length} images. Selected {selected.size}.</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                       <Icon name="x" />
                    </button>
                </div>
                <div className="flex-grow p-6 overflow-y-auto">
                    {imageUrls.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {imageUrls.map((url) => {
                                const isSelected = selected.has(url);
                                return (
                                    <div key={url} className="relative group aspect-square cursor-pointer" onClick={() => toggleSelection(url)}>
                                        <div className={`w-full h-full rounded-lg transition-all overflow-hidden ${isSelected ? 'ring-2 ring-offset-2 ring-primary-accent' : 'ring-1 ring-gray-200'}`}>
                                            <img src={getProxyUrl(url)} alt="Scraped product" className="w-full h-full object-cover bg-gray-100" />
                                        </div>
                                        <div className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-primary-accent border-primary-accent' : 'bg-white/50 border-gray-400 group-hover:border-gray-600'}`}>
                                            {isSelected && <Icon name="check" className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                         <div className="flex flex-col items-center justify-center h-full text-gray-500">
                             <Icon name="x-circle" className="w-16 h-16 text-gray-300" />
                            <p className="mt-4">No images were found on the page.</p>
                        </div>
                    )}
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t">
                    <Button onClick={handleSelectAll} variant="secondary">
                        {selected.size === imageUrls.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <div className="flex gap-4">
                        <Button onClick={onClose} variant="secondary">Cancel</Button>
                        <Button onClick={handleConfirm} variant="primary" disabled={selected.size === 0}>
                            <Icon name="download" className="mr-2"/>
                            Import {selected.size} Images
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageSelectionModal;
