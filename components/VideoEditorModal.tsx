import React from 'react';
import { ImageFile } from '../types';
import { Icon } from './Icon';
import { Button } from './Button';

interface VideoEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: ImageFile;
}

export const VideoEditorModal: React.FC<VideoEditorModalProps> = ({ isOpen, onClose, video }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Video</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                        <Icon name="x" />
                    </button>
                </div>
                <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-full">
                        <video
                            src={video.base64.startsWith('blob:') ? video.base64 : `data:${video.mimeType};base64,${video.base64}`}
                            className="max-h-full max-w-full object-contain rounded-md"
                            controls
                        />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-base font-semibold text-gray-800">Video Editing Tools</h4>
                        <p className="text-sm text-gray-500">
                            (Coming soon: Trim, crop, filters, and more)
                        </p>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end border-t">
                    <Button onClick={onClose} variant="secondary" className="mr-2">
                        Cancel
                    </Button>
                    <Button onClick={onClose} variant="primary">
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};
