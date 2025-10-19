import React, { useRef, useState, useEffect } from 'react';
import { AudioFile } from '../types';
import { Icon } from './Icon';
import { decode, decodeToAudioBuffer, encodeWav } from '../utils/audioUtils';

interface AudioGalleryProps {
    audioFiles: AudioFile[];
    onAudioFilesChange: (audioFiles: AudioFile[]) => void;
}

export const AudioGallery: React.FC<AudioGalleryProps> = ({ audioFiles, onAudioFilesChange }) => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const [playingState, setPlayingState] = useState<{ id: string, source: AudioBufferSourceNode } | null>(null);

    useEffect(() => {
        // Initialize AudioContext on the first interaction
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        // Cleanup: stop any playing audio when the component unmounts
        return () => {
            if (playingState) {
                playingState.source.stop();
            }
        };
    }, []); // Empty dependency array ensures this runs only once

    const removeAudio = (id: string) => {
        if (playingState?.id === id) {
            playingState.source.stop();
            setPlayingState(null);
        }
        onAudioFilesChange(audioFiles.filter((audio) => audio.id !== id));
    };

    const handlePlayPause = async (audio: AudioFile) => {
        const audioCtx = audioCtxRef.current;
        if (!audioCtx) return;

        // If this track is already playing, stop it.
        if (playingState?.id === audio.id) {
            playingState.source.stop();
            setPlayingState(null);
            return;
        }

        // If another track is playing, stop it first.
        if (playingState) {
            playingState.source.stop();
        }

        const rawData = decode(audio.base64);
        const audioBuffer = await decodeToAudioBuffer(rawData, audioCtx, audio.sampleRate, audio.numChannels);
        
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();

        source.onended = () => {
            setPlayingState(current => (current?.id === audio.id ? null : current));
        };
        
        setPlayingState({ id: audio.id, source });
    };

    const handleDownload = async (audio: AudioFile) => {
        const audioCtx = audioCtxRef.current;
        if (!audioCtx) {
            console.error("AudioContext not initialized");
            return;
        }

        const rawData = decode(audio.base64);
        const audioBuffer = await decodeToAudioBuffer(rawData, audioCtx, audio.sampleRate, audio.numChannels);
        const wavBlob = encodeWav(audioBuffer.getChannelData(0), audio.sampleRate, audio.numChannels);

        const url = URL.createObjectURL(wavBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = audio.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Audio ({audioFiles.length})</label>
            <div className="space-y-2">
                {audioFiles.map(audio => (
                    <div key={audio.id} className="flex items-center justify-between bg-violet-50/50 p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <button onClick={() => handlePlayPause(audio)} className="p-2 bg-violet-100 rounded-full text-primary-accent hover:bg-violet-200">
                                <Icon name={playingState?.id === audio.id ? 'pause' : 'play'} />
                            </button>
                            <span className="text-sm font-medium text-gray-800">{audio.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => handleDownload(audio)} className="p-2 text-gray-500 hover:text-green-600" title="Download WAV">
                                <Icon name="download" />
                            </button>
                             <button onClick={() => removeAudio(audio.id)} className="p-2 text-gray-500 hover:text-red-600" title="Remove Audio">
                                <Icon name="trash" />
                            </button>
                        </div>
                    </div>
                ))}
                 <p className="mt-2 text-xs text-gray-500">
                    You can download generated audio tracks and combine them with your videos using a video editing tool.
                </p>
            </div>
        </div>
    );
};