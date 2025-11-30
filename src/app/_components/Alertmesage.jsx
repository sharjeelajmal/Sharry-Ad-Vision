"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { X, Edit3, Save, MessageCircle, Image as ImageIcon } from "lucide-react";
import confetti from "canvas-confetti"; // Import Confetti

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

  // --- Data Loading ---
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
            title: "Limited Offer 🔥",
            image: "/Tiktok.gif",
            message: "Premium services at unbeatable rates!"
          });
        }

        let finalSelectedCurrency = 'PKR';
        if (currenciesRes.ok) {
            const currenciesData = await currenciesRes.json();
            const rates = currenciesData.reduce((acc, curr) => { acc[curr.code] = curr.rate; return acc; }, { PKR: 1 });
            setConversionRates(rates);

            if (geoRes.ok) {
                const geoData = await geoRes.json();
                const preferredCurrency = countryCurrencyMap[geoData.countryCode] || 'PKR';
                if (rates[preferredCurrency]) finalSelectedCurrency = preferredCurrency;
            }
        }
        setSelectedCurrency(finalSelectedCurrency);
        
        if (galleryRes && galleryRes.ok) {
            const galleryData = await galleryRes.json();
            if(setGalleryItems) setGalleryItems(galleryData);
        }
      } catch (error) {
        console.error("Popup data load failed:", error);
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
      if (!res.ok) throw new Error("Failed to save");
      
      const savedData = await res.json();
      setEditContent(savedData);
      setIsEditing(false);
      setOriginalContent(null);
      setImagePreview('');
      toast.success("Saved!");
    } catch (error) {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSelectFromGallery = (media) => {
    setEditContent(prev => ({ ...prev, image: media.url }));
    setImagePreview(media.url);
    setIsGalleryOpen(false);
  };

  // --- PREMIUM WHATSAPP REDIRECT WITH CELEBRATION ---
  const handleWhatsAppRedirect = () => {
    // 1. Trigger Confetti (Celebration)
    const colors = ['#1E40AF', '#FFD700', '#ffffff']; // Gold, Blue, White
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 }, // Popup ke center/bottom se niklega
      colors: colors,
      zIndex: 10005, // Important: Popup (9999) ke upar dikhne ke liye
      scalar: 1.2
    });

    // 2. Redirect after delay
    setTimeout(() => {
        window.open(`https://wa.me/447751497015?text=Hello, interested in this offer!`, '_blank');
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Dark Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => !isEditing && setShowPopup(false)}
            ></div>

            {/* --- EXPERT LEVEL COMPACT CARD --- */}
            <motion.div
              className="relative w-[90%] max-w-[400px] md:max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
            >
              
              {/* Close Button (Floating Glass) */}
              {!isEditing && (
                  <button 
                    onClick={() => setShowPopup(false)} 
                    className="absolute top-3 right-3 z-30 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md shadow-sm"
                  >
                    <X size={18} />
                  </button>
              )}

              {/* === VIEW MODE === */}
              {!isEditing ? (
                <>
                    {/* LEFT: Media Section */}
                    {/* Compact Height for Mobile (h-32) & Object Contain */}
                    <div className="w-full md:w-1/2 h-32 md:h-auto bg-slate-50 relative flex-shrink-0">
                       {editContent.image ? (
                           (editContent.image.endsWith('.mp4') || editContent.image.endsWith('.webm')) ? (
                             <video src={editContent.image} autoPlay loop muted playsInline className="w-full h-full object-contain" />
                           ) : (
                             <img src={editContent.image} alt="Offer" className="w-full h-full object-contain p-1" onError={(e) => { e.target.style.display = 'none'; }} />
                           )
                       ) : (
                           <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                               <ImageIcon size={40} />
                           </div>
                       )}
                       <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent to-black/5 pointer-events-none"></div>
                    </div>

                    {/* RIGHT: Content Section */}
                    <div className="flex-1 p-5 md:p-8 flex flex-col bg-white overflow-hidden">
                        
                        <div className="flex-1 flex flex-col justify-center text-center md:text-left overflow-hidden">
                            <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2 leading-tight tracking-tight flex-shrink-0">
                              {editContent.title}
                            </h2>

                            {/* Scrollable Message Area */}
                            <div className="text-sm text-slate-600 font-medium whitespace-pre-line leading-relaxed mb-4 overflow-y-auto custom-scrollbar">
                              {convertedMessage()}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2 flex-shrink-0">
                            {/* PREMIUM WHATSAPP BUTTON */}
                            <Button 
                              onClick={handleWhatsAppRedirect} 
                              className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all h-11"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                            </Button>
                            
                            <Button 
                              onClick={() => setShowPopup(false)} 
                              variant="outline"
                              className="flex-1 border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 rounded-xl h-11"
                            >
                              Cancel
                            </Button>
                        </div>

                        {/* Admin Edit Trigger */}
                        {isAdmin && (
                          <div className="mt-3 flex justify-center md:justify-start flex-shrink-0">
                              <button 
                                onClick={handleStartEditing} 
                                className="text-[10px] font-bold text-slate-300 hover:text-blue-600 flex items-center gap-1 uppercase tracking-wide transition-colors"
                              >
                                <Edit3 size={10} /> Edit
                              </button>
                          </div>
                        )}
                    </div>
                </>
              ) : (
                /* === EDIT MODE === */
                <div className="w-full p-5 bg-slate-50 flex flex-col h-full overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-900 border-b pb-2 mb-3 uppercase tracking-wider text-center flex-shrink-0">Edit Popup</h3>
                    
                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Image</label>
                            <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  className="input input-sm flex-1 bg-white border-slate-200 rounded text-xs" 
                                  value={editContent.image || ''} 
                                  onChange={(e) => { setEditContent({...editContent, image: e.target.value}); setImagePreview(e.target.value); }} 
                                />
                                <Button size="sm" variant="outline" className="bg-white h-8 text-xs" onClick={() => setIsGalleryOpen(true)}>List</Button>
                            </div>
                        </div>

                        {imagePreview && (
                           <div className="h-20 w-full rounded-lg overflow-hidden bg-white border border-slate-200 relative shadow-sm flex-shrink-0">
                             {(imagePreview.endsWith('.mp4') || imagePreview.endsWith('.webm')) 
                               ? <video src={imagePreview} autoPlay loop muted className="w-full h-full object-contain" />
                               : <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                             }
                           </div>
                        )}

                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Title</label>
                            <input 
                              type="text" 
                              className="input input-sm w-full bg-white border-slate-200 rounded font-bold text-sm" 
                              value={editContent.title || ''} 
                              onChange={(e) => setEditContent({...editContent, title: e.target.value})} 
                            />
                        </div>
                        
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Message</label>
                            <textarea 
                              className="textarea w-full h-24 bg-white border-slate-200 rounded text-sm resize-none" 
                              value={editContent.message || ''} 
                              onChange={(e) => setEditContent({...editContent, message: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t mt-auto flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={handleCancelEditing} className="flex-1 text-slate-500 h-9">Cancel</Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex-1 bg-slate-900 text-white h-9">
                          {isSaving ? "Save" : "Save"}
                        </Button>
                    </div>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Gallery Modal */}
      {isGalleryOpen && (
        <dialog open className="modal modal-open z-[10000]">
          <div className="modal-box max-w-2xl bg-white rounded-xl p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-900">Select Media</h3>
                <button onClick={() => setIsGalleryOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"><X size={18}/></button>
            </div>
            <div className="grid grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {galleryItems.map(media => (
                <div key={media._id} className="relative group cursor-pointer rounded-lg overflow-hidden aspect-square border hover:border-slate-900 transition-all" onClick={() => handleSelectFromGallery(media)}>
                  {media.filetype === 'video' ? (<video src={media.url} muted className="w-full h-full object-cover"/>) : (<img src={media.url} alt="media" className="w-full h-full object-cover"/>)}
                </div>
              ))}
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}