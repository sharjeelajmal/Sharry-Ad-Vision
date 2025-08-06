// src/app/_components/Alertmesage.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

const countryCurrencyMap = {
  PK: "PKR", US: "USD", IN: "INR", AE: "AED", GB: "GBP", DE: "EUR", FR: "EUR",
};

export default function NotificationPopup({ isAdmin = false, galleryItems = [], setGalleryItems }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState({
    title: "",
    image: "",
    message: "",
  });
  const [originalContent, setOriginalContent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [alertRes, currenciesRes, geoRes, galleryRes] = await Promise.all([
            fetch('/api/alerts'),
            fetch('/api/currencies'),
            fetch('/api/get-user-location'),
            galleryItems.length === 0 ? fetch('/api/api/gallery') : Promise.resolve(null)
        ]);

        if (alertRes.ok) {
          const data = await alertRes.json();
          setEditContent(data || {
            title: "Tiktok Likes Rate Decreased",
            image: "/Tiktok.gif",
            message: `Price PKR = 140\n⚡ Recommended ✅\n⚡ 100% Always working\n⭐ Start: 0-5 minutes / 1 hour\n🔥 Speed: Excellent\n♻️ Refill: Lifetime\n✅ Cancel Button: Yes\n🔥 Drop Ratio: 0%\n⭐ Link: Add Video link\n✅If You Want To Order\nContact On Whatsapp Please 💯`
          });
        } else {
            toast.error("Failed to load popup alert.");
        }

        let finalSelectedCurrency = 'PKR';
        if (currenciesRes.ok) {
            const currenciesData = await currenciesRes.json();
            const rates = currenciesData.reduce((acc, curr) => { acc[curr.code] = curr.rate; return acc; }, { PKR: 1 });
            setConversionRates(rates);

            if (geoRes.ok) {
                const geoData = await geoRes.json();
                const preferredCurrency = countryCurrencyMap[geoData.countryCode] || 'PKR';
                if (rates[preferredCurrency]) {
                    finalSelectedCurrency = preferredCurrency;
                }
            }
        } else {
            toast.error("Failed to load currency rates.");
        }
        setSelectedCurrency(finalSelectedCurrency);
        
        if (galleryRes && galleryRes.ok) {
            const galleryData = await galleryRes.json();
            if(setGalleryItems) setGalleryItems(galleryData);
        }
      } catch (error) {
        console.error("Failed to load initial data for popup:", error);
        toast.error("Failed to load popup data.");
      } finally {
        setTimeout(() => setShowPopup(true), 1500);
      }
    };
    loadData();
  }, [galleryItems.length, setGalleryItems]);

  const convertPrice = useCallback((price) => {
    if (!selectedCurrency || !conversionRates[selectedCurrency]) return price;
    const rate = conversionRates[selectedCurrency];
    let converted = price * rate;
    return converted % 1 === 0 ? converted.toFixed(0) : converted.toFixed(2);
  }, [conversionRates, selectedCurrency]);

  const convertedMessage = useCallback(() => {
    let message = editContent.message || "";
    if (!selectedCurrency || selectedCurrency === 'PKR') return message;
    
    const regex1 = /(Price\sPKR\s*=\s*)(\d[\d,.]*)/gi;
    const regex2 = /(\d[\d,.]*)\s*(PKR)/gi;

    let newMessage = message.replace(regex1, (match, prefix, pkrValue) => {
        const numericValue = parseFloat(pkrValue.replace(/,/g, ''));
        if (isNaN(numericValue)) return match;
        return `Price ${selectedCurrency} = ${convertPrice(numericValue)}`;
    });
    
    return newMessage.replace(regex2, (match, pkrValue) => {
        const numericValue = parseFloat(pkrValue.replace(/,/g, ''));
        if (isNaN(numericValue)) return match;
        return `${convertPrice(numericValue)} ${selectedCurrency}`;
    });
  }, [editContent.message, selectedCurrency, convertPrice]);
  
  const handleStartEditing = () => {
    setOriginalContent(editContent);
    setImagePreview(editContent.image || '');
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditContent(originalContent);
    setImagePreview('');
    setIsEditing(false);
    setOriginalContent(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editContent)
      });
      if (!res.ok) throw new Error((await res.json()).details || "Failed to save alert");
      
      const savedData = await res.json();
      setEditContent(savedData);
      setIsEditing(false);
      setOriginalContent(null);
      setImagePreview('');
      toast.success("Changes saved successfully!");
    } catch (error) {
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSelectFromGallery = (media) => {
    setEditContent(prev => ({ ...prev, image: media.url }));
    setImagePreview(media.url);
    setIsGalleryOpen(false);
  };

  const handleWhatsAppRedirect = () => {
    window.open(`https://wa.me/447751497015?text=Hello, I want to know more about your services!`, '_blank');
  };

  return (
    <>
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-lg text-center relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {isAdmin && !isEditing && (
                  <button onClick={() => setShowPopup(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
              )}

              {isEditing ? (
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Popup Media</label>
                        <div className="flex items-center gap-4">
                            <input type="text" className="input input-bordered w-full bg-white" value={editContent.image || ''} onChange={(e) => { setEditContent({...editContent, image: e.target.value}); setImagePreview(e.target.value); }} placeholder="Paste URL or choose from gallery" />
                            <Button className="btn-secondary" onClick={() => setIsGalleryOpen(true)}>Choose</Button>
                        </div>
                        {imagePreview && (
                           <div className="mt-2 p-2 border rounded-md w-32 mx-auto">
                             <p className="text-sm text-gray-500 mb-1">Preview:</p>
                             {(imagePreview.endsWith('.mp4') || imagePreview.endsWith('.webm')) 
                               ? <video src={imagePreview} autoPlay loop muted playsInline className="max-h-24 object-contain mx-auto" />
                               : <img src={imagePreview} alt="Preview" className="max-h-24 object-contain mx-auto" />
                             }
                           </div>
                        )}
                    </div>
                    <input type="text" className="input input-bordered w-full bg-white" value={editContent.title || ''} onChange={(e) => setEditContent({...editContent, title: e.target.value})} placeholder="Title" />
                    <textarea className="textarea textarea-bordered w-full h-48 bg-white" value={editContent.message || ''} onChange={(e) => setEditContent({...editContent, message: e.target.value})} placeholder="Message" />
                    <div className="flex justify-center gap-2">
                        <button onClick={handleCancelEditing} className="btn btn-error text-white">Cancel</button>
                        <button onClick={handleSave} className="btn btn-success text-white" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
                    </div>
                 </div>
              ) : (
                 <>
                    {editContent.image && (
                        <div className="mx-auto" style={{width: "140px", height:"140px"}}>
                         {(editContent.image.endsWith('.mp4') || editContent.image.endsWith('.webm')) ? (
                           <video src={editContent.image} autoPlay loop muted playsInline className="max-w-full max-h-full mx-auto" />
                         ) : (
                           <img src={editContent.image} alt="Popup" style={{display: "block", margin: "0 auto", maxWidth: "100%", maxHeight: "100%"}} onError={(e) => { e.target.style.display = 'none'; }} />
                         )}
                        </div>
                    )}
                    <h2 className="text-lg font-bold mb-4 mt-2">{editContent.title}</h2>
                    <p className="text-gray-700 mb-6 whitespace-pre-line">{convertedMessage()}</p>
                    <div className="flex justify-center gap-2">
                        <button onClick={handleWhatsAppRedirect} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">WhatsApp</button>
                        <button onClick={() => setShowPopup(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">OK</button>
                        {isAdmin && (<button onClick={handleStartEditing} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700">Edit</button>)}
                    </div>
                 </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isGalleryOpen && (
        <dialog open className="modal modal-open z-[52]">
          <div className="modal-box max-w-5xl bg-white">
            <h3 className="font-bold text-lg">Select Media from Gallery</h3>
            <div className="py-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
              {galleryItems.map(media => (
                <div key={media._id} className="group cursor-pointer" onClick={() => handleSelectFromGallery(media)}>
                  {media.filetype === 'video' ? (<video src={media.url} muted className="w-full h-24 object-cover rounded-lg border-2 border-transparent group-hover:border-blue-500"/>) : (<img src={media.url} alt={media.filename} className="w-full h-24 object-cover rounded-lg border-2 border-transparent group-hover:border-blue-500"/>)}
                </div>
              ))}
            </div>
            <div className="modal-action"><Button onClick={() => setIsGalleryOpen(false)}>Cancel</Button></div>
          </div>
        </dialog>
      )}
    </>
  );
}