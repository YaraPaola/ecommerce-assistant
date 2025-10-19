import React, { useState, useEffect } from 'react';
import { VideoFile } from '../types';
import { Button } from './Button';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

interface VideoPreviewModalProps {
    video: VideoFile;
    onClose: () => void;
    onAccept?: () => void;
    onDiscard?: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({ video, onClose, onAccept, onDiscard }) => {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const handleRetry = () => {
        setRetryCount(c => c + 1);
    };

    useEffect(() => {
        let objectUrl: string | undefined;

        const loadVideo = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
                const response = await fetch(`${video.url}&key=${process.env.API_KEY}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
                }
                const blob = await response.blob();
                objectUrl = URL.createObjectURL(blob);
                setVideoUrl(objectUrl);
            } catch (err) {
                console.error("Error fetching video for preview:", err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred while loading the video.');
            } finally {
                setIsLoading(false);
            }
        };

        loadVideo();

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                setVideoUrl(null); // Clear state on cleanup
            }
        };
    }, [video.url, retryCount]);

    const posterUrl = `data:${video.sourceImage.mimeType};base64,${video.sourceImage.base64}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Video Preview</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                       <Icon name="x" />
                    </button>
                </div>
                <div className="p-6 bg-gray-100 flex items-center justify-center min-h-[400px]">
                    {isLoading && (
                        <div className="text-center">
                            <Spinner />
                            <p className="mt-2 text-gray-600">Downloading video for preview...</p>
                        </div>
                    )}
                    {error && (
                        <div className="text-center text-red-600">
                            <Icon name="x-circle" className="w-12 h-12 mx-auto" />
                            <p className="mt-2 font-semibold">Could not load video</p>
                            <p className="text-sm">{error}</p>
                            <Button onClick={handleRetry} variant="secondary" className="mt-4">
                                <Icon name="refresh" className="mr-2" />
                                Retry
                            </Button>
                        </div>
                    )}
                    {!isLoading && !error && videoUrl && (
                         <video
                            key={videoUrl}
                            src={videoUrl}
                            poster={posterUrl}
                            controls
                            autoPlay
                            loop
                            className="max-h-[70vh] w-auto mx-auto rounded-lg shadow-lg bg-black"
                        />
                    )}
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-4">
                     {onDiscard && (
                        <Button onClick={onDiscard} variant="secondary">
                            <Icon name="trash" className="mr-2"/>
                            Discard
                        </Button>
                     )}
                     {onAccept && (
                        <Button onClick={onAccept} variant="primary">
                            <Icon name="check-circle" className="mr-2"/>
                            Accept and Add to Gallery
                        </Button>
                     )}
                     {!onAccept && !onDiscard && (
                         <Button onClick={onClose} variant="primary">
                            Close
                        </Button>
                     )}
                </div>
            </div>
        </div>
    );
};
