import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

export function CustomerGallery({ eventId }: { eventId?: string }) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        let url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/gallery/images`;
        if (eventId) {
          url += `?eventId=${eventId}`;
        }
        const res = await axios.get(url);
        // Only show approved images for customers
        setImages(res.data.filter((img: any) => img.status === 'Approved'));
      } catch (err) {
        console.error('Failed to fetch gallery images', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [eventId]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = 'auto';
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading gallery...</div>;
  }

  if (images.length === 0) {
    return (
      <div className="py-20 text-center bg-gray-50 rounded-2xl border border-gray-100">
        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-serif text-paa-navy">No photos yet</h3>
        <p className="text-gray-500 text-sm mt-2">Check back later for event photos.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div 
            key={img.id} 
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-gray-100 border border-paa-navy/5 shadow-sm"
            onClick={() => openLightbox(idx)}
          >
            <img 
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${img.url}`} 
              alt={img.caption || 'Event photo'} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-paa-navy/0 group-hover:bg-paa-navy/20 transition-colors duration-300"></div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
            onClick={closeLightbox}
          >
            <X size={32} />
          </button>
          
          <div className="relative max-w-5xl w-full h-full max-h-[85vh] flex items-center justify-center flex-col gap-4">
            <button 
              className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors"
              onClick={showPrev}
            >
              <ChevronLeft size={48} />
            </button>
            
            <img 
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${images[lightboxIndex].url}`}
              alt={images[lightboxIndex].caption || 'Event photo'}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {images[lightboxIndex].caption && (
              <p className="text-white/80 text-sm font-medium bg-black/50 px-6 py-2 rounded-full mt-4" onClick={(e) => e.stopPropagation()}>
                {images[lightboxIndex].caption}
              </p>
            )}

            <button 
              className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors"
              onClick={showNext}
            >
              <ChevronRight size={48} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
