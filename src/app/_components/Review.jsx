"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/reviews"); // API call
        if (!response.ok) throw new Error("Failed to fetch reviews");

        const data = await response.json();
        console.log("API data:", data); // Debugging data
        setReviews(data);
      } catch (err) {
        setError("Error fetching data!");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
<Image
          src="/Loader.gif" // Replace with your loader GIF path
          alt="Loading..."
          width={100}
          height={100}
          unoptimized
        />
      </div>
    );
  }

  if (error) {
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  }

  return (
    <section className="my-10 bg-white">
      <h1 className="font-bold text-3xl sm:text-4xl text-center py-5">Customer Reviews</h1>
      <div
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5"
        style={{ padding: "10px" }}
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-3 sm:p-5 border rounded-lg shadow-lg flex flex-col items-center"
          >
            <h3 className="font-semibold text-lg sm:text-xl my-2">{review.name}</h3>
            <p className="text-yellow-500 text-xs sm:text-sm my-2">
              {"⭐".repeat(review.rating)}{" "}
              {"☆".repeat(5 - review.rating)}
            </p>
            <p className="mt-2 text-xs sm:text-sm">{review.review}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Review;
