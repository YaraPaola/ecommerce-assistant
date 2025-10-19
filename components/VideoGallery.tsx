import React from 'react';
import { VideoFile } from '../types';
import { Icon } from './Icon';

interface VideoGalleryProps {
    videos: VideoFile[];
    onVideosChange: (videos: VideoFile[]) => void;
    onPreviewClick: (video: VideoFile) => void;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ videos, onVideosChange, onPreviewClick }) => {

    const removeVideo = (id: string) => {
        onVideosChange(videos.filter((video) => video.id !== id));
    };

    const toggleSelection = (id: string) => {
        const updatedVideos = videos.map(vid =>
            vid.id === id ? { ...vid, selected: !vid.selected } : vid
        );
        onVideosChange(updatedVideos);
    };

    const allSelected = videos.length > 0 && videos.every(vid => vid.selected);

    const handleToggleSelectAll = () => {
        const newSelectionState = !allSelected;
        const updatedVideos = videos.map(vid => ({ ...vid, selected: newSelectionState }));
        onVideosChange(updatedVideos);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Product Videos ({videos.length})</label>
                {videos.length > 0 && (
                     <button
                        onClick={handleToggleSelectAll}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                        {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {videos.map((video) => (
                    <div key={video.id} className="relative group aspect-square">
                        <div 
                            className={`w-full h-full rounded-md transition-all overflow-hidden ${video.selected ? 'ring-2 ring-offset-2 ring-indigo-500' : 'ring-1 ring-gray-200'}`}
                        >
                            <img src={`data:${video.sourceImage.mimeType};base64,${video.sourceImage.base64}`} alt={video.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <Icon name="film" className="w-10 h-10 text-white opacity-80" />
                            </div>
                        </div>
                        
                        <button
                            onClick={() => toggleSelection(video.id)}
                            className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors
                                ${video.selected ? 'bg-indigo-600 border-indigo-600' : 'bg-white/50 border-gray-400 group-hover:border-gray-600'}
                            `}
                            aria-label={`Select video ${video.name}`}
                            title={video.selected ? `Deselect video` : `Select video`}
                        >
                            {video.selected && <Icon name="check" className="w-4 h-4 text-white" />}
                        </button>
                        
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center gap-2 z-10">
                            <button onClick={(e) => { e.stopPropagation(); onPreviewClick(video); }} className="p-2 bg-white/80 rounded-full text-blue-500 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity" title="Preview Video">
                                <Icon name="play" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); removeVideo(video.id); }} className="p-2 bg-white/80 rounded-full text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity" title="Remove Video">
                                <Icon name="trash" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};