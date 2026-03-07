import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, GripVertical } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ImageDropzoneProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  error?: string | null;
}

const ImageDropzone = ({ images, onChange, maxImages = 5, error }: ImageDropzoneProps) => {
  const { language } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (dragIndex === null) setIsDragging(true);
  }, [dragIndex]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, remainingSlots);
    
    Promise.all(
      filesToProcess.map(file => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      }))
    ).then(results => {
      onChange([...images, ...results].slice(0, maxImages));
    });
  }, [images, maxImages, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (dragIndex !== null) return; // reorder drop handled separately
    processFiles(e.dataTransfer.files);
  }, [processFiles, dragIndex]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    e.target.value = '';
  }, [processFiles]);

  const removeImage = useCallback((index: number) => {
    onChange(images.filter((_, i) => i !== index));
  }, [images, onChange]);

  // Drag-to-reorder
  const handleItemDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, []);

  const handleItemDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleItemDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newImages = [...images];
    const [moved] = newImages.splice(dragIndex, 1);
    newImages.splice(targetIndex, 0, moved);
    onChange(newImages);
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex, images, onChange]);

  const handleItemDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        {language === 'en' ? `Photos (${images.length}/${maxImages})` : `Slike (${images.length}/${maxImages})`}
      </label>
      
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragging 
              ? "border-primary bg-primary/10" 
              : error
                ? "border-destructive hover:border-destructive/70"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Drag & drop images here or click to browse' 
                : 'Prevucite slike ovde ili kliknite za pretragu'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'en' 
                ? `Max ${maxImages} images. Drag thumbnails to reorder.` 
                : `Maks. ${maxImages} slika. Prevucite sličice za promenu redosleda.`}
            </p>
          </label>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, index) => (
            <div 
              key={index} 
              draggable
              onDragStart={(e) => handleItemDragStart(e, index)}
              onDragOver={(e) => handleItemDragOver(e, index)}
              onDrop={(e) => handleItemDrop(e, index)}
              onDragEnd={handleItemDragEnd}
              className={cn(
                "relative group aspect-square rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all",
                index === 0 ? "border-primary" : "border-border",
                dragIndex === index && "opacity-40 scale-95",
                dragOverIndex === index && dragIndex !== index && "border-primary ring-2 ring-primary/30"
              )}
            >
              <img 
                src={img} 
                alt={`Preview ${index + 1}`} 
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute top-1 left-1 flex items-center gap-0.5">
                <GripVertical className="w-3.5 h-3.5 text-white drop-shadow-md" />
                {index === 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                    {language === 'en' ? 'Main' : 'Glavna'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !error && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <ImageIcon className="w-4 h-4" />
          {language === 'en' ? 'No images added yet' : 'Još nema dodatih slika'}
        </div>
      )}

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
};

export default ImageDropzone;