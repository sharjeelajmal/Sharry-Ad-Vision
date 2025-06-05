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
 <div className=' flex justify-between md:px-16 bg-customGray pt-8 px-6'>
  <AnimatedSection>
 <Image
  src="/logo.svg"
  alt="Logo"
  className="w-20 h-10 sm:w-24 sm:h-12 md:w-32 md:h-16 lg:w-40 lg:h-20 xl:w-48 xl:h-24"
  height={180} // Optional for Next.js optimization
  width={180}  // Optional for Next.js optimization
/></AnimatedSection>
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