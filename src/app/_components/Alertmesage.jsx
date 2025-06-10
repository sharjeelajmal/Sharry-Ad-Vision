"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function NotificationPopup() {
  const [showPopup, setShowPopup] = useState(true);

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
            <Image
              src={"/Tiktok.gif"}
              width={140} // Reduced image width
              height={140} // Reduced image height
              unoptimized
              style={{
                display: "block",
                margin: "0 auto",
                maxWidth: "100%",
              }}
            />
            <h2 className="text-lg font-bold mb-4">
              Tiktok Likes Rate Decreased
            </h2>
            <p className="text-gray-700 mb-6">
                 Price 140 PKR = 1k <br />
              ⚡ Recommended ✅ <br />
              ⚡ 100% Always working <br />
              ⭐ Start: 0-5 minutes / 1 hour <br />
              🔥 Speed: Excellent <br />
              ♻️ Refill: Lifetime <br />
              ✅ Cancel Button: Yes <br />
              🔥 Drop Ratio: 0% <br />⭐ Link: Add Video link <br />
              <strong>✅If You Want To Order <br /> Contact On Whatsapp Please 💯</strong>

    
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
