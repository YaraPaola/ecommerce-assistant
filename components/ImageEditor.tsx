import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { fabric } from 'fabric';
import { ImageFile } from '../types';
import { Icon } from './Icon';
import { Button } from './Button';
import { removeObjectFromImage } from '../services/imageService';

export interface ImageEditorHandle {
    getEditedImageData: () => { base64: string; mimeType: string; } | null;
}

interface ImageEditorProps {
    image: ImageFile;
    onObjectRemovalRequest?: (image: ImageFile) => void;
    isRemovingObject?: boolean;
}

const CROP_RATIOS = [
    { name: 'None', value: 0 },
    { name: '1:1', value: 1 / 1 },
    { name: '4:3', value: 4 / 3 },
    { name: '16:9', value: 16 / 9 },
];

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

export const ImageEditor = forwardRef<ImageEditorHandle, ImageEditorProps>(({ image, onObjectRemovalRequest, isRemovingObject }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const imageRef = useRef<fabric.Image | null>(null);

    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(0);
    const [saturate, setSaturate] = useState(0);
    const [sepia, setSepia] = useState(0);
    const [blur, setBlur] = useState(0);
    const [pixelate, setPixelate] = useState(1);
    const [cropRatio, setCropRatio] = useState(0);
    const [isErasing, setIsErasing] = useState(false);
    const [eraserSize, setEraserSize] = useState(30);

    const updateFilter = (filterName: string, value: any) => {
        if (imageRef.current) {
            const filterIndex = imageRef.current.filters?.findIndex(f => f.type.toLowerCase() === filterName.toLowerCase());
            if (filterIndex !== -1 && filterIndex !== undefined) {
                if (value === 0 || value === 1) {
                    imageRef.current.filters?.splice(filterIndex, 1);
                } else {
                    (imageRef.current.filters![filterIndex] as any)[filterName.toLowerCase()] = value;
                }
            } else {
                const filter = new (fabric.Image.filters as any)[filterName]({ [filterName.toLowerCase()]: value });
                imageRef.current.filters?.push(filter);
            }
            imageRef.current.applyFilters();
            fabricCanvasRef.current?.renderAll();
        }
    };

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            isDrawingMode: isErasing,
        });
        fabricCanvasRef.current = canvas;
        if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = eraserSize;
        }

        const resizeCanvas = () => {
            const container = canvas.getElement().parentElement;
            if (container && imageRef.current) {
                const { clientWidth, clientHeight } = container;
                const imageAspectRatio = imageRef.current.width! / imageRef.current.height!;
                const containerAspectRatio = clientWidth / clientHeight;

                let scale;
                if (imageAspectRatio > containerAspectRatio) {
                    scale = clientWidth / imageRef.current.width!;
                } else {
                    scale = clientHeight / imageRef.current.height!;
                }

                imageRef.current.scale(scale);
                canvas.setWidth(clientWidth);
                canvas.setHeight(clientHeight);
                canvas.centerObject(imageRef.current);
                canvas.renderAll();
            }
        };

        fabric.Image.fromURL(`data:${image.mimeType};base64,${image.base64}`, (img) => {
            imageRef.current = img;
            canvas.add(img);
            resizeCanvas();
        });

        const resizeObserver = new ResizeObserver(resizeCanvas);
        if (canvas.getElement().parentElement) {
            resizeObserver.observe(canvas.getElement().parentElement!);
        }

        return () => {
            resizeObserver.disconnect();
            canvas.dispose();
        };
    }, [image, isErasing, eraserSize]);

    useEffect(() => updateFilter('Brightness', brightness / 100), [brightness]);
    useEffect(() => updateFilter('Contrast', contrast / 100), [contrast]);
    useEffect(() => updateFilter('Saturation', saturate / 100), [saturate]);
    useEffect(() => updateFilter('Sepia', sepia > 0 ? new fabric.Image.filters.Sepia() : 0), [sepia]);
    useEffect(() => updateFilter('Blur', blur / 100), [blur]);
    useEffect(() => updateFilter('Pixelate', pixelate), [pixelate]);

    useEffect(() => {
        if (fabricCanvasRef.current && imageRef.current) {
            if (cropRatio > 0) {
                const canvas = fabricCanvasRef.current;
                const image = imageRef.current;
                const newWidth = canvas.height * cropRatio;
                image.scaleToWidth(newWidth);
                canvas.centerObject(image);
                canvas.renderAll();
            }
        }
    }, [cropRatio]);

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
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 mr-2">Crop:</span>
                    {CROP_RATIOS.map(cr => (
                        <button key={cr.name} onClick={() => setCropRatio(cr.value)}
                            className={`px-3 py-1 text-xs rounded-lg border ${cropRatio === cr.value ? 'bg-primary-accent text-white border-transparent' : 'bg-white text-gray-700 hover:bg-gray-200 border-gray-300'}`}>
                            {cr.name}
                        </button>
                    ))}
                </div>
                <div className="border-t border-gray-300 pt-3 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
                    <SliderControl label="Brightness" value={brightness} onChange={e => setBrightness(Number(e.target.value))} />
                    <SliderControl label="Contrast" value={contrast} onChange={e => setContrast(Number(e.target.value))} />
                    <SliderControl label="Saturation" value={saturate} onChange={e => setSaturate(Number(e.target.value))} />
                    <SliderControl label="Sepia" min={0} max={100} value={sepia} onChange={e => setSepia(Number(e.target.value))} />
                    <SliderControl label="Blur" min={0} max={100} value={blur} onChange={e => setBlur(Number(e.target.value))} />
                    <SliderControl label="Pixelate" min={1} max={100} value={pixelate} onChange={e => setPixelate(Number(e.target.value))} />
                </div>
                <div className="border-t border-gray-300 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">AI Object Remover</h4>
                        <Button onClick={() => setIsErasing(!isErasing)} variant={isErasing ? 'primary' : 'secondary'}>
                            <Icon name="trash" className="mr-2" />
                            {isErasing ? 'Stop Erasing' : 'Erase'}
                        </Button>
                    </div>
                    {isErasing && (
                        <div className="space-y-2 bg-purple-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600">Draw over objects to remove them.</p>
                            <SliderControl label="Brush Size" min={5} max={100} unit="px" value={eraserSize} onChange={e => setEraserSize(Number(e.target.value))} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
