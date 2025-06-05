"use client";

import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import AnimatedSection from "./AnimatedSection";

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ name: "", rating: "", review: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Close dropdown on click outside
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

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating: parseInt(rating), review }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      toast.success("🎉 Review submitted successfully!");
      setForm({ name: "", rating: "", review: "" });
      fetchReviews();
    } catch (err) {
      toast.error("Something went wrong. Try again!");
    }
  };

  const ratingStars = (num) => "⭐".repeat(num) + "☆".repeat(5 - num);

  return (

     
    <section className="my-10 bg-white">

      <AnimatedSection>
      <h1 className="font-bold text-3xl sm:text-4xl text-center py-5">
        Customer Reviews
      </h1>
</AnimatedSection>
      {/* FORM */}
           <AnimatedSection>
      <form
        className="w-[95%] sm:w-[90%] md:w-[80%] lg:max-w-md mx-auto p-4 sm:p-5 border border-gray-200 bg-gray-50 rounded-xl shadow-md transition-all duration-300 mb-3"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded mb-3 bg-white"
          required
        />

        {/* DaisyUI Dropdown for Rating */}
        <div className="mb-3 w-full relative" ref={dropdownRef}>
          <label className="block mb-1 font-mediumbg-white text-gray-700">Select Rating</label>
          <button
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
            className="btn w-full bg-white border border-gray-300 text-gray-700 justify-between flex items-center"
          >
            {form.rating ? `${form.rating} Star${form.rating > 1 ? "s" : ""}` : "Select Rating"}
            <svg
              className={`ml-2 h-4 w-4 shrink-0 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : "rotate-0"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <ul
              className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto"
              role="listbox"
              aria-labelledby="rating-label"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <li key={n} role="option" aria-selected={form.rating === n.toString()}>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, rating: n.toString() });
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-100 ${
                      form.rating === n.toString() ? "bg-blue-200 font-semibold" : ""
                    }`}
                  >
                    {n} Star{n > 1 ? "s" : ""}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <textarea
          placeholder="Your Review"
          value={form.review}
          onChange={(e) => setForm({ ...form, review: e.target.value })}
          className="w-full border p-2 rounded mb-3 bg-white"
          rows={4}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
        >
          Submit Review
        </button>
      </form>
</AnimatedSection>
      {/* REVIEWS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4">
        {reviews.map((review) => (
  <AnimatedSection>
          <div
            key={review.id}
            className="p-3 sm:p-5 border rounded-lg shadow flex flex-col items-center"
          >
            <h3 className="font-semibold text-lg sm:text-xl my-2">{review.name}</h3>
            <p className="text-yellow-500 text-xs sm:text-sm my-2">
              {ratingStars(review.rating)}
            </p>
            <p className="mt-2 text-xs sm:text-sm text-center">{review.review}</p>
          </div>
          </AnimatedSection>
        ))}
      </div>

    </section>
  
  );
};

export default Review;
