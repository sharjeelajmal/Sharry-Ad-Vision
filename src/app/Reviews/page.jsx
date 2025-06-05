'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';
import Review from '../_components/Review';
import AnimatedSection from "../_components/AnimatedSection";

const Reviews = () => {
  const handleWhatsAppRedirect = () => {
    const phoneNumber = '447751497015'; // Your WhatsApp number
    const message = 'Hello, I want to know more about your services!';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = url; // Redirects to WhatsApp
  };

  return (

    <div>
    <div className="bg-customGray p-8">
      <div className="md:px-36">
        <div className="hero-content flex-col lg:flex-row-reverse">
          {/* Image Section */}
          <AnimatedSection>
          <Image
            src="reviews.svg"
            width={500}
            height={500}
            className="hidden md:flex md:max-w-sm"
            alt="Reviews Illustration"
          /></AnimatedSection>
          {/* Text Section */}
                 <AnimatedSection>
          <div>
            <h1 className="text-5xl font-bold">
              Customer Reviews | Honest Feedback About Our SMM Panel
            </h1>
            <p className="py-6">
              Discover what our customers have to say about our SMM panel! Read real reviews and
              feedback from users who have experienced our reliable and efficient social media
              marketing services. Your satisfaction is our priority, and we strive to deliver the
              best results every time!
            </p>
            {/* WhatsApp Button */}
            <Button
              onClick={handleWhatsAppRedirect}
              className="active:scale-95 hover:scale-105 transition-all ease-out"
            >
              WhatsApp
            </Button>
          </div>
          </AnimatedSection>
        </div>
      </div>

    </div>
    <Review/>

   </div>
  );
};

export default Reviews;
