
import React, { useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { ImageFile } from '../types';

interface GenerateVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (prompt: string, aspectRatio: string, resolution: string) => void;
    image: ImageFile;
}

const VIDEO_ACTIONS = [
    { id: 'zoom', name: 'Zoom In', prompt: 'A smooth, slow zoom-in on the product, emphasizing its details. Set against a clean, professional studio background.' },
    { id: 'rotate', name: 'Rotate', prompt: 'A 360-degree rotation of the product, showcasing all angles. The background should be neutral and non-distracting.' },
    { id: 'interact', name: 'Interaction', prompt: 'A person\'s hands enter the frame to gently pick up, touch, or demonstrate the use of the product. The focus remains on the product.' },
    { id: 'unboxing', name: 'Unboxing', prompt: 'A satisfying unboxing sequence where the product is revealed from simple, elegant packaging.' },
    { id: 'blur_bg', name: 'Blur Background', prompt: 'A video of the product with the background artistically blurred to create a sense of depth and focus.' },
];

const ASPECT_RATIOS = [
    { id: '16:9', name: 'Landscape (16:9)' },
    { id: '9:16', name: 'Portrait (9:16)' },
];

const RESOLUTIONS = [
    { id: '720p', name: 'HD (720p)' },
    { id: '1080p', name: 'Full HD (1080p)' },
];


export const GenerateVideoModal: React.FC<GenerateVideoModalProps> = ({ isOpen, onClose, onGenerate, image }) => {
    const [selectedAction, setSelectedAction] = useState(VIDEO_ACTIONS[0]);
    const [customPrompt, setCustomPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].id);
    const [resolution, setResolution] = useState(RESOLUTIONS[0].id);

    if (!isOpen) return null;

    const handleGenerate = () => {
        onGenerate(customPrompt || selectedAction.prompt, aspectRatio, resolution);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Generate Product Video</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                       <Icon name="x" />
                    </button>
                </div>
                <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-full">
                       <img 
                            src={`data:${image.mimeType};base64,${image.base64}`}
                            alt={image.name}
                            className="max-h-full max-w-full object-contain rounded-md"
                        />
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-base font-semibold text-gray-800 mb-2">1. Choose Video Action</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {VIDEO_ACTIONS.map(action => (
                                    <button key={action.id} onClick={() => { setSelectedAction(action); setCustomPrompt(''); }}
                                        className={`px-4 py-2 text-sm text-left font-medium rounded-lg transition-colors border ${selectedAction.id === action.id && !customPrompt ? 'bg-primary-accent text-white border-transparent' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                        {action.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-base font-semibold text-gray-800 mb-2">2. Or Write a Custom Prompt</h4>
                            <textarea id="custom-prompt" rows={3} value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="e.g., A stop-motion video showing the product assembling itself."
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-3"
                            ></textarea>
                        </div>
                        <div>
                            <h4 className="text-base font-semibold text-gray-800 mb-2">3. Configure Video Options</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                                    <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-2">
                                        {ASPECT_RATIOS.map(ar => <option key={ar.id} value={ar.id}>{ar.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
                                    <select value={resolution} onChange={e => setResolution(e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-2">
                                        {RESOLUTIONS.map(res => <option key={res.id} value={res.id}>{res.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-violet-50 p-3 rounded-lg">
                            Video generation is a powerful feature that may incur costs. Please review the 
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-primary-accent hover:underline ml-1">
                                billing documentation
                            </a> for details.
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end border-t">
                    <Button onClick={handleGenerate} variant="primary">
                        <Icon name="film" className="mr-2"/>
                        Generate Video
                    </Button>
                </div>
            </div>
        </div>
    );
};