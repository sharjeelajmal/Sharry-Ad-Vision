'use client';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Github, Linkedin, MapPin, Mail, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
  const footerRef = useRef(null);
  const marqueeRef = useRef(null);

  // Marquee Items
  const servicesList = [
    "Social Media Growth", "Web Development", "UI/UX Design", "SEO Ranking",
    "Content Creation", "Video Editing", "App Development", "Digital Marketing",
    "E-commerce", "Email Automation", "Branding", "Lead Generation"
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // 1. NON-STOP INFINITE MARQUEE
      gsap.to(marqueeRef.current, {
        xPercent: -50, 
        repeat: -1,
        duration: 30, 
        ease: "linear",
      });

      // 2. Glass Card Entrance
      gsap.fromTo(".footer-glass-card",
        { y: 50, opacity: 0, scale: 0.95 },
        {
          y: 0, 
          opacity: 1, 
          scale: 1,
          duration: 1, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 80%",
          }
        }
      );

    }, footerRef);

    return () => ctx.revert();
  }, []);

  const SocialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "https://www.facebook.com/profile.php?id=100084778281907", color: "hover:bg-blue-600 hover:text-white" },
    { icon: <Instagram className="w-5 h-5" />, href: "https://www.instagram.com/codeenginesharjeel", color: "hover:bg-pink-600 hover:text-white" },
    { icon: <Github className="w-5 h-5" />, href: "https://github.com/sharjeelajmal", color: "hover:bg-slate-900 hover:text-white" },
    { icon: <Linkedin className="w-5 h-5" />, href: "https://www.linkedin.com/in/muhammad-sharjeel-701578274/", color: "hover:bg-blue-700 hover:text-white" },
  ];

  return (
    <footer ref={footerRef} className="relative bg-slate-50 pt-0 pb-10 overflow-hidden">
      
      {/* --- 1. INFINITE MARQUEE STRIP (Premium Black) --- */}
      <div className="w-full bg-[#0a0a0a] py-5 overflow-hidden relative z-20 shadow-xl">
         <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>
         <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-20 pointer-events-none"></div>

         <div ref={marqueeRef} className="flex whitespace-nowrap w-max will-change-transform">
            {[...servicesList, ...servicesList].map((service, i) => (
                <div key={`m-${i}`} className="flex items-center mx-8">
                    <Sparkles size={14} className="text-amber-400 mr-4 animate-pulse" />
                    <span className="text-white font-bold text-sm tracking-[0.2em] uppercase opacity-90">
                        {service}
                    </span>
                </div>
            ))}
         </div>
      </div>

      {/* --- BACKGROUND DECORATION (Orbs for Glass Effect) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-full">
         <div className="absolute top-[10%] left-[5%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
         <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-amber-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
         <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.04]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 pt-16">
        
        {/* --- 2. MAIN GLASS CONTAINER --- */}
        <div className="footer-glass-card bg-white/60 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-8 md:p-12 ring-1 ring-white/80">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
                
                {/* Brand Info */}
                <div className="space-y-6">
                    <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                       <Image src="/logo.svg" alt="Logo" width={150} height={55} className="object-contain drop-shadow-sm" />
                    </Link>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                       Elevating brands with high-end digital solutions. Your growth partner for SMM, Development, and Design.
                    </p>
                    <div className="flex gap-3">
                       {SocialLinks.map((social, idx) => (
                          <a 
                            key={idx} 
                            href={social.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${social.color}`}
                          >
                            {social.icon}
                          </a>
                       ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-slate-900 font-extrabold mb-6 text-sm uppercase tracking-widest">Company</h3>
                    <ul className="space-y-3">
                        {['About Us', 'Success Stories', 'Our Team', 'Privacy Policy'].map((item) => (
                            <li key={item}>
                                <Link href="/Reviews" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center group text-sm font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 group-hover:bg-blue-600 group-hover:w-4 transition-all duration-300"></span>
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Services */}
                <div>
                    <h3 className="text-slate-900 font-extrabold mb-6 text-sm uppercase tracking-widest">Services</h3>
                    <ul className="space-y-3">
                        {['SMM Panel', 'Web Development', 'App Design', 'SEO Ranking'].map((item) => (
                            <li key={item}>
                                <Link href="/" className="text-slate-500 hover:text-blue-600 transition-colors flex items-center group text-sm font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 group-hover:bg-amber-500 group-hover:w-4 transition-all duration-300"></span>
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-slate-900 font-extrabold mb-6 text-sm uppercase tracking-widest">Contact</h3>
                    <ul className="space-y-4 text-sm text-slate-500 font-medium">
                        <li className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm"><MapPin size={16} /></div>
                            <span className="mt-1">Council More, Near Harappa Museum, Punjab</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm"><Mail size={16} /></div>
                            <span>sharjeelajmalg786@gmail.com</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shadow-sm"><Phone size={16} /></div>
                            <span>+44 7751 497015</span>
                        </li>
                    </ul>
                </div>

            </div>

            {/* --- BOTTOM COPYRIGHT (Inside Glass) --- */}
            <div className="border-t border-slate-200/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-slate-400">
                <p className="hover:text-slate-600 transition-colors">© 2025 Sharry Ads Vision. All Rights Reserved.</p>
                <p className="flex items-center gap-1">
                    Designed by <span className="text-slate-900 font-bold">Sharry Yar</span>
                </p>
            </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;