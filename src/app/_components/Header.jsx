'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { House, Compass, Phone, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';

const Header = () => {
  const pathname = usePathname();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const headerRef = useRef(null);
  const itemsRef = useRef([]); // To store refs of LI elements
  
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => { if (data.whatsappNumber) setWhatsappNumber(data.whatsappNumber); })
      .catch(err => console.error("Error", err));
  }, []);

  // --- Perfect Alignment Logic ---
  const updateIndicator = () => {
    const activeIndex = Menu.findIndex(item => item.path === pathname);
    const currentItem = itemsRef.current[activeIndex];

    if (currentItem) {
      setIndicatorStyle({
        left: currentItem.offsetLeft, 
        width: currentItem.offsetWidth,
        opacity: 1
      });
    }
  };

  useEffect(() => {
    updateIndicator();
    const timer = setTimeout(updateIndicator, 100);
    window.addEventListener('resize', updateIndicator);
    
    return () => {
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(timer);
    };
  }, [pathname]);

  const handleWhatsAppRedirect = () => {
    const colors = ['#1E40AF', '#FFD700', '#ffffff'];
    confetti({
      particleCount: 120,
      spread: 120,
      origin: { y: 0.9 },
      colors: colors,
      zIndex: 9999,
      scalar: 1.2
    });
    setTimeout(() => {
        const numberToUse = whatsappNumber || '447751497015'; 
        const message = 'Hello, I want to know more about your premium services!';
        const url = `https://wa.me/${numberToUse}?text=${encodeURIComponent(message)}`;
        window.location.href = url;
    }, 1000);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { y: 150, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 }
      );
    });
    return () => ctx.revert();
  }, []);

  const Menu = [
    { id: 1, name: 'Home', path: '/', icon: <House /> },
    { id: 2, name: 'Reviews', path: '/Reviews', icon: <Compass /> },
    { id: 3, name: 'Contact', path: '/Contact', icon: <Phone /> },
  ];

  return (
    // 'fixed' positioning aur 'z-40' taaki popup iske upar aa sake
    <div ref={headerRef} className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-4xl z-40">
      
      {/* Container: No overflow-hidden here, otherwise tooltips will cut off */}
      <div className="relative flex items-center justify-between p-1.5 sm:p-2 pl-4 pr-1.5 bg-white/90 backdrop-blur-xl border border-white/60 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-full ring-1 ring-white/80 transition-all duration-300">
        
        {/* --- 1. LOGO SECTION --- */}
        <div className="flex-shrink-0 flex items-center pr-3 sm:pr-6 border-r border-slate-200/60 py-1">
          <Link href="/" className="relative group block">
             <Image 
               src={'/logo.svg'} 
               height={50}   
               width={120}   
               alt="Logo" 
               className="h-7 sm:h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-sm" 
             />
          </Link>
        </div>

        {/* --- 2. MENU SECTION --- */}
        <div className="relative flex-grow flex justify-center">
            
            {/* Active Pill Background (Absolute to UL) */}
            {/* Note: Yeh UL ke andar rahega taaki position sahi rahe */}
            <ul className="relative flex items-center justify-center gap-1 sm:gap-2 w-full">
              
              <div 
                  className="absolute top-0 bottom-0 my-auto rounded-full bg-gradient-to-r from-blue-800 to-indigo-700 shadow-lg shadow-blue-900/20 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{
                      left: indicatorStyle.left,
                      width: indicatorStyle.width,
                      height: '85%', 
                      zIndex: 0, 
                  }}
              />

              {Menu.map((item, index) => {
                const isActive = pathname === item.path;
                return (
                  <li 
                    key={item.id}
                    ref={el => itemsRef.current[index] = el}
                    // FIX: 'group' class yahan lagayi hai taaki tooltip trigger ho sake
                    className="relative z-10 group"
                  >
                    <Link href={item.path}>
                      <div
                        className={`relative px-3 py-2 sm:px-6 sm:py-3 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-colors duration-300`}
                      >
                        {/* ICON */}
                        {React.cloneElement(item.icon, {
                          className: `w-5 h-5 sm:w-5 sm:h-5 transition-all duration-300 ease-out ${
                            isActive 
                              ? 'text-amber-300 fill-amber-300/20 scale-110 drop-shadow-sm' 
                              : 'text-slate-500 group-hover:text-blue-600 group-hover:scale-110'
                          }`,
                          strokeWidth: isActive ? 2.5 : 2
                        })}

                        {/* TEXT: Mobile (Active Only), Desktop (Inactive shown too) */}
                        <span className={`text-[10px] sm:text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${
                            isActive 
                              ? 'text-white inline-block' 
                              : 'hidden md:inline-block text-slate-600 group-hover:text-blue-700'
                        }`}>
                          {item.name}
                        </span>
                      </div>
                    </Link>

                    {/* --- TOOLTIP (Fixed: White Bg & Shadow) --- */}
                    {/* Sirf Desktop par dikhega (hidden md:block) kyunki mobile par hover nahi hota */}
                    {!isActive && (
                      <div className="hidden md:block absolute -top-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-50">
                        <div className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl border border-slate-100 whitespace-nowrap flex items-center gap-1 relative">
                          {item.name}
                          {/* Arrow pointing down */}
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-slate-100 shadow-sm"></div>
                        </div>
                      </div>
                    )}

                  </li>
                );
              })}
            </ul>
        </div>

        {/* --- 3. WHATSAPP BUTTON --- */}
        <div className="pl-2 sm:pl-4 flex-shrink-0">
          <Button
            onClick={handleWhatsAppRedirect}
            className="group relative h-10 sm:h-11 px-4 sm:px-6 bg-slate-900 text-white rounded-full overflow-hidden shadow-lg hover:scale-105 transition-all duration-300 active:scale-95 border border-white/10 hidden sm:flex items-center justify-center"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0"></div>
            <span className="relative z-10 flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400/20 animate-pulse" />
              WhatsApp
            </span>
          </Button>

          {/* Mobile Icon Button */}
          <Button
            onClick={handleWhatsAppRedirect}
            className="sm:hidden w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform border border-white/20"
          >
             <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Header;