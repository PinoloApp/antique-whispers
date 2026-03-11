/**
 * Compresses an image from a File or base64 string while preserving quality.
 * @param source - The image File or base64 string
 * @param maxWidth - Maximum width of the compressed image (default 1600)
 * @param maxHeight - Maximum height of the compressed image (default 1600)
 * @param quality - Compression quality (default 0.9 for high quality)
 * @returns - A promise resolving to the compressed base64 string
 */
export const compressImage = (
    source: File | string,
    maxWidth: number = 1600,
    maxHeight: number = 1600,
    quality: number = 0.9
): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Skip compression entirely if the file is already small enough (threshold: 750KB)
        // 750KB is safe because base64 encoding adds ~33% overhead, keeping us under 1MB.
        if (source instanceof File && source.size <= 750 * 1024) {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(source);
            return;
        }

        const img = new Image();

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Only downscale if larger than limits
            if (width > maxWidth || height > maxHeight) {
                if (width > height) {
                    height *= maxWidth / width;
                    width = maxWidth;
                } else {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            } else if (source instanceof File && source.size <= 750 * 1024) {
                // Secondary check for dimensions - if it's small and small resolution, just use original
                // (Already handled by the source instanceof File check above, but good for base64 source too)
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Use better image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Export as WebP with high quality (modern format, better quality/size ratio)
            // Fallback to JPEG if WebP is not supported (though most modern browsers support it)
            let compressedBase64 = canvas.toDataURL('image/webp', quality);

            // If WebP is not supported or results in weird data, fallback to JPEG
            if (!compressedBase64.startsWith('data:image/webp')) {
                compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            }

            resolve(compressedBase64);
        };

        img.onerror = () => reject(new Error('Failed to load image for compression'));

        if (typeof source === 'string') {
            img.src = source;
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(source);
        }
    });
};
