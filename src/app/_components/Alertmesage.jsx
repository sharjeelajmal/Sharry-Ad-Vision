// src/app/_components/Alertmesage.jsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-hot-toast"; // Using react-hot-toast for consistency
// import 'react-toastify/dist/ReactToastify.css'; // This is for react-toastify, if you use react-hot-toast, remove this.

export default function NotificationPopup({ isAdmin = false }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState({
    title: "", // Initial empty, will be fetched from DB
    image: "", // Initial empty
    message: "", // Initial empty
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load popup data
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const data = await res.json();
          // Set fetched data or default if no data exists
          setEditContent(data || {
            title: "Tiktok Likes Rate Decreased",
            image: "/Tiktok.gif",
            message: `Price 140 PKR = 1k\n⚡ Recommended ✅\n⚡ 100% Always working\n⭐ Start: 0-5 minutes / 1 hour\n🔥 Speed: Excellent\n♻️ Refill: Lifetime\n✅ Cancel Button: Yes\n🔥 Drop Ratio: 0%\n⭐ Link: Add Video link\n✅If You Want To Order\nContact On Whatsapp Please 💯`
          });
        } else {
          console.error("Failed to fetch alerts:", res.status, res.statusText);
          toast.error("Failed to load alerts.");
        }
      } catch (error) {
        console.error("Failed to load popup:", error);
        toast.error("Failed to load popup data.");
      } finally {
        setShowPopup(true); // Always try to show popup after attempting to load data
      }
    };
    loadData();
  }, []);

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
      setEditContent(savedData); // Update state with saved data
      setIsEditing(false);
      toast.success("Changes saved successfully!");
      // No need for window.location.reload() if state is updated correctly
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const phoneNumber = "447751497015";
    const message = "Hello, I want to know more about your services!";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, '_blank'); // Open in new tab
  };


  return (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" // Reverted: Removed p-4
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg text-center relative" // Reverted: Removed max-w-lg w-full. Kept 'relative' for close button.
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isAdmin && !isEditing && ( // Close button for admin when not editing
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close popup"
              >
                &times;
              </button>
            )}

            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editContent.image}
                  onChange={(e) => setEditContent({...editContent, image: e.target.value})}
                  placeholder="Image URL"
                />
                {editContent.image && (
                  <img // Using img tag for preview in edit mode
                    src={editContent.image}
                    alt="Image Preview"
                    className="max-h-24 mx-auto object-contain"
                    onError={(e) => (e.target.style.display = "none")} // Hide if image fails to load
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
                      // Optionally, reload original data if changes were not saved
                      // const loadData = async () => { ... }; loadData();
                    }}
                    className="btn btn-error" // Kept existing style for edit mode buttons
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-success" // Kept existing style for edit mode buttons
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {editContent.image && (
                  <Image
                    src={editContent.image}
                    width={140}
                    height={140}
                    unoptimized // Reverted to unoptimized
                    style={{
                      display: "block",
                      margin: "0 auto",
                      maxWidth: "100%",
                      // Reverted: Removed height: "auto"
                    }}
                    alt="Popup"
                    onError={(e) => (e.target.style.display = "none")} // Hide if image fails to load
                  />
                )}
                <h2 className="text-lg font-bold mb-4">{editContent.title}</h2> {/* Reverted: text-lg, mb-4, removed mt-4 */}
                <p className="text-gray-700 mb-6 whitespace-pre-line"> {/* Reverted: removed text-sm md:text-base */}
                  {editContent.message}
                </p>
                <div className="flex justify-center gap-2">
                  {/* WhatsApp button - Kept as functional element with current style */}
                  <button
                    onClick={handleWhatsAppRedirect}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setShowPopup(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" // Matched snippet style
                  >
                    OK
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700" // Matched snippet style
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