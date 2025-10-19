import React, { useState } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';
import { MUSIC_GENRES, MUSIC_MOODS } from '../constants';

interface GenerateMusicModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (genre: string, mood: string, duration: number) => void;
}

export const GenerateMusicModal: React.FC<GenerateMusicModalProps> = ({ isOpen, onClose, onGenerate }) => {
    const [genre, setGenre] = useState(MUSIC_GENRES[0]);
    const [mood, setMood] = useState(MUSIC_MOODS[0]);
    const [duration, setDuration] = useState(30);

    if (!isOpen) return null;

    const handleGenerate = () => {
        if (duration > 0 && duration <= 180) { // Capping duration
            onGenerate(genre, mood, duration);
        }
    };
    
    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        setDuration(isNaN(val) ? 0 : val);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Generate Background Music</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
                       <Icon name="x" />
                    </button>
                </div>
                <div className="flex-grow p-6 space-y-6">
                    <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                        <select id="genre" value={genre} onChange={e => setGenre(e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-2">
                            {MUSIC_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
                        <select id="mood" value={mood} onChange={e => setMood(e.target.value)} className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-2">
                            {MUSIC_MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                        <input
                            type="number"
                            id="duration"
                            value={duration}
                            onChange={handleDurationChange}
                            min="5"
                            max="180"
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-primary-accent focus:border-primary-accent sm:text-sm p-2"
                        />
                         <p className="mt-1 text-xs text-gray-500">Enter a duration between 5 and 180 seconds.</p>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end border-t">
                    <Button onClick={handleGenerate} variant="primary" disabled={!duration || duration < 5 || duration > 180}>
                        <Icon name="musical-note" className="mr-2"/>
                        Generate Music
                    </Button>
                </div>
            </div>
        </div>
    );
};