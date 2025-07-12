'use client';
import React, { useState, useEffect } from 'react'; // useState aur useEffect ko import karein
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { House, Compass, Phone } from 'lucide-react';
import AnimatedSection from "./AnimatedSection";

const Header = () => {
  const pathname = usePathname();
  // ▼▼▼ NAYI STATE VARIABLE ▼▼▼
  const [whatsappNumber, setWhatsappNumber] = useState(''); // Shuru mein khaali rakhein

  // ▼▼▼ useEffect HOOK - SETTINGS FETCH KARNE KE LIYE ▼▼▼
  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber); // State ko update karein
        }
      })
      .catch(err => console.error("WhatsApp number fetch karne mein error:", err));
  }, []); // Yeh sirf ek baar page load hone par chalega

  // ▼▼▼ WHATSAPP FUNCTION KO UPDATE KAREIN ▼▼▼
  const handleWhatsAppRedirect = () => {
    const numberToUse = whatsappNumber || '447751497015'; // Agar number na mile toh default istemal karein
    const message = 'Hello, I want to know more about your services!';
    const url = `https://wa.me/${numberToUse}?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  const Menu = [
    {
      id: 1,
      name: 'Home',
      path: '/',
      icon: <House className="w-5 h-5" />,
    },
    {
      id: 2,
      name: 'Reviews',
      path: '/Reviews',
      icon: <Compass className="w-5 h-5" />,
    },
    {
      id: 3,
      name: 'Contact',
      path: '/Contact',
      icon: <Phone className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 w-full md:w-9/12 flex items-center justify-center px-4 z-50 sm:w-3/5">
      <div className="flex flex-wrap items-center gap-4 py-5 md:p-5 justify-between shadow-sm border rounded-full bg-white w-full">
        <AnimatedSection>
          <Image src={'/logo.svg'} height={90} width={140} alt="Logo" className="md:flex hidden" />
        </AnimatedSection>
        <div>
          <AnimatedSection>
            <ul className="flex justify-center gap-7">
              {Menu.map((item) => (
                <Link href={item.path} key={item.id}>
                  <li
                    className={`text-sm md:text-lg font-semibold flex gap-2 items-center cursor-pointer transition-all ease-out ${
                      pathname === item.path
                        ? 'text-primary hover:text-primary-dark'
                        : 'hover:text-primary hover:scale-105'
                    }`}
                  >
                    {React.cloneElement(item.icon, {
                      className: `${
                        pathname === item.path
                          ? 'text-primary-dark'
                          : 'hover:text-primary'
                      } w-5 h-5`,
                    })}
                    {item.name}
                  </li>
                </Link>
              ))}
            </ul>
          </AnimatedSection>
        </div>
        <AnimatedSection>
          <Button
            onClick={handleWhatsAppRedirect}
            className="active:scale-95 hover:scale-105 transition-all ease-out hidden md:block"
          >
            WhatsApp
          </Button>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Header;