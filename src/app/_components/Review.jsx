"use client";

import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import AnimatedSection from "./AnimatedSection";
import DigitalAgencyLoader from "./DigitalAgencyLoader"; 
import { Star, User, Send, Quote, ChevronDown, MessageCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion"; // Animation library
import confetti from "canvas-confetti"; // Celebration library

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", rating: "", review: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Success Popup State
  const [showSuccess, setShowSuccess] = useState(false);
  
  const dropdownRef = useRef(null);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reviews");
      const data = await response.json();
      const shuffled = shuffleArray(data);
      setReviews(shuffled);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, rating, review } = form;

    if (!name || !rating || !review) {
      toast.error("Please fill all fields");
      return;
    }

    const toastId = toast.loading("Submitting...");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating: parseInt(rating), review }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      // 1. Toast Hatao
      toast.dismiss(toastId);

      // 2. Confetti Celebration (Dhamaka!)
      const colors = ['#1E40AF', '#FFD700', '#ffffff'];
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
        zIndex: 10005 // Overlay ke upar dikhe
      });

      // 3. Show Full Screen Success Overlay
      setShowSuccess(true);

      // 4. Reset Form
      setForm({ name: "", rating: "", review: "" });
      fetchReviews();

      // 5. Hide Overlay automatically after 2.5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2500);

    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Something went wrong. Try again!");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={`${
              i < rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-slate-50 relative overflow-hidden">
      
      {/* --- SUCCESS FULL SCREEN OVERLAY --- */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
             <motion.div 
                initial={{ scale: 0.5, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center flex flex-col items-center gap-4 max-w-sm w-[90%]"
             >
                 {/* Success Icon */}
                 <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-2 animate-[bounce_1s_infinite]">
                    <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={3} />
                 </div>
                 
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    Review Posted!
                 </h2>
                 <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    Thanks for your feedback. Your review is now live on our wall.
                 </p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[10%] left-[5%] w-80 h-80 bg-amber-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* --- HEADER --- */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-2">Testimonials</h2>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Clients</span>
            </h1>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto text-lg">
              See what our customers are saying about our premium services and support.
            </p>
          </div>
        </AnimatedSection>

        {/* --- REVIEW FORM (Glass Card) --- */}
        <AnimatedSection>
          <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 mb-16 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500"></div>
             
             <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <MessageCircle className="text-blue-500" size={20} />
                Write a Review
             </h3>

             <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700"
                        required
                    />
                </div>

                {/* Rating Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none flex items-center justify-between transition-all ${dropdownOpen ? 'ring-2 ring-blue-500/20 border-blue-500' : ''}`}
                    >
                        <span className={`font-medium ${form.rating ? 'text-slate-800' : 'text-slate-400'}`}>
                            {form.rating ? `${form.rating} Star${form.rating > 1 ? "s" : ""} Rating` : "Select Rating"}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {[5, 4, 3, 2, 1].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => {
                                        setForm({ ...form, rating: num.toString() });
                                        setDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-2 transition-colors"
                                >
                                    <span className="font-bold text-slate-700 w-4">{num}</span>
                                    {renderStars(num)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Review Textarea */}
                <textarea
                    placeholder="Share your experience..."
                    value={form.review}
                    onChange={(e) => setForm({ ...form, review: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-700 resize-none h-32"
                    required
                />

                {/* Submit Button */}
                <Button 
                    type="submit" 
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    <Send size={18} /> Submit Feedback
                </Button>
             </form>
          </div>
        </AnimatedSection>

        {/* --- REVIEWS GRID (With Loader) --- */}
        {loading ? (
            <div className="flex justify-center items-center py-20">
                <DigitalAgencyLoader />
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                <AnimatedSection key={review.id}>
                    <div className="group h-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] hover:border-blue-100 transition-all duration-300 hover:-translate-y-1 relative">
                        
                        {/* Quote Icon Decoration */}
                        <div className="absolute top-6 right-6 text-slate-100 group-hover:text-blue-50 transition-colors">
                            <Quote size={40} fill="currentColor" />
                        </div>

                        {/* Header: Avatar & Info */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                {review.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg leading-none mb-1">
                                    {review.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                    {renderStars(review.rating)}
                                </div>
                            </div>
                        </div>

                        {/* Review Body */}
                        <div className="relative z-10">
                            <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                "{review.review}"
                            </p>
                        </div>

                    </div>
                </AnimatedSection>
                ))}
            </div>
        )}

      </div>
    </section>
  );
};

export default Review;