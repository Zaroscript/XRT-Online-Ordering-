import React, { useState, useEffect } from 'react';
import { useSiteSettingsQuery } from '@/api';
import { API_BASE_URL } from '@/config/api';

/** Resolve image URL */
function resolveImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = API_BASE_URL.replace(/\/api\/v\d+$/, ""); // server origin
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

const AdsPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useSiteSettingsQuery();
  const settings = data?.promoPopup;

  useEffect(() => {
    if (isLoading || !settings) return;

    // Check if configuration allows viewing
    if (!settings.isEnable) return;

    // Check if already seen in this session (or handled via cookie/local storage if isNotShowAgain is true)
    // For now, adhering to session storage request
    const hasSeen = sessionStorage.getItem('hasSeenAdsPopup');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('hasSeenAdsPopup', 'true');
      }, (settings.popupDelay || 0) * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [settings, isLoading]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen || !settings) return null;

  const imageUrl = settings.image ? resolveImageUrl(settings.image.original || settings.image.thumbnail || settings.image) : '';

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-[10000] p-4 animate-fade-in" onClick={handleClose}>
      <div 
        className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-md relative shadow-2xl transform scale-100 transition-all" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-3 right-3 text-gray-500 hover:text-black transition-colors text-2xl leading-none focus:outline-none p-2"
          onClick={handleClose}
          aria-label="Close"
        >
          &times;
        </button>
        
        <div className="mt-6">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Promotion" 
              className="w-full max-h-[300px] object-cover rounded-xl mb-4 shadow-sm" 
            />
          ) : (
            <div className="w-full h-56 bg-gray-100 flex items-center justify-center rounded-xl mb-4 text-gray-400 font-medium border-2 border-dashed border-gray-200">
              No Image
            </div>
          )}
          
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">{settings.title}</h2>
            <p className="text-gray-600 leading-relaxed text-base">{settings.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsPopup;
