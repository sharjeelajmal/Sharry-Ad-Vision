'use client';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageCircle, Star, Quote, ArrowDown } from 'lucide-react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import Review from '../_components/Review';

const Reviews = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const imageRef = useRef(null);

  const handleWhatsAppRedirect = () => {
    // Confetti Blast
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#1E40AF', '#ffffff']
    });

    setTimeout(() => {
        const phoneNumber = '447751497015'; 
        const message = 'Hello, I want to give feedback about your services!';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.location.href = url;
    }, 1000);
  };

  const scrollToReviews = () => {
    const reviewSection = document.getElementById('review-list');
    if (reviewSection) {
        reviewSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Text Entrance
      tl.fromTo(".review-reveal", 
        { y: 50, opacity: 0, filter: "blur(10px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, stagger: 0.15 }
      )
      .fromTo(imageRef.current,
        { x: 50, opacity: 0, scale: 0.9 },
        { x: 0, opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.7)" }, "-=0.8"
      );

      // 2. Floating Animation for Image
      gsap.to(imageRef.current, {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // 3. Background Parallax
      gsap.to(".bg-orb", {
        y: 30,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50">
      
      {/* --- HERO SECTION (Premium & Animated) --- */}
      <div className="relative w-full overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-20">
         
         {/* Background Effects */}
         <div className="absolute inset-0 w-full h-full pointer-events-none">
            <div className="bg-orb absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] mix-blend-multiply" />
            <div className="bg-orb absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-100/60 rounded-full blur-[100px] mix-blend-multiply" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]"></div>
         </div>

         <div className="container mx-auto px-6 md:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                
                {/* LEFT: Content */}
                <div ref={titleRef} className="text-center lg:text-left space-y-6">
                    
                    <div className="review-reveal inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                           Client Success Stories
                        </span>
                    </div>

                    <h1 className="review-reveal text-4xl md:text-6xl font-black text-slate-900 leading-tight">
                        Voices of <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                           Trust & Quality
                        </span>
                    </h1>

                    <p className="review-reveal text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                        Don't just take our word for it. Read what our happy clients say about our <span className="text-slate-900 font-bold">SMM & Development</span> services.
                    </p>

                    <div className="review-reveal flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                        <Button 
                            onClick={handleWhatsAppRedirect}
                            className="h-14 px-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-all"
                        >
                            <MessageCircle className="mr-2 w-5 h-5" /> Share Feedback
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={scrollToReviews}
                            className="h-14 px-8 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all"
                        >
                            Read Reviews <ArrowDown className="ml-2 w-4 h-4 animate-bounce" />
                        </Button>
                    </div>
                </div>

                {/* RIGHT: Visuals */}
                <div className="relative flex justify-center lg:justify-end">
                    <div ref={imageRef} className="relative w-full max-w-[450px]">
                        
                        {/* Glass Card Container */}
                        <div className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] ring-1 ring-white/80 transform rotate-3 hover:rotate-0 transition-transform duration-700">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-[2.5rem] opacity-50"></div>
                            
                            <Image
                                src="/reviews.svg"
                                width={500}
                                height={500}
                                alt="Reviews Illustration"
                                className="relative z-10 drop-shadow-2xl"
                            />

                            {/* Floating Badge 1: 5 Stars */}
                            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2 animate-[bounce_3s_infinite]">
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={16} className="fill-amber-400 text-amber-400" />)}
                                </div>
                                <span className="text-sm font-bold text-slate-800">5.0/5.0</span>
                            </div>

                            {/* Floating Badge 2: Quote */}
                            <div className="absolute -bottom-8 -left-4 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-[pulse_4s_infinite]">
                                <div className="p-2 bg-white/10 rounded-full">
                                    <Quote size={18} className="text-blue-300 fill-blue-300" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Feedback</p>
                                    <p className="text-sm font-bold">100% Real Reviews</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
         </div>
      </div>

      {/* --- REVIEWS LIST SECTION --- */}
      <div id="review-list">
          <Review/>
      </div>

   </div>
  );
};

export default Reviews;