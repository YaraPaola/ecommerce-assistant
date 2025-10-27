import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { fabric } from 'fabric';
import { ImageFile } from '../types';
import { Icon } from './Icon';
import { Button } from './Button';

export interface ImageEditorHandle {
    getEditedImageData: () => { base64: string; mimeType: string; } | null;
}

interface ImageEditorProps {
    image: ImageFile;
}

const SliderControl: React.FC<{ label: string, value: number, min?: number, max?: number, step?: number, unit?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = 
({ label, value, min = -100, max = 100, step = 1, unit = '', onChange }) => (
    <div className="flex-1">
        <label className="text-xs text-gray-500">{label}</label>
        <div className="flex items-center gap-2">
            <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full" />
            <span className="text-sm text-gray-700 w-12 text-right">{value}{unit}</span>
        </div>
    </div>
);

export const ImageEditor = forwardRef<ImageEditorHandle, ImageEditorProps>(({ image }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const imageRef = useRef<fabric.Image | null>(null);

    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [saturate, setSaturate] = useState(0);
    const [sepia, setSepia] = useState(0);

    const applyFilter = (filter: fabric.IBaseFilter) => {
        if (imageRef.current) {
            imageRef.current.filters?.push(filter);
            imageRef.current.applyFilters();
            fabricCanvasRef.current?.renderAll();
        }
    };

    const updateFilter = (filterName: string, value: number) => {
        if (imageRef.current) {
            const filterIndex = imageRef.current.filters?.findIndex(f => f.type.toLowerCase() === filterName.toLowerCase());
            if (filterIndex !== -1 && filterIndex !== undefined) {
                (imageRef.current.filters![filterIndex] as any)[filterName.toLowerCase()] = value;
            } else {
                const filter = new (fabric.Image.filters as any)[filterName]({ [filterName.toLowerCase()]: value });
                imageRef.current.filters?.push(filter);
            }
            imageRef.current.applyFilters();
            fabricCanvasRef.current?.renderAll();
        }
    };

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current);
        fabricCanvasRef.current = canvas;

        fabric.Image.fromURL(`data:${image.mimeType};base64,${image.base64}`, (img) => {
            img.scaleToWidth(canvas.getWidth());
            img.scaleToHeight(canvas.getHeight());
            canvas.add(img);
            imageRef.current = img;
        });

        return () => {
            canvas.dispose();
        };
    }, [image]);

    useEffect(() => {
        updateFilter('Brightness', brightness / 100);
    }, [brightness]);

    useEffect(() => {
        updateFilter('Contrast', contrast / 100);
    }, [contrast]);

    useEffect(() => {
        updateFilter('Saturation', saturate / 100);
    }, [saturate]);

    useEffect(() => {
        if (imageRef.current) {
            const sepiaFilter = new fabric.Image.filters.Sepia();
            if (sepia > 0) {
                imageRef.current.filters?.push(sepiaFilter);
            } else {
                imageRef.current.filters = imageRef.current.filters?.filter(f => f.type.toLowerCase() !== 'sepia');
            }
            imageRef.current.applyFilters();
            fabricCanvasRef.current?.renderAll();
        }
    }, [sepia]);

    useImperativeHandle(ref, () => ({
        getEditedImageData: () => {
            if (fabricCanvasRef.current) {
                return {
                    base64: fabricCanvasRef.current.toDataURL({ format: image.mimeType.split('/')[1] }).split(',')[1],
                    mimeType: image.mimeType,
                };
            }
            return null;
        }
    }));

    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex-grow flex items-center justify-center bg-gray-200 rounded-lg overflow-hidden min-h-0 relative">
                <canvas ref={canvasRef} />
            </div>
            <div className="flex-shrink-0 bg-gray-100 p-3 rounded-b-lg space-y-3 overflow-y-auto">
                <div className="border-t border-gray-300 pt-3 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
                    <SliderControl label="Brightness" value={brightness} onChange={e => setBrightness(Number(e.target.value))} />
                    <SliderControl label="Contrast" value={contrast} onChange={e => setContrast(Number(e.target.value))} />
                    <SliderControl label="Saturation" value={saturate} onChange={e => setSaturate(Number(e.target.value))} />
                    <SliderControl label="Sepia" min={0} max={100} value={sepia} onChange={e => setSepia(Number(e.target.value))} />
                </div>
            </div>
        </div>
    );
});
