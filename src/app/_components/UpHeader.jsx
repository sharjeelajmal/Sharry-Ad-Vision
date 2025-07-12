'use client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'
import AnimatedSection from "./AnimatedSection";

const UpHeader = () => {
  const handleWhatsAppRedirect = () => {
    const phoneNumber = '447751497015'; // Your WhatsApp number
    const message = 'Hello, I want to know more about your services!';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = url; // Redirects to WhatsApp
  };

  return (
    <div>
      <div className=' flex justify-around md:justify-between md:px-16 bg-customGray pt-8 px-6'>
        <AnimatedSection>
         <Image
        src="/logo.svg"
        alt="Logo"
        width={180}
        height={90}
        className="h-auto w-32 sm:w-36 md:w-40 lg:w-48"
      />
        </AnimatedSection>
        {/* WhatsApp Button */}
        <AnimatedSection>
          <Button
            onClick={handleWhatsAppRedirect}
            className="active:scale-95 hover:scale-105 transition-all ease-out"
          >
            WhatsApp
          </Button>
        </AnimatedSection>
      </div>
    </div>
  )
}

export default UpHeader