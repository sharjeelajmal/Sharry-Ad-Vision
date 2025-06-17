// src/app/_components/Alertmesage.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-hot-toast";

// This map helps select the right currency based on the user's country
const countryCurrencyMap = {
  PK: "PKR", US: "USD", IN: "INR", AE: "AED", GB: "GBP", DE: "EUR", FR: "EUR",
};

export default function NotificationPopup({ isAdmin = false }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState({
    title: "",
    image: "",
    message: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // --- NEW: State for currency conversion ---
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [conversionRates, setConversionRates] = useState({ PKR: 1 });

  // Load all necessary data: alert content, currencies, and user location
  useEffect(() => {
    const loadData = async () => {
      try {
        const [alertRes, currenciesRes, geoRes] = await Promise.all([
            fetch('/api/alerts'), //
            fetch('/api/currencies'), //
            fetch('/api/get-user-location') //
        ]);

        // Process alert data from the API
        if (alertRes.ok) {
          const data = await alertRes.json();
          setEditContent(data || {
            title: "Tiktok Likes Rate Decreased",
            image: "/Tiktok.gif",
            // Using a numeric value here so conversion can work by default
            message: `Price PKR = 140\n⚡ Recommended ✅\n⚡ 100% Always working\n⭐ Start: 0-5 minutes / 1 hour\n🔥 Speed: Excellent\n♻️ Refill: Lifetime\n✅ Cancel Button: Yes\n🔥 Drop Ratio: 0%\n⭐ Link: Add Video link\n✅If You Want To Order\nContact On Whatsapp Please 💯`
          });
        } else {
          toast.error("Failed to load popup alert.");
        }

        // Process currency data from the API
        let finalSelectedCurrency = 'PKR';
        if (currenciesRes.ok) {
            const currenciesData = await currenciesRes.json();
            const rates = currenciesData.reduce((acc, curr) => {
                acc[curr.code] = curr.rate;
                return acc;
            }, { PKR: 1 });
            setConversionRates(rates);

            // Process user location and set the preferred currency
            if (geoRes.ok) {
                const geoData = await geoRes.json();
                const preferredCurrency = countryCurrencyMap[geoData.countryCode] || 'PKR';
                // Check if the preferred currency is available in our rates
                if (rates[preferredCurrency]) {
                    finalSelectedCurrency = preferredCurrency;
                }
            }
        } else {
            toast.error("Failed to load currency rates.");
        }
        setSelectedCurrency(finalSelectedCurrency);

      } catch (error) {
        console.error("Failed to load initial data for popup:", error);
        toast.error("Failed to load popup data.");
      } finally {
        setShowPopup(true);
      }
    };
    loadData();
  }, []); // Runs once on component mount

  // --- NEW: Memoized function to convert a price value ---
  const convertPrice = useCallback((price) => {
    if (!selectedCurrency || !conversionRates[selectedCurrency]) {
        return price; // Return original price if currency data isn't ready
    }
    const rate = conversionRates[selectedCurrency];
    let converted = price * rate;
    return converted % 1 === 0 ? converted.toFixed(0) : converted.toFixed(2);
  }, [conversionRates, selectedCurrency]);

  // --- NEW: Memoized function to convert the entire message string ---
  const convertedMessage = useCallback(() => {
    let message = editContent.message;
    // Don't convert if the selected currency is PKR or if data is missing
    if (!message || !selectedCurrency || selectedCurrency === 'PKR') {
        return message;
    }

    // Regex to find "Price PKR = 140" and similar patterns
    const regex1 = /(Price\sPKR\s*=\s*)(\d[\d,.]*)/gi;
    // Regex to find "1200 PKR" and similar patterns
    const regex2 = /(\d[\d,.]*)\s*(PKR)/gi;

    // First, replace patterns like "Price PKR = 140"
    let newMessage = message.replace(regex1, (match, prefix, pkrValue) => {
        const numericValue = parseFloat(pkrValue.replace(/,/g, ''));
        if (isNaN(numericValue)) return match;
        return `Price ${selectedCurrency} = ${convertPrice(numericValue)}`;
    });

    // Then, replace patterns like "1200 PKR"
    newMessage = newMessage.replace(regex2, (match, pkrValue) => {
        const numericValue = parseFloat(pkrValue.replace(/,/g, ''));
        if (isNaN(numericValue)) return match;
        return `${convertPrice(numericValue)} ${selectedCurrency}`;
    });

    return newMessage;

  }, [editContent.message, selectedCurrency, convertPrice]);

  // Save handler remains unchanged
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editContent)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || "Failed to save alert");
      }

      const savedData = await res.json();
      setEditContent(savedData);
      setIsEditing(false);
      toast.success("Changes saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // WhatsApp redirect remains unchanged
  const handleWhatsAppRedirect = () => {
    const phoneNumber = "447751497015";
    const message = "Hello, I want to know more about your services!";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, '_blank');
  };


  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg text-center relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isAdmin && !isEditing && (
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close popup"
              >
                &times;
              </button>
            )}

            {isEditing ? (
              // The editing interface is unchanged
              <div className="space-y-4">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editContent.image}
                  onChange={(e) => setEditContent({...editContent, image: e.target.value})}
                  placeholder="Image URL"
                />
                {editContent.image && (
                  <img
                    src={editContent.image}
                    alt="Image Preview"
                    className="max-h-24 mx-auto object-contain"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editContent.title}
                  onChange={(e) => setEditContent({...editContent, title: e.target.value})}
                  placeholder="Title"
                />
                <textarea
                  className="textarea textarea-bordered w-full h-48"
                  value={editContent.message}
                  onChange={(e) => setEditContent({...editContent, message: e.target.value})}
                  placeholder="Message"
                />
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                    }}
                    className="btn btn-error"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-success"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              // The user-facing view now shows the converted message
              <>
                {editContent.image && (
                  <Image
                    src={editContent.image}
                    width={140}
                    height={140}
                    unoptimized
                    style={{
                      display: "block",
                      margin: "0 auto",
                      maxWidth: "100%",
                    }}
                    alt="Popup"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <h2 className="text-lg font-bold mb-4">{editContent.title}</h2>
                <p className="text-gray-700 mb-6 whitespace-pre-line">
                  {/* --- CHANGE: Display the converted message --- */}
                  {convertedMessage()}
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={handleWhatsAppRedirect}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    OK
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}