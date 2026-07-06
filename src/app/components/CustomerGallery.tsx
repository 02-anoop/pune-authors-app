import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ChevronLeft, ChevronRight, ImageIcon, Upload } from 'lucide-react';

export function CustomerGallery({ eventId, hideUpload }: { eventId?: string; hideUpload?: boolean }) {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !eventId) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('photo', uploadFile);
      formData.append('caption', uploadCaption);
      formData.append('uploaderName', uploaderName);

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/gallery/${eventId}/images`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert('Image uploaded successfully! It will appear in the gallery after admin approval.');
        setUploadModalOpen(false);
        setUploadFile(null);
        setUploadCaption('');
        setUploaderName('');
      } else {
        alert('Failed to upload image.');
      }
    } catch (err) {
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

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

  return (
    <div>
      <div className="flex justify-end mb-6">
        {eventId && !hideUpload && (
          <button onClick={() => setUploadModalOpen(true)} className="dash-btn dash-btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <Upload className="w-4 h-4" /> Upload Your Photos
          </button>
        )}
      </div>

      {images.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-2xl border border-gray-100 mb-8">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-serif text-paa-navy">No photos yet</h3>
          <p className="text-gray-500 text-sm mt-2">Be the first to upload photos from this event!</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((img, idx) => (
            <div 
              key={img.id} 
              className="relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer group bg-gray-100 border border-paa-navy/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
              onClick={() => openLightbox(idx)}
            >
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${img.url}`} 
                alt={img.caption || 'Event photo'} 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                {img.caption && (
                  <p className="text-white text-sm font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-500 drop-shadow-md">{img.caption}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setUploadModalOpen(false)}>
          <div className="bg-white rounded-3xl-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-paa-navy">Upload Event Photos</h3>
              <button onClick={() => setUploadModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-paa-navy mb-1">Select Photo</label>
                <input type="file" accept="image/*" required onChange={e => setUploadFile(e.target.files?.[0] || null)} className="w-full p-2 border border-gray-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-paa-navy mb-1">Your Name (Optional)</label>
                <input type="text" value={uploaderName} onChange={e => setUploaderName(e.target.value)} placeholder="E.g. John Doe" className="w-full p-3 border border-gray-300 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-bold text-paa-navy mb-1">Caption (Optional)</label>
                <input type="text" value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} placeholder="Add a caption..." className="w-full p-3 border border-gray-300 rounded-xl" />
              </div>
              <button type="submit" disabled={!uploadFile || isUploading} className="w-full dash-btn dash-btn-primary justify-center py-3 mt-4">
                {isUploading ? 'Uploading...' : 'Upload Photo'}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">Your photo will be visible in the gallery after admin approval.</p>
            </form>
          </div>
        </div>
      )}

      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-full"
            onClick={closeLightbox}
          >
            <X size={32} />
          </button>
          
          <div className="relative max-w-6xl w-full h-full max-h-[90vh] flex items-center justify-center flex-col gap-6">
            <button 
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 rounded-full p-4 transition-all hover:scale-110"
              onClick={showPrev}
            >
              <ChevronLeft size={48} />
            </button>
            
            <img 
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${images[lightboxIndex].url}`}
              alt={images[lightboxIndex].caption || 'Event photo'}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
            
            {images[lightboxIndex].caption && (
              <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center bg-gradient-to-t from-black/80 to-transparent animate-in slide-in-from-bottom-4 duration-500 pointer-events-none">
                <p className="text-white/90 text-lg font-medium bg-black/40 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                  {images[lightboxIndex].caption}
                </p>
              </div>
            )}

            <button 
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10 rounded-full p-4 transition-all hover:scale-110"
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
