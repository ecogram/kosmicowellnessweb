import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Image as ImageIcon 
} from 'lucide-react';
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
  '/assets/products/nutrition-facts-label.jpg'
];

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  productName = 'Sweet Monk Fruit Sweetener Drops',
  initialImages,
  onActiveImageChange
}) => {
  // Use images provided from product backend (fallback to default clean product photos)
  const images: string[] = (initialImages && initialImages.length > 0)
    ? initialImages.map(normalizeImageUrl)
    : DEFAULT_FALLBACK_IMAGES;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  // Safety clamp if images array changes
  useEffect(() => {
    if (activeIndex >= images.length) {
      setActiveIndex(0);
    }
  }, [images.length, activeIndex]);

  const currentImage = images[activeIndex] || images[0] || '/assets/products/product-box.jpg';

  // Notify parent component if active image changes
  useEffect(() => {
    if (onActiveImageChange && currentImage) {
      onActiveImageChange(currentImage);
    }
  }, [currentImage, onActiveImageChange]);

  // MANUAL SCROLL: Previous image (only scrolls when user clicks)
  const handlePrevImage = () => {
    if (images.length <= 1) return;
    setActiveIndex((prev) => {
      const newIdx = (prev - 1 + images.length) % images.length;
      scrollToThumbnail(newIdx);
      return newIdx;
    });
  };

  // MANUAL SCROLL: Next image (only scrolls when user clicks)
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

  return (
    <div className="w-full select-none">
      {/* Main Product Showcase Box */}
      <div className="relative aspect-square w-full rounded-3xl bg-surface border border-border hover:border-emerald-700/30 transition-all duration-300 flex items-center justify-center overflow-hidden shadow-xs group">
        {/* Main Product Image with subtle zoom on hover */}
        <img
          src={currentImage}
          alt={productName}
          className="w-full h-full object-contain p-6 mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Counter Pill Badge */}
        {images.length > 1 && (
          <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-neutral-700 shadow-sm border border-neutral-200/80 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>{activeIndex + 1} / {images.length}</span>
          </div>
        )}

        {/* Top-Right Fullscreen Zoom Tool */}
        <div className="absolute top-4 right-4 z-20">
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
        {/* SIDE BUTTONS: Left & Right for Manual Image Navigation    */}
        {/* (Only scrolls when user clicks these side buttons)       */}
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
      </div>

      {/* ======================================================== */}
      {/* THUMBNAILS CAROUSEL WITH BOTH SIDE SCROLL BUTTONS       */}
      {/* ======================================================== */}
      {images.length > 1 && (
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
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    scrollToThumbnail(idx);
                  }}
                  className={`shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 p-1.5 bg-surface overflow-hidden transition-all duration-200 cursor-pointer flex items-center justify-center ${
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
              );
            })}
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
      )}

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
