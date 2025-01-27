'use client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

const UpHeader = () => {
  const handleWhatsAppRedirect = () => {
    const phoneNumber = '447751497015'; // Your WhatsApp number
    const message = 'Hello, I want to know more about your services!';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = url; // Redirects to WhatsApp
  };



  return (
    <div>
 <div className='flex justify-between md:px-16 bg-customGray pt-8 px-6'>
 <Image
  src={'/logo.svg'}
  alt="Logo"
  className="max-w-full max-h-12 sm:max-h-10 md:max-h-8"
  height={90}
  width={180}
/>

     {/* WhatsApp Button */}
            <Button
              onClick={handleWhatsAppRedirect}
              className="active:scale-95 hover:scale-105 transition-all ease-out"
            >
              WhatsApp
            </Button>

    </div>

    </div>
  )
}

export default UpHeader