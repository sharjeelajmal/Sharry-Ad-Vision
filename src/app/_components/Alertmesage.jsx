"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function NotificationPopup({ isAdmin = false }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState({
    title: "Tiktok Likes Rate Decreased",
    image: "/Tiktok.gif",
    message: `Price 140 PKR = 1k\n⚡ Recommended ✅\n⚡ 100% Always working\n⭐ Start: 0-5 minutes / 1 hour\n🔥 Speed: Excellent\n♻️ Refill: Lifetime\n✅ Cancel Button: Yes\n🔥 Drop Ratio: 0%\n⭐ Link: Add Video link\n✅If You Want To Order\nContact On Whatsapp Please 💯`
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load popup data
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/alerts');
        if (res.ok) {
          const data = await res.json();
          if (data) setEditContent(data);
        }
      } catch (error) {
        console.error("Failed to load popup:", error);
      } finally {
        setShowPopup(true);
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

      if (!res.ok) throw new Error(await res.text());

      const savedData = await res.json();
      setEditContent(savedData);
      setIsEditing(false);
      toast.success("Changes saved successfully!");
      
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(`Save failed: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
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
            className="bg-white p-6 rounded-2xl shadow-lg text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editContent.image}
                  onChange={(e) => setEditContent({...editContent, image: e.target.value})}
                  placeholder="Image URL"
                />
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
                    onClick={() => setIsEditing(false)} 
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
              <>
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
                />
                <h2 className="text-lg font-bold mb-4">{editContent.title}</h2>
                <p className="text-gray-700 mb-6 whitespace-pre-line">
                  {editContent.message}
                </p>
                <div className="flex justify-center gap-2">
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