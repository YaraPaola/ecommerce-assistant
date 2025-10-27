import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { ImageFile } from '../types';
import { Icon } from './Icon';
import { Button } from './Button';

export interface ImageEditorHandle {
    getEditedImageData: () => { base64: string; mimeType: string; } | null;
}

interface ImageEditorProps {
    image: ImageFile;
    onColorChangeRequest: (color: string) => void;
    isChangingColor: boolean;
    onObjectRemovalRequest?: (eraserPath: {x: number, y: number}[]) => void;
    isRemovingObject?: boolean;
}

type FocusType = 'radial' | 'linear' | null;
interface FocusArea {
    type: FocusType;
    x: number; // center x (0-1)
    y: number; // center y (0-1)
    rx: number; // radius x (0-1)
    ry: number; // radius y (0-1)
    rotation: number; // in radians for linear
    feather: number; // feathering amount (0-1)
}

interface TextOverlay {
    text: string;
    x: number; // center x (0-1)
    y: number; // center y (0-1)
    size: number; // relative font size
    color: string;
    font: string;
    // Advanced styling
    strokeColor: string;
    strokeWidth: number;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    effect: 'none' | 'outline' | '3d' | 'glow' | 'shadow';
}

const CROP_RATIOS = [
    { name: 'None', value: null }, { name: '1:1', value: 1 / 1 }, { name: '4:3', value: 4 / 3 },
    { name: '16:9', value: 16 / 9 }, { name: '9:16', value: 9 / 16 },
];

const FONTS = [
    'Impact', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Courier New', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Palatino',
    'Garamond', 'Bookman', 'Avant Garde', 'Brush Script MT', 'Copperplate'
];

const TEXT_EFFECTS = [
    { id: 'none', name: 'None' },
    { id: 'outline', name: 'Outline' },
    { id: '3d', name: '3D Effect' },
    { id: 'glow', name: 'Glow' },
    { id: 'shadow', name: 'Drop Shadow' }
];

const ControlButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }> = ({ children, active, ...props }) => (
    <button className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${active ? 'bg-primary-accent text-white' : 'bg-violet-100 text-primary-accent hover:bg-violet-200'}`} {...props}>
        {children}
    </button>
);

const SliderControl: React.FC<{ label: string, value: number, min?: number, max?: number, step?: number, unit?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = 
({ label, value, min = 0, max = 200, step = 1, unit = '%', onChange }) => (
    <div className="flex-1">
        <label className="text-xs text-gray-500">{label}</label>
        <div className="flex items-center gap-2">
            <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full" />
            <span className="text-sm text-gray-700 w-12 text-right">{value}{unit}</span>
        </div>
    </div>
);

const applyFilters = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    filters: { brightness: number; contrast: number; saturate: number; sepia: number }
) => {
    const { brightness, contrast, saturate, sepia } = filters;
    if (brightness === 100 && contrast === 100 && saturate === 100 && sepia === 0) {
        return; // No filters to apply
    }

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const brightnessFactor = brightness / 100;
    const contrastFactor = (contrast / 100 - 1) * 128;
    const saturateFactor = saturate / 100;
    const sepiaFactor = sepia / 100;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness
        r *= brightnessFactor;
        g *= brightnessFactor;
        b *= brightnessFactor;

        // Contrast
        r += contrastFactor;
        g += contrastFactor;
        b += contrastFactor;

        // Saturation
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray * (1 - saturateFactor) + r * saturateFactor;
        g = gray * (1 - saturateFactor) + g * saturateFactor;
        b = gray * (1 - saturateFactor) + b * saturateFactor;

        // Sepia
        if (sepiaFactor > 0) {
            const sr = r * 0.393 + g * 0.769 + b * 0.189;
            const sg = r * 0.349 + g * 0.686 + b * 0.168;
            const sb = r * 0.272 + g * 0.534 + b * 0.131;
            r = r * (1 - sepiaFactor) + sr * sepiaFactor;
            g = g * (1 - sepiaFactor) + sg * sepiaFactor;
            b = b * (1 - sepiaFactor) + sb * sepiaFactor;
        }

        // Clamp values
        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
    }
    ctx.putImageData(imageData, 0, 0);
};


export const ImageEditor = forwardRef<ImageEditorHandle, ImageEditorProps>(({ image, onColorChangeRequest, isChangingColor, onObjectRemovalRequest, isRemovingObject }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());
    const offscreenCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
    
    // Global adjustments
    const [rotation, setRotation] = useState(0);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturate, setSaturate] = useState(100);
    const [sepia, setSepia] = useState(0);
    const [cropRatio, setCropRatio] = useState<number | null>(null);

    // Focus / Effect adjustments
    const [focusArea, setFocusArea] = useState<FocusArea | null>(null);
    const [blur, setBlur] = useState(0);
    const [pixelate, setPixelate] = useState(0);

    // Text Overlay
    const [textOverlay, setTextOverlay] = useState<TextOverlay | null>(null);

    // AI Object Remover
    const [isEraserMode, setIsEraserMode] = useState(false);
    const [eraserSize, setEraserSize] = useState(30);
    const [eraserPath, setEraserPath] = useState<{x: number, y: number}[]>([]);
    const [isErasing, setIsErasing] = useState(false);

    // Brush Tools (Pixelate, Blur, Color)
    type BrushMode = 'none' | 'pixelate' | 'blur' | 'color';
    const [brushMode, setBrushMode] = useState<BrushMode>('none');
    const [brushSize, setBrushSize] = useState(40);
    const [brushStrength, setBrushStrength] = useState(50); // 0-100
    const [brushColor, setBrushColor] = useState('#ff0000');
    const [brushStrokes, setBrushStrokes] = useState<{x: number, y: number}[]>([]);
    const [isBrushing, setIsBrushing] = useState(false);

    const [colorPrompt, setColorPrompt] = useState('');
    
    // Interaction states
    const [dragState, setDragState] = useState<{ type: 'move' | 'resize', startX: number, startY: number, originalFocus: FocusArea } | null>(null);
    const [isDraggingText, setIsDraggingText] = useState(false);
    const textDragStartOffset = useRef({x: 0, y: 0});
    const [isHoveringText, setIsHoveringText] = useState(false);

    const resetEdits = () => {
        setRotation(0);
        setBrightness(100);
        setContrast(100);
        setSaturate(100);
        setSepia(0);
        setCropRatio(null);
        setFocusArea(null);
        setBlur(0);
        setPixelate(0);
        setTextOverlay(null);
    };
    
    const toggleFocus = (type: FocusType) => {
        if (focusArea?.type === type) {
            setFocusArea(null); // Toggle off
        } else {
            setFocusArea({ type, x: 0.5, y: 0.5, rx: 0.25, ry: 0.25, rotation: 0, feather: 0.2 });
        }
    };

    const draw = useCallback(() => {
        const img = imageRef.current;
        if (!img.src) return;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
        if (cropRatio) {
            const originalRatio = img.width / img.height;
            if (originalRatio > cropRatio) {
                sHeight = img.height;
                sWidth = sHeight * cropRatio;
                sx = (img.width - sWidth) / 2;
            } else {
                sWidth = img.width;
                sHeight = sWidth / cropRatio;
                sy = (img.height - sHeight) / 2;
            }
        }
        
        const rotated = rotation === 90 || rotation === 270;
        const canvasContentWidth = rotated ? sHeight : sWidth;
        const canvasContentHeight = rotated ? sWidth : sHeight;
        
        const scale = Math.min(container.clientWidth / canvasContentWidth, container.clientHeight / canvasContentHeight);
        canvas.width = canvasContentWidth * scale;
        canvas.height = canvasContentHeight * scale;

        const drawImageWithTransforms = (targetCtx: CanvasRenderingContext2D, sourceImg: CanvasImageSource) => {
            targetCtx.save();
            targetCtx.clearRect(0, 0, targetCtx.canvas.width, targetCtx.canvas.height);
            targetCtx.translate(targetCtx.canvas.width / 2, targetCtx.canvas.height / 2);
            targetCtx.rotate(rotation * Math.PI / 180);
            targetCtx.drawImage(
                sourceImg,
                sx, sy, sWidth, sHeight,
                -canvasContentWidth * scale / 2, -canvasContentHeight * scale / 2, 
                canvasContentWidth * scale, canvasContentHeight * scale
            );
            targetCtx.restore();
        };
        
        drawImageWithTransforms(ctx, img);
        applyFilters(ctx, canvas.width, canvas.height, { brightness, contrast, saturate, sepia });

        if (focusArea && (blur > 0 || pixelate > 0)) {
            const offscreenCtx = offscreenCanvasRef.current.getContext('2d');
            if (!offscreenCtx) return;
            offscreenCanvasRef.current.width = canvas.width;
            offscreenCanvasRef.current.height = canvas.height;
            
            offscreenCtx.filter = `blur(${blur}px)`;
            if (pixelate > 0) {
                const tempPixelCanvas = document.createElement('canvas');
                const tempPixelCtx = tempPixelCanvas.getContext('2d');
                if(tempPixelCtx) {
                    const size = 1 - (pixelate / 100);
                    tempPixelCanvas.width = canvas.width * size;
                    tempPixelCanvas.height = canvas.height * size;
                    tempPixelCtx.drawImage(canvas, 0, 0, tempPixelCanvas.width, tempPixelCanvas.height);
                    
                    offscreenCtx.imageSmoothingEnabled = false;
                    offscreenCtx.drawImage(tempPixelCanvas, 0, 0, canvas.width, canvas.height);
                    offscreenCtx.imageSmoothingEnabled = true; // reset
                }
            } else {
                drawImageWithTransforms(offscreenCtx, img);
                applyFilters(offscreenCtx, canvas.width, canvas.height, { brightness, contrast, saturate, sepia });
            }
        
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            const maskCtx = maskCanvas.getContext('2d');
            if (!maskCtx) return;

            maskCtx.fillStyle = 'black';
            maskCtx.fillRect(0, 0, canvas.width, canvas.height);

            const centerX = focusArea.x * canvas.width;
            const centerY = focusArea.y * canvas.height;

            if (focusArea.type === 'radial') {
                const radiusX = focusArea.rx * canvas.width;
                const grad = maskCtx.createRadialGradient(centerX, centerY, radiusX * (1 - focusArea.feather), centerX, centerY, radiusX);
                grad.addColorStop(0, 'white');
                grad.addColorStop(1, 'black');
                maskCtx.fillStyle = grad;
                maskCtx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (focusArea.type === 'linear') {
                maskCtx.save();
                maskCtx.translate(centerX, centerY);
                maskCtx.rotate(focusArea.rotation);
                const gradWidth = focusArea.rx * canvas.width * 2;
                const grad = maskCtx.createLinearGradient(-gradWidth / 2, 0, gradWidth / 2, 0);
                grad.addColorStop(0, 'black');
                grad.addColorStop(focusArea.feather / 2, 'white');
                grad.addColorStop(1 - (focusArea.feather / 2), 'white');
                grad.addColorStop(1, 'black');
                maskCtx.fillStyle = grad;
                maskCtx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
                maskCtx.restore();
            }

            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(maskCanvas, 0, 0);
            ctx.globalCompositeOperation = 'destination-over';
            ctx.drawImage(offscreenCanvasRef.current, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
        }

        if (focusArea) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            const centerX = focusArea.x * canvas.width;
            const centerY = focusArea.y * canvas.height;
            if (focusArea.type === 'radial') {
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, focusArea.rx * canvas.width, focusArea.ry * canvas.height, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(centerX + focusArea.rx * canvas.width, centerY, 8, 0, 2*Math.PI);
                ctx.fill();
            } else if (focusArea.type === 'linear') {
                ctx.translate(centerX, centerY);
                ctx.rotate(focusArea.rotation);
                const innerWidth = focusArea.rx * canvas.width * 2 * (1 - focusArea.feather);
                const lineLength = Math.max(canvas.width, canvas.height) * 1.5;
                ctx.beginPath();
                ctx.moveTo(-innerWidth / 2, -lineLength / 2); ctx.lineTo(-innerWidth / 2, lineLength / 2);
                ctx.moveTo(innerWidth / 2, -lineLength / 2); ctx.lineTo(innerWidth / 2, lineLength / 2);
                ctx.stroke();
                
                // Draw resize handles
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                ctx.lineWidth = 1;
                ctx.setLineDash([]);
                
                ctx.beginPath();
                ctx.arc(innerWidth / 2, 0, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(-innerWidth / 2, 0, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }

        if (textOverlay) {
            const scaledSize = textOverlay.size * (canvas.width / 1000);
            const x = textOverlay.x * canvas.width;
            const y = textOverlay.y * canvas.height;
            
            ctx.font = `bold ${scaledSize}px ${textOverlay.font}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Apply text effects
            if (textOverlay.effect === 'outline') {
                ctx.strokeStyle = textOverlay.strokeColor;
                ctx.lineWidth = textOverlay.strokeWidth || 3;
                ctx.strokeText(textOverlay.text, x, y);
                ctx.fillStyle = textOverlay.color;
                ctx.fillText(textOverlay.text, x, y);
            } else if (textOverlay.effect === '3d') {
                // 3D effect - multiple layers
                const depth = textOverlay.strokeWidth || 5;
                ctx.fillStyle = textOverlay.strokeColor;
                for (let i = depth; i > 0; i--) {
                    ctx.fillText(textOverlay.text, x + i, y + i);
                }
                ctx.fillStyle = textOverlay.color;
                ctx.fillText(textOverlay.text, x, y);
            } else if (textOverlay.effect === 'glow') {
                ctx.shadowColor = textOverlay.color;
                ctx.shadowBlur = textOverlay.shadowBlur || 20;
                ctx.fillStyle = textOverlay.color;
                ctx.fillText(textOverlay.text, x, y);
                ctx.shadowBlur = 0;
            } else if (textOverlay.effect === 'shadow') {
                ctx.shadowColor = textOverlay.shadowColor;
                ctx.shadowBlur = textOverlay.shadowBlur;
                ctx.shadowOffsetX = textOverlay.shadowOffsetX;
                ctx.shadowOffsetY = textOverlay.shadowOffsetY;
                ctx.fillStyle = textOverlay.color;
                ctx.fillText(textOverlay.text, x, y);
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            } else {
                // No effect - simple text
                ctx.fillStyle = textOverlay.color;
                ctx.fillText(textOverlay.text, x, y);
            }
        }

        // Draw eraser path
        if (eraserPath.length > 0) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
            ctx.lineWidth = eraserSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(eraserPath[0].x * canvas.width, eraserPath[0].y * canvas.height);
            for (let i = 1; i < eraserPath.length; i++) {
                ctx.lineTo(eraserPath[i].x * canvas.width, eraserPath[i].y * canvas.height);
            }
            ctx.stroke();
            ctx.restore();
        }

        // Draw brush strokes preview
        if (brushStrokes.length > 0) {
            ctx.save();
            let strokeColor = 'rgba(0, 150, 255, 0.5)'; // Default blue
            if (brushMode === 'pixelate') strokeColor = 'rgba(255, 165, 0, 0.5)'; // Orange
            if (brushMode === 'blur') strokeColor = 'rgba(100, 200, 100, 0.5)'; // Green
            if (brushMode === 'color') strokeColor = brushColor.replace(')', ', 0.5)').replace('rgb', 'rgba'); // User color

            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(brushStrokes[0].x * canvas.width, brushStrokes[0].y * canvas.height);
            for (let i = 1; i < brushStrokes.length; i++) {
                ctx.lineTo(brushStrokes[i].x * canvas.width, brushStrokes[i].y * canvas.height);
            }
            ctx.stroke();
            ctx.restore();
        }
    }, [rotation, brightness, contrast, saturate, sepia, blur, pixelate, cropRatio, focusArea, textOverlay, eraserPath, eraserSize, brushStrokes, brushMode, brushSize, brushColor]);

    useEffect(() => {
        const img = imageRef.current;
        img.crossOrigin = "anonymous";
        img.src = `data:${image.mimeType};base64,${image.base64}`;
        img.onload = draw;
    }, [image, draw]);

    useEffect(resetEdits, [image.id]);

    useEffect(() => {
        const handleResize = () => draw();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [draw]);

    const getCanvasRelativeCoords = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / canvas.width,
            y: (e.clientY - rect.top) / canvas.height,
        };
    };

    const isClickOnText = useCallback((coords: {x:number, y:number}) => {
        if (!textOverlay || !canvasRef.current) return false;
        const ctx = canvasRef.current.getContext('2d');
        if(!ctx) return false;
        const scaledSize = textOverlay.size * (canvasRef.current.width / 1000);
        ctx.font = `bold ${scaledSize}px ${textOverlay.font}`;
        const metrics = ctx.measureText(textOverlay.text);
        const w = metrics.width / canvasRef.current.width;
        const h = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) / canvasRef.current.height;
        return coords.x >= textOverlay.x - w/2 && coords.x <= textOverlay.x + w/2 &&
               coords.y >= textOverlay.y - h/2 && coords.y <= textOverlay.y + h/2;
    }, [textOverlay]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const coords = getCanvasRelativeCoords(e);
        if (!coords) return;

        // Handle eraser mode
        if (isEraserMode) {
            setIsErasing(true);
            setEraserPath([coords]);
            return;
        }

        // Handle brush modes
        if (brushMode !== 'none') {
            setIsBrushing(true);
            setBrushStrokes([coords]);
            return;
        }
        
        if (textOverlay && isClickOnText(coords)) {
            setIsDraggingText(true);
            textDragStartOffset.current = { x: coords.x - textOverlay.x, y: coords.y - textOverlay.y };
            return;
        }
        
        if (!focusArea) return;

        if (focusArea.type === 'radial') {
            const dist = Math.sqrt(Math.pow(coords.x - focusArea.x, 2) + Math.pow(coords.y - focusArea.y, 2));
            const handleRadius = 8 / (canvasRef.current?.width || 1);
            if (Math.abs(dist - focusArea.rx) < handleRadius) {
                 setDragState({ type: 'resize', startX: coords.x, startY: coords.y, originalFocus: focusArea });
            } else if (dist < focusArea.rx) {
                 setDragState({ type: 'move', startX: coords.x, startY: coords.y, originalFocus: focusArea });
            }
        } else if (focusArea.type === 'linear') {
            const translatedX = coords.x - focusArea.x;
            const translatedY = coords.y - focusArea.y;
            const rotatedX = translatedX * Math.cos(-focusArea.rotation) - translatedY * Math.sin(-focusArea.rotation);
            
            const canvasWidth = canvasRef.current?.width || 1;
            const handleWidth = 8 / canvasWidth;
            const innerHalfWidth = focusArea.rx * (1 - focusArea.feather);

            if (Math.abs(Math.abs(rotatedX) - innerHalfWidth) < handleWidth) {
                setDragState({ type: 'resize', startX: coords.x, startY: coords.y, originalFocus: focusArea });
            } else if (Math.abs(rotatedX) < innerHalfWidth) {
                setDragState({ type: 'move', startX: coords.x, startY: coords.y, originalFocus: focusArea });
            }
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const coords = getCanvasRelativeCoords(e);
        if (!coords) return;

        // Handle eraser drawing
        if (isErasing && isEraserMode) {
            setEraserPath(prev => [...prev, coords]);
            return;
        }

        // Handle brush drawing
        if (isBrushing && brushMode !== 'none') {
            setBrushStrokes(prev => [...prev, coords]);
            return;
        }

        if (isDraggingText && textOverlay) {
            setTextOverlay({ ...textOverlay, x: coords.x - textDragStartOffset.current.x, y: coords.y - textDragStartOffset.current.y });
            return;
        }
        
        if (dragState && focusArea) {
            const dx = coords.x - dragState.startX;
            const dy = coords.y - dragState.startY;
            if (dragState.type === 'move') {
                setFocusArea({ ...focusArea, x: dragState.originalFocus.x + dx, y: dragState.originalFocus.y + dy });
            } else if (dragState.type === 'resize') {
                if (focusArea.type === 'radial') {
                    const newDist = Math.sqrt(Math.pow(coords.x - dragState.originalFocus.x, 2) + Math.pow(coords.y - dragState.originalFocus.y, 2));
                    setFocusArea({ ...focusArea, rx: Math.max(0.01, newDist), ry: Math.max(0.01, newDist) });
                } else if (focusArea.type === 'linear' && focusArea.feather < 1) { // Prevent division by zero
                    const translatedX = coords.x - focusArea.x;
                    const translatedY = coords.y - focusArea.y;
                    const rotatedX = translatedX * Math.cos(-focusArea.rotation) - translatedY * Math.sin(-focusArea.rotation);
                    const newInnerHalfWidth = Math.abs(rotatedX);
                    const newRx = newInnerHalfWidth / (1 - focusArea.feather);
                    setFocusArea({ ...focusArea, rx: Math.max(0.01, newRx) });
                }
            }
        } else {
            setIsHoveringText(isClickOnText(coords));
        }
    };

    const handleMouseUp = () => {
        // Apply brush effect when finishing a stroke
        if (isBrushing && brushStrokes.length > 0 && brushMode !== 'none') {
            applyBrushEffect();
        }
        setIsErasing(false);
        setIsBrushing(false);
        setDragState(null);
        setIsDraggingText(false);
        setIsHoveringText(false);
    };

    // Apply brush effects (pixelate, blur, color) to the offscreen canvas
    const applyBrushEffect = useCallback(() => {
        if (brushStrokes.length === 0 || brushMode === 'none') return;

        const offscreenCanvas = offscreenCanvasRef.current;
        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) return;

        const img = imageRef.current;

        // Get image data from affected areas
        brushStrokes.forEach((point) => {
            const x = point.x * img.width;
            const y = point.y * img.height;
            const radius = brushSize * (brushStrength / 100);

            if (brushMode === 'pixelate') {
                // Apply pixelation effect
                const pixelSize = Math.max(2, Math.floor(radius / 10));
                const startX = Math.max(0, Math.floor(x - radius));
                const startY = Math.max(0, Math.floor(y - radius));
                const endX = Math.min(img.width, Math.ceil(x + radius));
                const endY = Math.min(img.height, Math.ceil(y + radius));

                for (let py = startY; py < endY; py += pixelSize) {
                    for (let px = startX; px < endX; px += pixelSize) {
                        const dist = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2));
                        if (dist <= radius) {
                            const imageData = ctx.getImageData(px, py, 1, 1);
                            ctx.fillStyle = `rgba(${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]}, ${imageData.data[3] / 255})`;
                            ctx.fillRect(px, py, pixelSize, pixelSize);
                        }
                    }
                }
            } else if (brushMode === 'blur') {
                // Apply blur effect
                const blurRadius = Math.max(1, Math.floor(radius / 10));
                const startX = Math.max(0, Math.floor(x - radius));
                const startY = Math.max(0, Math.floor(y - radius));
                const endX = Math.min(img.width, Math.ceil(x + radius));
                const endY = Math.min(img.height, Math.ceil(y + radius));

                const imageData = ctx.getImageData(startX, startY, endX - startX, endY - startY);
                const pixels = imageData.data;
                const width = endX - startX;
                const height = endY - startY;

                for (let py = 0; py < height; py++) {
                    for (let px = 0; px < width; px++) {
                        const dist = Math.sqrt(Math.pow((startX + px) - x, 2) + Math.pow((startY + py) - y, 2));
                        if (dist <= radius) {
                            let r = 0, g = 0, b = 0, count = 0;

                            for (let ky = -blurRadius; ky <= blurRadius; ky++) {
                                for (let kx = -blurRadius; kx <= blurRadius; kx++) {
                                    const nx = px + kx;
                                    const ny = py + ky;
                                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                        const idx = (ny * width + nx) * 4;
                                        r += pixels[idx];
                                        g += pixels[idx + 1];
                                        b += pixels[idx + 2];
                                        count++;
                                    }
                                }
                            }

                            const idx = (py * width + px) * 4;
                            pixels[idx] = r / count;
                            pixels[idx + 1] = g / count;
                            pixels[idx + 2] = b / count;
                        }
                    }
                }

                ctx.putImageData(imageData, startX, startY);
            } else if (brushMode === 'color') {
                // Apply color tint effect
                const hex = brushColor.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                const alpha = brushStrength / 100;

                ctx.save();
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });

        setBrushStrokes([]);
        draw(); // Redraw canvas with updated image
    }, [brushStrokes, brushMode, brushSize, brushStrength, brushColor, draw]);

    useImperativeHandle(ref, () => ({
        getEditedImageData: () => {
            const img = imageRef.current;
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');
            if (!finalCtx) return null;

            let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
            if (cropRatio) {
                 const originalRatio = img.width / img.height;
                 if (originalRatio > cropRatio) {
                     sHeight = img.height; sWidth = sHeight * cropRatio; sx = (img.width - sWidth) / 2;
                 } else {
                     sWidth = img.width; sHeight = sWidth / cropRatio; sy = (img.height - sHeight) / 2;
                 }
            }
            
            const rotated = rotation === 90 || rotation === 270;
            finalCanvas.width = rotated ? sHeight : sWidth;
            finalCanvas.height = rotated ? sWidth : sHeight;

            const tempDraw = (source: CanvasImageSource, targetW: number, targetH: number) => {
                finalCtx.save();
                finalCtx.translate(targetW / 2, targetH / 2);
                finalCtx.rotate(rotation * Math.PI / 180);
                finalCtx.drawImage(source, sx, sy, sWidth, sHeight, -sWidth / 2, -sHeight / 2, sWidth, sHeight);
                finalCtx.restore();
            }

            tempDraw(img, finalCanvas.width, finalCanvas.height);
            applyFilters(finalCtx, finalCanvas.width, finalCanvas.height, { brightness, contrast, saturate, sepia });

            if (focusArea && (blur > 0 || pixelate > 0)) {
                const mainCanvas = canvasRef.current;
                if (mainCanvas) {
                    const scaleFactor = sWidth / mainCanvas.width;
                    finalCanvas.width = sWidth;
                    finalCanvas.height = sHeight;
                    // Redraw at high resolution
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    if (tempCtx) {
                        tempCanvas.width = sWidth; tempCanvas.height = sHeight;
                        tempDraw(img, tempCanvas.width, tempCanvas.height);
                        applyFilters(tempCtx, tempCanvas.width, tempCanvas.height, { brightness, contrast, saturate, sepia });

                        const offscreen = document.createElement('canvas');
                        const offscreenCtx = offscreen.getContext('2d');
                        if (offscreenCtx) {
                            offscreen.width = sWidth; offscreen.height = sHeight;
                            offscreenCtx.filter = `blur(${blur * scaleFactor}px)`;
                            tempDraw(img, offscreen.width, offscreen.height);
                            applyFilters(offscreenCtx, offscreen.width, offscreen.height, { brightness, contrast, saturate, sepia });
                            
                            const mask = document.createElement('canvas');
                            const maskCtx = mask.getContext('2d');
                            if (maskCtx) {
                                mask.width = sWidth; mask.height = sHeight;
                                maskCtx.fillStyle = 'black'; maskCtx.fillRect(0,0,mask.width,mask.height);
                                const cx = focusArea.x*mask.width, cy = focusArea.y*mask.height;
                                if (focusArea.type === 'radial') {
                                    const radX = focusArea.rx * mask.width;
                                    const grad = maskCtx.createRadialGradient(cx, cy, radX * (1 - focusArea.feather), cx, cy, radX);
                                    grad.addColorStop(0, 'white'); grad.addColorStop(1, 'black');
                                    maskCtx.fillStyle = grad; maskCtx.fillRect(0,0,mask.width,mask.height);
                                } else if (focusArea.type === 'linear') {
                                     maskCtx.save();
                                     maskCtx.translate(cx, cy); maskCtx.rotate(focusArea.rotation);
                                     const gradW = focusArea.rx * mask.width * 2;
                                     const grad = maskCtx.createLinearGradient(-gradW / 2, 0, gradW / 2, 0);
                                     grad.addColorStop(0, 'black'); grad.addColorStop(focusArea.feather / 2, 'white');
                                     grad.addColorStop(1 - (focusArea.feather / 2), 'white'); grad.addColorStop(1, 'black');
                                     maskCtx.fillStyle = grad; maskCtx.fillRect(-mask.width, -mask.height, mask.width * 2, mask.height * 2);
                                     maskCtx.restore();
                                }
                                tempCtx.globalCompositeOperation = 'destination-in'; tempCtx.drawImage(mask, 0, 0);
                                tempCtx.globalCompositeOperation = 'destination-over'; tempCtx.drawImage(offscreen, 0, 0);
                            }
                        }
                        finalCtx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
                        finalCtx.drawImage(tempCanvas, 0, 0);
                    }
                }
            }
            if (textOverlay) {
                const scaledSize = textOverlay.size * (finalCanvas.width / 1000);
                const x = textOverlay.x * finalCanvas.width;
                const y = textOverlay.y * finalCanvas.height;
                
                finalCtx.font = `bold ${scaledSize}px ${textOverlay.font}`;
                finalCtx.textAlign = 'center';
                finalCtx.textBaseline = 'middle';
                
                // Apply same text effects as preview
                if (textOverlay.effect === 'outline') {
                    finalCtx.strokeStyle = textOverlay.strokeColor;
                    finalCtx.lineWidth = textOverlay.strokeWidth || 3;
                    finalCtx.strokeText(textOverlay.text, x, y);
                    finalCtx.fillStyle = textOverlay.color;
                    finalCtx.fillText(textOverlay.text, x, y);
                } else if (textOverlay.effect === '3d') {
                    const depth = textOverlay.strokeWidth || 5;
                    finalCtx.fillStyle = textOverlay.strokeColor;
                    for (let i = depth; i > 0; i--) {
                        finalCtx.fillText(textOverlay.text, x + i, y + i);
                    }
                    finalCtx.fillStyle = textOverlay.color;
                    finalCtx.fillText(textOverlay.text, x, y);
                } else if (textOverlay.effect === 'glow') {
                    finalCtx.shadowColor = textOverlay.color;
                    finalCtx.shadowBlur = textOverlay.shadowBlur || 20;
                    finalCtx.fillStyle = textOverlay.color;
                    finalCtx.fillText(textOverlay.text, x, y);
                    finalCtx.shadowBlur = 0;
                } else if (textOverlay.effect === 'shadow') {
                    finalCtx.shadowColor = textOverlay.shadowColor;
                    finalCtx.shadowBlur = textOverlay.shadowBlur;
                    finalCtx.shadowOffsetX = textOverlay.shadowOffsetX;
                    finalCtx.shadowOffsetY = textOverlay.shadowOffsetY;
                    finalCtx.fillStyle = textOverlay.color;
                    finalCtx.fillText(textOverlay.text, x, y);
                    finalCtx.shadowColor = 'transparent';
                    finalCtx.shadowBlur = 0;
                    finalCtx.shadowOffsetX = 0;
                    finalCtx.shadowOffsetY = 0;
                } else {
                    finalCtx.fillStyle = textOverlay.color;
                    finalCtx.fillText(textOverlay.text, x, y);
                }
            }

            return {
                base64: finalCanvas.toDataURL(image.mimeType).split(',')[1],
                mimeType: image.mimeType,
            };
        }
    }));
    
    useEffect(draw, [draw]);

    const cursorStyle = (isEraserMode || brushMode !== 'none') ? 'crosshair' : (isDraggingText || dragState ? 'grabbing' : (isHoveringText ? 'move' : 'grab'));

    return (
        <div className="w-full h-full flex flex-col gap-2">
            <div ref={containerRef} className="flex-grow flex items-center justify-center bg-gray-200 rounded-lg overflow-hidden min-h-0 relative"
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} style={{ cursor: cursorStyle }}>
                <canvas ref={canvasRef} />
            </div>
            <div className="flex-shrink-0 bg-gray-100 p-2 rounded-b-lg space-y-2 overflow-y-auto max-h-64">
                 <div className="flex items-end gap-2">
                    <div className="flex-grow">
                        <label htmlFor="color-prompt" className="text-sm font-medium text-gray-700">AI Color Change</label>
                         <input type="text" id="color-prompt" value={colorPrompt}
                            onChange={(e) => setColorPrompt(e.target.value)}
                            placeholder="e.g., 'royal blue' or 'cherry red'"
                            className="mt-1 block w-full rounded-lg border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-primary-accent focus:border-primary-accent sm:text-sm px-3 py-2"
                        />
                    </div>
                    <Button onClick={() => onColorChangeRequest(colorPrompt)} disabled={isChangingColor || !colorPrompt} variant="secondary" className="h-[42px]">
                        {isChangingColor ? <Icon name="spinner" className="animate-spin" /> : 'Apply'}
                    </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 mr-2">Crop:</span>
                    {CROP_RATIOS.map(cr => (
                        <button key={cr.name} onClick={() => setCropRatio(cr.value)}
                            className={`px-3 py-1 text-xs rounded-lg border ${cropRatio === cr.value ? 'bg-primary-accent text-white border-transparent' : 'bg-white text-gray-700 hover:bg-gray-200 border-gray-300'}`}>
                            {cr.name}
                        </button>
                    ))}
                    <span className="text-sm font-medium text-gray-700 ml-auto mr-2">Actions:</span>
                    <ControlButton onClick={() => setRotation(r => (r - 90 + 360) % 360)} title="Rotate Left"><Icon name="rotate-left" /></ControlButton>
                    <ControlButton onClick={() => setRotation(r => (r + 90) % 360)} title="Rotate Right"><Icon name="rotate-right" /></ControlButton>
                    <ControlButton onClick={resetEdits} title="Reset Edits"><Icon name="refresh" /></ControlButton>
                </div>
                <div className="border-t border-gray-300 pt-3 space-y-2">
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 mr-2">Focus Tools:</span>
                        <ControlButton onClick={() => toggleFocus('radial')} active={focusArea?.type === 'radial'} title="Radial Focus"><Icon name="sparkles"/></ControlButton>
                        <ControlButton onClick={() => toggleFocus('linear')} active={focusArea?.type === 'linear'} title="Linear Focus"><Icon name="linear-focus"/></ControlButton>
                    </div>
                    {focusArea && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                           <SliderControl label="Blur" max={30} unit="px" value={blur} onChange={e => setBlur(Number(e.target.value))} />
                           <SliderControl label="Pixelate" max={95} value={pixelate} onChange={e => setPixelate(Number(e.target.value))} />
                           <SliderControl label="Feather" min={1} max={100} unit="%" value={focusArea.feather * 100} onChange={e => setFocusArea({...focusArea, feather: Number(e.target.value)/100})} />
                           {focusArea.type === 'linear' && (
                                <>
                                <SliderControl label="Width" min={1} max={100} unit="%" value={focusArea.rx * 200} onChange={e => setFocusArea({...focusArea, rx: Number(e.target.value)/200})} />
                                <SliderControl label="Rotation" min={-180} max={180} unit="°" value={Math.round(focusArea.rotation * 180 / Math.PI)} onChange={e => setFocusArea({...focusArea, rotation: Number(e.target.value) * Math.PI / 180})} />
                                </>
                           )}
                        </div>
                    )}
                </div>
                 <div className="border-t border-gray-300 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">✨ Text Overlay (Canva-Style)</h4>
                        {textOverlay ? (
                            <Button onClick={() => setTextOverlay(null)} variant="secondary" className="px-2 py-1 text-xs bg-red-100 text-red-700 border-red-100 hover:bg-red-200">Remove</Button>
                        ) : (
                            <Button onClick={() => setTextOverlay({ 
                                text: 'Your Text Here', x: 0.5, y: 0.5, size: 50, color: '#FFFFFF', font: 'Impact',
                                strokeColor: '#000000', strokeWidth: 0, shadowColor: 'rgba(0,0,0,0.7)',
                                shadowBlur: 5, shadowOffsetX: 2, shadowOffsetY: 2, effect: 'none'
                            })} variant="secondary" className="px-2 py-1 text-xs">Add Text</Button>
                        )}
                    </div>
                    {textOverlay && (
                        <div className="space-y-3">
                            <input type="text" value={textOverlay.text} onChange={e => setTextOverlay({ ...textOverlay, text: e.target.value })} 
                                className="block w-full rounded-lg border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-primary-accent focus:border-primary-accent sm:text-sm px-3 py-2"
                                placeholder="Enter your text..."/>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-600">Font Family</label>
                                    <select value={textOverlay.font} onChange={e => setTextOverlay({ ...textOverlay, font: e.target.value })}
                                        className="mt-1 block w-full rounded-lg border-gray-300 bg-white text-sm shadow-sm focus:ring-primary-accent focus:border-primary-accent">
                                        {FONTS.map(font => (
                                            <option key={font} value={font} style={{fontFamily: font}}>{font}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">Text Effect</label>
                                    <select value={textOverlay.effect} onChange={e => setTextOverlay({ ...textOverlay, effect: e.target.value as any })}
                                        className="mt-1 block w-full rounded-lg border-gray-300 bg-white text-sm shadow-sm focus:ring-primary-accent focus:border-primary-accent">
                                        {TEXT_EFFECTS.map(effect => (
                                            <option key={effect.id} value={effect.id}>{effect.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-600">Text Color:</label>
                                    <input type="color" value={textOverlay.color} onChange={e => setTextOverlay({ ...textOverlay, color: e.target.value })} 
                                        className="w-10 h-8 p-1 bg-white border border-gray-300 rounded-lg cursor-pointer"/>
                                </div>
                                {(textOverlay.effect === 'outline' || textOverlay.effect === '3d') && (
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-600">Stroke Color:</label>
                                        <input type="color" value={textOverlay.strokeColor} onChange={e => setTextOverlay({ ...textOverlay, strokeColor: e.target.value })} 
                                            className="w-10 h-8 p-1 bg-white border border-gray-300 rounded-lg cursor-pointer"/>
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <SliderControl label="Size" min={10} max={150} unit="pt" value={textOverlay.size} onChange={e => setTextOverlay({ ...textOverlay, size: Number(e.target.value) })} />
                                {(textOverlay.effect === 'outline' || textOverlay.effect === '3d') && (
                                    <SliderControl label="Stroke Width" min={0} max={10} unit="px" value={textOverlay.strokeWidth} onChange={e => setTextOverlay({ ...textOverlay, strokeWidth: Number(e.target.value) })} />
                                )}
                                {(textOverlay.effect === 'shadow' || textOverlay.effect === 'glow') && (
                                    <SliderControl label="Shadow Blur" min={0} max={30} unit="px" value={textOverlay.shadowBlur} onChange={e => setTextOverlay({ ...textOverlay, shadowBlur: Number(e.target.value) })} />
                                )}
                            </div>
                            <p className="text-xs text-gray-500 italic">💡 Drag text to reposition it on the canvas</p>
                        </div>
                    )}
                </div>
                
                <div className="border-t border-gray-300 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">🎨 AI Object Remover</h4>
                        <ControlButton onClick={() => { setBrushMode('none'); setIsEraserMode(!isEraserMode); }} active={isEraserMode} title="Toggle Eraser Mode">
                            <Icon name={isEraserMode ? 'check' : 'trash'} />
                        </ControlButton>
                    </div>
                    {isEraserMode && (
                        <div className="space-y-2 bg-purple-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600">Draw over objects or text you want to remove. The AI will intelligently fill the area.</p>
                            <SliderControl label="Brush Size" min={5} max={100} unit="px" value={eraserSize} onChange={e => setEraserSize(Number(e.target.value))} />
                            {eraserPath.length > 0 && (
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => {
                                            if (onObjectRemovalRequest && eraserPath.length > 0) {
                                                onObjectRemovalRequest(eraserPath);
                                                setEraserPath([]);
                                                setIsEraserMode(false);
                                            }
                                        }}
                                        disabled={isRemovingObject}
                                        variant="primary"
                                        className="flex-1"
                                    >
                                        {isRemovingObject ? (
                                            <>
                                                <Icon name="spinner" className="animate-spin mr-1" /> Removing...
                                            </>
                                        ) : (
                                            <>
                                                <Icon name="sparkles" className="mr-1" /> Remove Selected
                                            </>
                                        )}
                                    </Button>
                                    <Button onClick={() => setEraserPath([])} variant="secondary" className="flex-1">
                                        Clear Selection
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-300 pt-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">🖌️ Brush Tools</h4>
                        <div className="flex gap-1">
                            <ControlButton
                                onClick={() => { setIsEraserMode(false); setBrushMode('pixelate'); }}
                                active={brushMode === 'pixelate'}
                                title="Pixelate Brush"
                            >
                                <span className="text-xs">Pixelate</span>
                            </ControlButton>
                            <ControlButton
                                onClick={() => { setIsEraserMode(false); setBrushMode('blur'); }}
                                active={brushMode === 'blur'}
                                title="Blur Brush"
                            >
                                <span className="text-xs">Blur</span>
                            </ControlButton>
                            <ControlButton
                                onClick={() => { setIsEraserMode(false); setBrushMode('color'); }}
                                active={brushMode === 'color'}
                                title="Color Brush"
                            >
                                <span className="text-xs">Color</span>
                            </ControlButton>
                        </div>
                    </div>
                    {brushMode !== 'none' && (
                        <div className="space-y-2 bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-600">
                                {brushMode === 'pixelate' && 'Paint areas to pixelate them.'}
                                {brushMode === 'blur' && 'Paint areas to blur them.'}
                                {brushMode === 'color' && 'Paint areas to tint them with color.'}
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <SliderControl label="Brush Size" min={10} max={100} unit="px" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} />
                                <SliderControl label="Strength" min={10} max={100} unit="%" value={brushStrength} onChange={e => setBrushStrength(Number(e.target.value))} />
                            </div>
                            {brushMode === 'color' && (
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-600">Brush Color:</label>
                                    <input
                                        type="color"
                                        value={brushColor}
                                        onChange={e => setBrushColor(e.target.value)}
                                        className="w-12 h-10 p-1 bg-white border border-gray-300 rounded-lg cursor-pointer"
                                    />
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        setBrushMode('none');
                                        setBrushStrokes([]);
                                    }}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-300 pt-3 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
                    <SliderControl label="Brightness" value={brightness} onChange={e => setBrightness(Number(e.target.value))} />
                    <SliderControl label="Contrast" value={contrast} onChange={e => setContrast(Number(e.target.value))} />
                    <SliderControl label="Saturation" value={saturate} onChange={e => setSaturate(Number(e.target.value))} />
                    <SliderControl label="Sepia" max={100} value={sepia} onChange={e => setSepia(Number(e.target.value))} />
                </div>
            </div>
        </div>
    );
});
