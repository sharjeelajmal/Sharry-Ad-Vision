"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Facebook, Github, Instagram, Linkedin, Send, MessageCircle, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

const Contact = () => {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Animations ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Header Fade In
      tl.fromTo(".contact-header", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1 }
      );

      // Cards Slide In
      tl.fromTo(".contact-card",
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
        "-=0.5"
      );

      // Form Slide Up
      tl.fromTo(formRef.current,
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8 },
        "-=0.6"
      );

      // Background movement
      gsap.to(".bg-glow", {
        y: 30,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // --- Handlers ---
  const handleWhatsAppRedirect = () => {
    // Celebration
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#ffffff', '#FFD700']
    });

    setTimeout(() => {
        const phoneNumber = "447751497015"; 
        const message = "Hello, I want to discuss a project!";
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.name || !formData.email || !formData.message) {
        toast.error("Please fill all fields");
        return;
    }
    
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
        setIsSubmitting(false);
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
        
        // Success Celebration
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#000000', '#ffffff']
        });
    }, 1500);
  };

  const ContactInfo = [
    { icon: <MapPin className="w-6 h-6" />, title: "Visit Us", value: "Council More, Harappa City, Punjab", color: "bg-blue-50 text-blue-600" },
    { icon: <Mail className="w-6 h-6" />, title: "Email Us", value: "sharjeelajmalg786@gmail.com", color: "bg-amber-50 text-amber-600" },
    { icon: <Phone className="w-6 h-6" />, title: "Call Us", value: "+44 7751 497015", color: "bg-green-50 text-green-600" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 relative overflow-hidden pt-32 pb-20">
      
      {/* --- Background Decor --- */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="bg-glow absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/60 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="bg-glow absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/60 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.04]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* --- HEADER --- */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
    <h2 className="contact-header text-sm font-bold text-blue-600 tracking-widest uppercase bg-blue-50 inline-block px-4 py-1 rounded-full border border-blue-100">
        Let's Collaborate
    </h2>
    <h1 className="contact-header text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
        Ready to <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Level Up?</span>
    </h1>
    <p className="contact-header text-slate-500 text-lg font-medium">
        Whether you need a high-converting website, a viral ad campaign, or a complete brand makeover—we have the blueprint for your success.
    </p>
</div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* --- LEFT COLUMN: CONTACT INFO --- */}
            <div className="lg:col-span-5 space-y-6">
                
                {/* Info Cards */}
                <div className="space-y-4">
                    {ContactInfo.map((item, idx) => (
                        <div key={idx} className="contact-card group p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default flex items-center gap-5">
                            <div className={`p-4 rounded-xl ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{item.title}</p>
                                <p className="text-slate-800 font-bold text-sm sm:text-base">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* WhatsApp CTA Card */}
                <div className="contact-card p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl text-white relative overflow-hidden group cursor-pointer" onClick={handleWhatsAppRedirect}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors"></div>
                    
                    <h3 className="text-xl font-bold mb-2 relative z-10">Need faster response?</h3>
                    <p className="text-slate-300 text-sm mb-6 relative z-10">Chat directly with our team on WhatsApp for instant support.</p>
                    
                    <Button className="w-full bg-white text-slate-900 hover:bg-blue-50 font-bold rounded-xl h-12 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all">
                        <MessageCircle className="w-5 h-5 text-green-600" /> Open WhatsApp
                    </Button>
                </div>

                {/* Social Links */}
                <div className="contact-card flex gap-3 justify-center lg:justify-start pt-4">
                  {[
                    { icon: <Facebook />, href: "https://www.facebook.com/profile.php?id=100084778281907", color: "hover:bg-blue-600" },
                    { icon: <Github />, href: "https://github.com/sharjeelajmal", color: "hover:bg-slate-900" },
                    { icon: <Instagram />, href: "https://www.instagram.com/codeenginesharjeel", color: "hover:bg-pink-600" },
                    { icon: <Linkedin />, href: "https://www.linkedin.com/in/muhammad-sharjeel-701578274/", color: "hover:bg-blue-700" },
                  ].map((social, i) => (
                    <a key={i} href={social.href} target="_blank" className={`w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shadow-sm transition-all hover:text-white hover:-translate-y-1 ${social.color}`}>
                        {React.cloneElement(social.icon, { size: 20 })}
                    </a>
                  ))}
                </div>

            </div>

            {/* --- RIGHT COLUMN: FORM --- */}
            <div className="lg:col-span-7">
                <div ref={formRef} className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-100 relative overflow-hidden">
                    
                    {/* Decorative Line */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Your Name</label>
                                <input 
                                    type="text" 
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Your Email</label>
                                <input 
                                    type="email" 
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                            <textarea 
                                placeholder="Tell us about your project..."
                                rows="5"
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                            ></textarea>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                        >
                            {isSubmitting ? "Sending..." : (
                                <>
                                  Send Message <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;