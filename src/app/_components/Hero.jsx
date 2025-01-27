'use client'
import { Button } from '@/components/ui/button'

import React from 'react'

const Hero = () => {
  const handleWhatsAppRedirect = () => {
    const phoneNumber = '447751497015'; // Your WhatsApp number
    const message = 'Hello, I want to know more about your services!';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = url; // Redirects to WhatsApp
  };



  return (
    <div className='bg-customGray p-8 '> 

      <div className="  md:px-36">
  <div className="hero-content flex-col lg:flex-row-reverse">


    <img
      src="hero.svg"
      className="hidden md:flex md:max-w-sm" />
    <div>
      <h1 className="text-5xl font-bold">Best & Cheapest SMM Panel Provider in World</h1>
      <p className="py-6">
      Our support team is available 24/7 on live chat, responding in 0-5 minutes. Mostly, issues are resolved within 1 hour. If an issue is not resolved within 24 hours, we offer a full refund.
      <strong>✅If You Want To Order  Contact On Whatsapp Please 💯 </strong>
      </p>

     {/* WhatsApp Button */}
            <Button
              onClick={handleWhatsAppRedirect}
              className="active:scale-95 hover:scale-105 transition-all ease-out"
            >
              WhatsApp
            </Button>
    </div>
  </div>
</div>
    </div>

  )
}

export default Hero