'use client'
import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Star, ShieldCheck, Zap, TrendingUp } from 'lucide-react'
import { gsap } from 'gsap'
import confetti from 'canvas-confetti'

const Hero = () => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const imageWrapperRef = useRef(null);
  
  const handleWhatsAppRedirect = () => {
    const colors = ['#1E40AF', '#FFD700', '#ffffff'];
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors
    });

    setTimeout(() => {
        const phoneNumber = '447751497015'; 
        const message = 'Hello, I am interested in your premium SMM services.';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.location.href = url;
    }, 1200);
  };

  const handleScrollToServices = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(".hero-reveal", 
        { y: 50, opacity: 0, filter: "blur(10px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, stagger: 0.15 }
      )
      .fromTo(".hero-badge", 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.8"
      )
      .fromTo(imageWrapperRef.current,
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power4.out" }, "-=1"
      );

      gsap.to(imageWrapperRef.current, {
        y: -15,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".bg-gradient-orb", {
        y: 50,
        x: 30,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    // FIX: 'pt-32' mobile ke liye aur 'lg:pt-48' desktop ke liye. 
    // Isse content UpHeader ke neeche se shuru hoga.
    <div ref={containerRef} className="relative min-h-[90vh] w-full overflow-hidden bg-[#F8F9FC] flex items-center pt-24 pb-20 lg:pt-32 lg:pb-10">
      
      {/* --- Premium Background Effects --- */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="bg-gradient-orb absolute -top-[10%] -right-[5%] w-[400px] h-[400px] md:w-[700px] md:h-[700px] bg-blue-100/50 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
        <div className="bg-gradient-orb absolute top-[40%] -left-[10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-amber-100/60 rounded-full blur-[100px] mix-blend-multiply opacity-60" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" style={{ opacity: 0.04 }}></div>
      </div>

      <div className="container relative z-10 mx-auto px-5 md:px-10 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center flex-col-reverse">
          
          {/* --- Left Content --- */}
        <div ref={contentRef} className="flex flex-col text-center lg:text-left space-y-6 md:space-y-8">
            
         {/* Premium Badge */}
  <div className="hero-reveal flex justify-center lg:justify-start">
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-[0_2px_10px_-2px_rgba(59,130,246,0.2)] backdrop-blur-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
      </span>
      <span className="text-[11px] font-bold tracking-[0.15em] text-slate-600 uppercase">
        #1 Digital Growth Partner
      </span>
    </div>
  </div>
         {/* Main Headline */}
  <h1 className="hero-reveal text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.15]">
    Scale Your Brand <br className="hidden lg:block"/>
    <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-700 via-indigo-600 to-blue-900 drop-shadow-sm">
      Beyond Limits.
    </span>
  </h1>

        {/* Description - Humanized & Covering All Services */}
  <p className="hero-reveal text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
    Stop juggling multiple agencies. We bring 
    <span className="text-blue-700 font-semibold"> Targeted Ads</span>, 
    <span className="text-blue-700 font-semibold"> Custom Web Dev</span>, and 
    <span className="text-amber-600 font-semibold"> Creative Design </span>
    together to build a digital presence that dominates.
  </p>

            {/* Feature Pills */}
            <div className="hero-reveal flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-default">
                    <Zap size={16} className="text-blue-600 fill-blue-600/10" />
                    <span className="text-sm font-semibold text-slate-700">Instant</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-default">
                    <Star size={16} className="text-amber-500 fill-amber-500/10" />
                    <span className="text-sm font-semibold text-slate-700">Top Rated</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-shadow cursor-default">
                    <ShieldCheck size={16} className="text-green-600 fill-green-600/10" />
                    <span className="text-sm font-semibold text-slate-700">Secure</span>
                </div>
            </div>

            {/* PREMIUM BUTTONS SECTION */}
            <div className="hero-reveal pt-6 flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              
              {/* Button 1: Celebration + WhatsApp */}
              <Button
                onClick={handleWhatsAppRedirect}
                className="group relative px-9 py-7 bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-900 text-white font-bold text-lg rounded-full shadow-[0_10px_40px_-10px_rgba(30,58,138,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(30,58,138,0.6)] transition-all duration-300 hover:scale-[1.03] active:scale-95 border border-white/10 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent z-10"></div>
                
                <span className="relative z-20 flex items-center gap-3">
                  Get Started Now
                  <div className="bg-white/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </span>
              </Button>

              {/* Button 2: Smooth Scroll */}
              <Button
                onClick={handleScrollToServices}
                variant="outline"
                className="group relative px-9 py-7 text-lg font-semibold text-slate-700 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-full shadow-[0_5px_20px_-5px_rgba(0,0,0,0.05)] hover:bg-white hover:text-blue-900 hover:border-blue-200 hover:shadow-[0_8px_25px_-5px_rgba(59,130,246,0.15)] transition-all duration-300 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  View Services
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 transition-opacity duration-300 -z-0"></div>
              </Button>

            </div>
          </div>

          {/* --- Right Visual --- */}
          <div className="relative flex justify-center lg:justify-end items-center">
            <div ref={imageWrapperRef} className="relative w-full max-w-[320px] md:max-w-[450px] lg:max-w-[500px] perspective-1000">
              
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[2.5rem] rotate-3 opacity-10 blur-2xl scale-95"></div>
              
              <div className="relative bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-4 ring-1 ring-white/50">
                 <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-b from-slate-50 to-white shadow-inner">
                    <img
                      src="/hero.svg" 
                      alt="Premium SMM Dashboard"
                      className="w-full h-auto object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-transparent opacity-50 pointer-events-none"></div>
                 </div>

                 <div className="hero-badge absolute -bottom-6 -left-2 md:-left-6 bg-white p-3 md:p-4 rounded-2xl shadow-[0_10px_30px_-5px_rgba(30,58,138,0.15)] border border-slate-100 flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-full text-blue-600">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">Growth</p>
                        <p className="text-sm md:text-lg font-bold text-slate-800">+500%</p>
                    </div>
                 </div>

                 <div className="hero-badge absolute -top-6 -right-2 md:-right-6 bg-slate-900 text-white p-3 md:p-4 rounded-2xl shadow-xl flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-full">
                       <Star size={18} className="text-amber-400 fill-amber-400" />
                    </div>
                    <div>
                       <p className="text-[10px] md:text-xs text-slate-300 font-medium">Quality</p>
                       <p className="text-xs md:text-sm font-bold">Premium Tier</p>
                    </div>
                 </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Hero