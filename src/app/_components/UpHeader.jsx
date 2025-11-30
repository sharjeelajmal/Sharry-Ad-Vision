'use client'
import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ShieldCheck, MessageCircle, Crown } from 'lucide-react'
import { gsap } from 'gsap'

const UpHeader = () => {
  const headerRef = useRef(null);

  const handleWhatsAppRedirect = () => {
    const phoneNumber = '447751497015'; 
    const message = 'Hello, I want to avail your premium services!';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Smooth Slide Down Animation
      gsap.fromTo(headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    // Position Absolute taaki ye Hero Section ke upar tairta hua dikhe (Transparent Overlay)
    <div ref={headerRef} className="absolute top-0 left-0 w-full z-50 pointer-events-none"> {/* pointer-events-none taaki neeche click ho sake (buttons pe auto-enable hoga) */}
      
      {/* Subtle Gradient Shade for visibility */}
      <div className="absolute inset-0 h-32 bg-gradient-to-b from-white/80 via-white/40 to-transparent pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-12 lg:px-20 pt-6 flex justify-between items-center relative z-10">
        
        {/* --- LEFT: BRAND LOGO --- */}
        <div className="pointer-events-auto cursor-pointer group">
           {/* Logo Container with Glow */}
           <div className="relative">
             <div className="absolute -inset-4 bg-blue-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <Image
                src="/logo.svg"
                alt="Logo"
                width={180}
                height={90}
                className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-sm"
              />
           </div>
        </div>

        {/* --- RIGHT: PREMIUM BADGES & CONTACT --- */}
        <div className="flex items-center gap-4 sm:gap-6 pointer-events-auto">
          
          {/* Trust Badge (Hidden on very small mobiles) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md border border-white/50 rounded-full shadow-sm">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span className="text-xs font-semibold text-slate-600 tracking-wide">Verified Agency</span>
          </div>

          {/* Premium "Priority" Link (Instead of heavy button) */}
          <div 
            onClick={handleWhatsAppRedirect}
            className="group flex items-center gap-2 px-4 py-2 bg-slate-900/5 hover:bg-slate-900/10 backdrop-blur-md border border-slate-900/10 rounded-full cursor-pointer transition-all duration-300"
          >
             <div className="relative">
               <div className="absolute inset-0 bg-amber-400 blur-sm opacity-50 animate-pulse"></div>
               <Crown className="w-4 h-4 text-amber-600 relative z-10" />
             </div>
             <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
               Priority Support
             </span>
          </div>

        </div>

      </div>
    </div>
  )
}

export default UpHeader