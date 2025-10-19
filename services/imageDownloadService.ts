import { ImageFile } from '../types';

export const downloadImage = (image: ImageFile) => {
    const link = document.createElement('a');
    link.href = `data:${image.mimeType};base64,${image.base64}`;
    
    // Sanitize filename
    const sanitizedName = image.name.replace(/[^a-z0-9_.-]/gi, '_');
    link.download = sanitizedName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

export const downloadSelectedImages = (images: ImageFile[]) => {
    if (images.length === 0) {
        return;
    }
    
    images.forEach((image, index) => {
        // Stagger downloads slightly to prevent potential browser issues with multiple rapid downloads
        setTimeout(() => {
            downloadImage(image);
        }, index * 250);
    });
};