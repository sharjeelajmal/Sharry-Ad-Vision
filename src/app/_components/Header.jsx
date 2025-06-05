'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // For Next.js 13+ compatibility
import { Button } from '@/components/ui/button';
import { House, Compass, Phone } from 'lucide-react'; // Icons
import AnimatedSection from "./AnimatedSection";

const Header = () => {
  const pathname = usePathname(); // Get the current pathname

  const handleWhatsAppRedirect = () => {
    const phoneNumber = '447751497015';
    const message = 'Hello, I want to know more about your services!';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
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
        {/* Logo */}
        <AnimatedSection>
        <Image src={'/logo.svg'} height={90} width={140} alt="Logo" className="md:flex hidden" />
</AnimatedSection>
        {/* Menu */}
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

        {/* WhatsApp Button */}
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
