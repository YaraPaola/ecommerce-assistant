
import React from 'react';
import { ImageFile } from '../types';
import { Button } from './Button';
import { Icon } from './Icon';

interface ImagePreviewModalProps {
    image: ImageFile;
    onAccept: () => void;
    onDiscard: () => void;
    onRedo: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ image, onAccept, onDiscard, onRedo }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Generated Image Preview</h3>
                    <button onClick={onDiscard} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                       <Icon name="x" />
                    </button>
                </div>
                <div className="p-6 bg-gray-100">
                    <img
                        src={`data:${image.mimeType};base64,${image.base64}`}
                        alt="Enhanced preview"
                        className="max-h-[70vh] w-auto mx-auto rounded-lg shadow-lg"
                    />
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-4">
                     <Button onClick={onDiscard} variant="secondary">
                        <Icon name="trash" className="mr-2"/>
                        Discard
                    </Button>
                     <Button onClick={onRedo} variant="secondary">
                        <Icon name="refresh" className="mr-2"/>
                        Redo
                    </Button>
                    <Button onClick={onAccept} variant="primary">
                        <Icon name="check-circle" className="mr-2"/>
                        Accept and Add to Gallery
                    </Button>
                </div>
            </div>
        </div>
    );
};