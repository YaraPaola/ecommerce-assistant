import React from 'react';
import { ImageFile } from '../types';
import { Icon } from './Icon';
import { Button } from './Button';

interface VideoEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    video: ImageFile; // Still using ImageFile for consistency, but base64 will be a blob URL
    onSave: (trimmedVideoBlob: Blob, originalVideoId: string) => void;
}

export const VideoEditorModal: React.FC<VideoEditorModalProps> = ({ isOpen, onClose, video, onSave }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [startTime, setStartTime] = React.useState(0);
    const [endTime, setEndTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [isProcessing, setIsProcessing] = React.useState(false);

    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
                setDuration(videoRef.current?.duration || 0);
                setEndTime(videoRef.current?.duration || 0);
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsProcessing(true);
        console.log(`Attempting to trim video from ${startTime}s to ${endTime}s`);

        // Placeholder for actual video trimming logic
        // In a real scenario, this would involve complex client-side (e.g., WebAssembly FFmpeg)
        // or server-side processing to re-encode the video segment.
        // For now, we'll simulate a trimmed video by creating a dummy blob.
        const dummyBlob = new Blob(['trimmed video data placeholder'], { type: video.mimeType });
        
        onSave(dummyBlob, video.id); 
        setIsProcessing(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Video: {video.name}</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                        <Icon name="x" />
                    </button>
                </div>
                <div className="flex-grow p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto">
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-full">
                        <video
                            ref={videoRef}
                            src={video.base64.startsWith('blob:') ? video.base64 : `data:${video.mimeType};base64,${video.base64}`}
                            className="max-h-full max-w-full object-contain rounded-md"
                            controls
                        />
                        {/* Canvas for future frame manipulation/trimming visualization */}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-base font-semibold text-gray-800">Video Editing Tools</h4>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Trim Video</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={startTime}
                                    onChange={(e) => setStartTime(Math.max(0, Math.min(parseFloat(e.target.value), endTime)))}
                                    className="w-20 rounded-lg border-gray-300 shadow-sm sm:text-sm p-2"
                                    step="0.1"
                                    min="0"
                                    max={endTime}
                                />
                                <span className="text-gray-500">-</span>
                                <input
                                    type="number"
                                    value={endTime}
                                    onChange={(e) => setEndTime(Math.max(startTime, Math.min(parseFloat(e.target.value), duration)))}
                                    className="w-20 rounded-lg border-gray-300 shadow-sm sm:text-sm p-2"
                                    step="0.1"
                                    min={startTime}
                                    max={duration}
                                />
                                <span className="text-sm text-gray-500">seconds (Total: {duration.toFixed(1)}s)</span>
                            </div>
                            {/* Future: Add a visual slider for trimming */}
                        </div>
                        <p className="text-sm text-gray-500">
                            (More features like crop, filters, and text overlays coming soon!)
                        </p>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end border-t">
                    <Button onClick={onClose} variant="secondary" className="mr-2" disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} variant="primary" disabled={isProcessing}>
                        {isProcessing ? <Icon name="spinner" className="animate-spin mr-2" /> : null}
                        {isProcessing ? 'Processing...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
