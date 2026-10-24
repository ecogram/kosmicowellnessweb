import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Maximize2, 
  Upload, 
  Sparkles, 
  X, 
  RotateCcw,
  Image as ImageIcon 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { normalizeImageUrl } from '../../utils/imageUrl';

interface ProductImageGalleryProps {
  productId?: string;
  slug?: string;
  productName?: string;
  initialImages?: string[];
  onActiveImageChange?: (url: string) => void;
}

const DEFAULT_FALLBACK_IMAGES = [
  '/assets/products/product-box.jpg',
  '/assets/products/product-front-back.jpg',
  '/assets/products/lifestyle-tea.jpg',
  '/assets/products/sweetmonk-lifestyle-drop.png'
];

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  productId,
  slug,
  productName = 'Sweet Monk Fruit Sweetener Drops',
  onActiveImageChange
}) => {
  const storageKey = `kosmico_gallery_${slug || productId || 'sweet-monk'}`;

  // Initialize images list with localStorage persistence + initial images fallback
  const [images, setImages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeImageUrl);
        }
      }
    } catch (_) {}
    return DEFAULT_FALLBACK_IMAGES;
  });

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const currentImage = images[activeIndex] || images[0] || '/assets/products/product-box.jpg';

  // Notify parent component if active image changes
  useEffect(() => {
    if (onActiveImageChange && currentImage) {
      onActiveImageChange(currentImage);
    }
  }, [currentImage, onActiveImageChange]);

  // Persist images state to localStorage
  const saveImagesState = (newImageList: string[]) => {
    setImages(newImageList);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newImageList));
    } catch (_) {}
  };

  // MANUAL SCROLL: Previous image
  const handlePrevImage = () => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => {
      const newIdx = (prev - 1 + images.length) % images.length;
      scrollToThumbnail(newIdx);
      return newIdx;
    });
  };

  // MANUAL SCROLL: Next image
  const handleNextImage = () => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => {
      const newIdx = (prev + 1) % images.length;
      scrollToThumbnail(newIdx);
      return newIdx;
    });
  };

  // Smoothly scroll thumbnail container when index changes
  const scrollToThumbnail = (idx: number) => {
    if (!thumbnailScrollRef.current) return;
    const container = thumbnailScrollRef.current;
    const thumbnailWidth = 84; // 72px item + 12px gap
    const scrollTarget = idx * thumbnailWidth - container.clientWidth / 2 + thumbnailWidth / 2;
    container.scrollTo({
      left: Math.max(0, scrollTarget),
      behavior: 'smooth'
    });
  };

  // Manual scroll buttons for thumbnail bar
  const handleScrollThumbnailsLeft = () => {
    if (thumbnailScrollRef.current) {
      thumbnailScrollRef.current.scrollBy({ left: -160, behavior: 'smooth' });
    }
  };

  const handleScrollThumbnailsRight = () => {
    if (thumbnailScrollRef.current) {
      thumbnailScrollRef.current.scrollBy({ left: 160, behavior: 'smooth' });
    }
  };

  // Upload multiple images handler (100% Frontend client-side processing)
  const handleFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileList.length === 0) {
      toast.error('Please select valid image files (JPG, PNG, WEBP, etc.)');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Adding ${fileList.length} image(s)...`);

    try {
      // 100% Frontend FileReader processing (Instant preview & persistent localStorage)
      const localPreviews = await Promise.all(
        fileList.map(file => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      // Merge newly added images with existing images
      const updatedList = [...images, ...localPreviews];
      saveImagesState(updatedList);
      setActiveIndex(updatedList.length - 1);
      setTimeout(() => scrollToThumbnail(updatedList.length - 1), 100);

      toast.success(`${fileList.length} image(s) added successfully!`, { id: toastId });

      // TODO: Connect backend API here when backend endpoint is provided by user
      // Example:
      // const formData = new FormData();
      // fileList.forEach(file => formData.append('images', file));
      // await api.post('/your-backend-api-endpoint', formData);
    } catch (err: any) {
      toast.error('Failed to load image(s). Please try again.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete an image from gallery
  const handleDeleteImage = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) {
      toast.error('Product must have at least one image');
      return;
    }

    const updated = images.filter((_, i) => i !== indexToDelete);
    saveImagesState(updated);

    if (activeIndex >= updated.length) {
      setActiveIndex(updated.length - 1);
    }

    toast.success('Image removed');
  };

  // Reset to default images
  const handleResetToDefault = () => {
    localStorage.removeItem(storageKey);
    setImages(DEFAULT_FALLBACK_IMAGES);
    setActiveIndex(0);
    toast.success('Gallery reset to original images');
  };

  // Drag & drop upload support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full select-none">
      {/* Hidden Multiple File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFilesUpload(e.target.files);
        }}
      />

      {/* Main Showcase Box */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative aspect-square w-full rounded-3xl bg-surface border transition-all duration-300 flex items-center justify-center overflow-hidden shadow-xs group ${
          isDraggingOver 
            ? 'border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-50/20' 
            : 'border-border hover:border-emerald-700/30'
        }`}
      >
        {/* Main Product Image with subtle zoom on hover */}
        <img
          src={currentImage}
          alt={productName}
          className="w-full h-full object-contain p-6 mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Counter Pill Badge */}
        <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-neutral-700 shadow-sm border border-neutral-200/80 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
          <span>{activeIndex + 1} / {images.length}</span>
        </div>

        {/* Top-Right Quick Action Tools (Zoom + Add Image) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            type="button"
            title="Upload More Images"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full bg-emerald-800 text-white hover:bg-emerald-900 shadow-md flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Full View"
            onClick={() => setIsZoomOpen(true)}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-neutral-700 hover:text-emerald-800 shadow-md border border-neutral-200/80 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* SIDE BUTTONS: Left & Right for Main Manual Image Scroll */}
        {/* ======================================================== */}
        {images.length > 1 && (
          <>
            {/* Left Side Button */}
            <button
              type="button"
              aria-label="Previous image"
              onClick={handlePrevImage}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-emerald-800 text-neutral-800 hover:text-white border border-neutral-200/90 shadow-lg backdrop-blur-md flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer group/btn"
            >
              <ChevronLeft className="w-6 h-6 -translate-x-0.5 group-hover/btn:text-white transition-colors" />
            </button>

            {/* Right Side Button */}
            <button
              type="button"
              aria-label="Next image"
              onClick={handleNextImage}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 hover:bg-emerald-800 text-neutral-800 hover:text-white border border-neutral-200/90 shadow-lg backdrop-blur-md flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 cursor-pointer group/btn"
            >
              <ChevronRight className="w-6 h-6 translate-x-0.5 group-hover/btn:text-white transition-colors" />
            </button>
          </>
        )}

        {/* Drag & Drop Overlay message */}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30 pointer-events-none animate-fadeIn">
            <Upload className="w-12 h-12 mb-2 animate-bounce" />
            <span className="font-bold text-base">Drop multiple images here to upload</span>
          </div>
        )}

        {/* Uploading progress indicator */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center z-30">
            <div className="w-10 h-10 border-3 border-emerald-200 border-t-emerald-800 rounded-full animate-spin mb-3"></div>
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Uploading images...</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* THUMBNAILS CAROUSEL WITH BOTH SIDE SCROLL BUTTONS       */}
      {/* ======================================================== */}
      <div className="mt-4 relative flex items-center gap-2">
        {/* Thumbnail Side Scroll Button (LEFT) */}
        {images.length > 3 && (
          <button
            type="button"
            aria-label="Scroll thumbnails left"
            onClick={handleScrollThumbnailsLeft}
            className="shrink-0 w-8 h-8 rounded-full bg-white hover:bg-emerald-800 text-neutral-700 hover:text-white border border-neutral-300 shadow-sm flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Thumbnails Container (Manual scroll only) */}
        <div
          ref={thumbnailScrollRef}
          className="flex-1 flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none scroll-smooth"
        >
          {images.map((img: string, idx: number) => {
            const isActive = activeIndex === idx;
            return (
              <div
                key={idx}
                className="relative shrink-0 group/thumb"
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    scrollToThumbnail(idx);
                  }}
                  className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 p-1.5 bg-surface overflow-hidden transition-all duration-200 cursor-pointer flex items-center justify-center ${
                    isActive
                      ? 'border-emerald-800 ring-2 ring-emerald-500/30 scale-102 shadow-sm'
                      : 'border-border hover:border-neutral-400 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </button>

                {/* Remove button for uploaded images (shows on hover) */}
                {images.length > 1 && (
                  <button
                    type="button"
                    title="Remove Image"
                    onClick={(e) => handleDeleteImage(idx, e)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-900/80 hover:bg-red-600 text-white flex items-center justify-center shadow-md opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Quick "+ Add" Thumbnail Tile */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload More Images"
            className="shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-emerald-400 hover:border-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50 transition-all flex flex-col items-center justify-center gap-1 text-emerald-800 cursor-pointer group/add active:scale-95"
          >
            <Plus className="w-5 h-5 group-hover/add:scale-110 transition-transform" />
            <span className="text-[10px] font-bold tracking-tight">Add Photo</span>
          </button>
        </div>

        {/* Thumbnail Side Scroll Button (RIGHT) */}
        {images.length > 3 && (
          <button
            type="button"
            aria-label="Scroll thumbnails right"
            onClick={handleScrollThumbnailsRight}
            className="shrink-0 w-8 h-8 rounded-full bg-white hover:bg-emerald-800 text-neutral-700 hover:text-white border border-neutral-300 shadow-sm flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Upload Action Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3 bg-stone-50 border border-stone-200/90 rounded-2xl">
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Manual gallery controls: click left/right buttons to scroll</span>
        </div>
        <div className="flex items-center gap-2">
          {images.length !== DEFAULT_FALLBACK_IMAGES.length && (
            <button
              type="button"
              onClick={handleResetToDefault}
              title="Reset to default images"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-neutral-600 text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>+ Upload Multiple Images</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox / Zoom Modal */}
      {isZoomOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox Side Buttons */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer z-50"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all cursor-pointer z-50"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh] p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImage}
              alt={productName}
              className="max-w-full max-h-[80vh] object-contain drop-shadow-2xl rounded-2xl"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-sm font-semibold">
            {activeIndex + 1} of {images.length}
          </div>
        </div>
      )}
    </div>
  );
};
