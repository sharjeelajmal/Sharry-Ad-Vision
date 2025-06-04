"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ name: "", rating: "", review: "" });

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

  return (
    <section className="my-10 bg-white">
      <h1 className="font-bold text-3xl sm:text-4xl text-center py-5">
        Customer Reviews
      </h1>

      {/* FORM */}
      <form
        className="max-w-md mx-auto p-5 border rounded-lg shadow mb-10"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border p-2 rounded mb-3"
          required
        />
        <select
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: e.target.value })}
          className="w-full border p-2 rounded mb-3"
          required
        >
          <option value="">Select Rating</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} Star</option>
          ))}
        </select>
        <textarea
          placeholder="Your Review"
          value={form.review}
          onChange={(e) => setForm({ ...form, review: e.target.value })}
          className="w-full border p-2 rounded mb-3"
          rows={4}
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Submit Review
        </button>
      </form>

      {/* REVIEWS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-3 sm:p-5 border rounded-lg shadow flex flex-col items-center"
          >
            <h3 className="font-semibold text-lg sm:text-xl my-2">{review.name}</h3>
            <p className="text-yellow-500 text-xs sm:text-sm my-2">
              {"⭐".repeat(review.rating)}{" "}
              {"☆".repeat(5 - review.rating)}
            </p>
            <p className="mt-2 text-xs sm:text-sm text-center">{review.review}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Review;
