"use client";
import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Users, ShoppingCart, Image as ImageIcon, Code, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

const iconMap = {
  Users: <Users />,
  Orders: <ShoppingCart />,
  "Designs Delivered": <ImageIcon />,
  "Websites Built": <Code />,
  Clients: <Users />,
};

export default function StatsCards({ isAdmin = false, isEditing, setIsEditing, notifyClients, statsData }) {
  const [stats, setStats] = useState([]);
  const [editValues, setEditValues] = useState({});
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  // --- 1. Data Handling ---
  useEffect(() => {
    const processStats = (data) => {
      if (!data || data.length === 0) return;
      
      const dataWithIcons = data.map(item => ({
        ...item,
        icon: iconMap[item.label] || <Users />, 
      }));
      setStats(dataWithIcons);
      
      const initialValues = dataWithIcons.reduce((acc, stat) => ({
        ...acc,
        [stat.label]: stat.value
      }), {});
      setEditValues(initialValues);
    };

    if (isAdmin) {
      const fetchStats = async () => {
        try {
          const response = await fetch('/api/stats');
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          processStats(data);
        } catch (error) {
          console.error("Error fetching stats:", error);
          toast.error("Failed to load stats.");
        }
      };
      fetchStats();
    } else if (statsData) {
      processStats(statsData);
    }
  }, [isAdmin, statsData]);

  // --- 2. Save Logic ---
  const handleSaveClick = async () => {
    const updatedStatsPayload = stats.map(stat => ({
      label: stat.label,
      value: editValues[stat.label] || stat.value
    }));

    try {
      const response = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStatsPayload)
      });
      if (!response.ok) throw new Error((await response.json()).details || "Failed to save stats");

      const savedStats = await response.json();
      const savedStatsWithIcons = savedStats.map(item => ({
        ...item,
        icon: iconMap[item.label] || <Users />,
      }));
      setStats(savedStatsWithIcons);
      setIsEditing(false);
      toast.success("Stats saved successfully!");
      if (notifyClients) notifyClients();
    } catch (error) {
      toast.error(`Failed to save stats: ${error.message}`);
    }
  };

  const handleInputChange = (label, value) => {
    setEditValues(prev => ({ ...prev, [label]: value }));
  };

  // --- 3. PREMIUM ANIMATIONS ---
  useLayoutEffect(() => {
    if (stats.length === 0) return;

    const ctx = gsap.context(() => {
      // Entrance Animation
      gsap.fromTo(cardsRef.current, 
        { y: 50, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
          }
        }
      );

      // Number Counter Animation
      cardsRef.current.forEach((card, index) => {
        const numberElement = card.querySelector(".stat-number");
        if (!numberElement) return;

        const rawValue = stats[index]?.value || "0";
        const endValue = parseInt(rawValue.replace(/,/g, ''), 10);

        if (!isNaN(endValue)) {
          gsap.fromTo(numberElement, 
            { innerText: 0 },
            {
              innerText: endValue,
              duration: 2,
              ease: "power1.out",
              snap: { innerText: 1 },
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
              },
              onUpdate: function() {
                this.targets()[0].innerText = Math.ceil(this.targets()[0].innerText).toLocaleString();
              }
            }
          );
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, [stats]);

  return (
    <div ref={containerRef} className="py-8 sm:py-10 px-4 flex flex-col items-center justify-center relative z-10">
      
      {/* Admin Controls */}
      {isAdmin && (
        <div className="flex space-x-3 mb-8 bg-white/80 backdrop-blur-md p-2 rounded-full border border-slate-200 shadow-sm">
          {isEditing ? (
            <>
              <button className="px-6 py-2 bg-green-600 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform" onClick={handleSaveClick}>Save Changes</button>
              <button className="px-6 py-2 bg-red-500 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform" onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <button className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2" onClick={() => setIsEditing(true)}>
              <Sparkles size={16} className="text-amber-400" /> Edit Stats
            </button>
          )}
        </div>
      )}

      {/* Grid Container */}
      {/* FIX: 'grid-cols-2' for mobile, 'lg:grid-cols-4' for desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full max-w-7xl">
        {stats.map((stat, index) => (
          <div 
            key={stat.label || index} 
            ref={el => cardsRef.current[index] = el}
            className="group relative"
          >
            {/* --- Premium Glass Card with Visible Shadow --- */}
            {/* FIX: Shadow increased to 'shadow-xl' and added custom drop-shadow for clarity */}
            <div className="h-full bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 hover:shadow-[0_20px_50px_-10px_rgba(59,130,246,0.3)] hover:-translate-y-2 group-hover:bg-white ring-1 ring-black/5 flex flex-col items-center text-center overflow-hidden">
              
              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-blue-50/0 to-amber-50/0 group-hover:from-blue-50/50 group-hover:via-white/20 group-hover:to-amber-50/50 transition-all duration-500 opacity-0 group-hover:opacity-100 pointer-events-none" />

              {/* --- Icon Bubble --- */}
              <div className="relative z-10 mb-2 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-md flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6">
                   <div className="text-slate-400 group-hover:text-blue-600 transition-colors duration-300">
                     {/* Mobile Icon Size adjusted */}
                     {React.cloneElement(stat.icon, { className: "w-6 h-6 sm:w-8 sm:h-8", strokeWidth: 1.5 })}
                   </div>
                </div>
                <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150" />
              </div>

              {/* --- Stats Content --- */}
              <div className="relative z-10 flex flex-col items-center gap-0 sm:gap-1 w-full">
                
                {isEditing && isAdmin ? (
                  <input
                    type="text"
                    className="input input-sm w-full text-center text-lg font-bold bg-slate-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    value={editValues[stat.label] || ''}
                    onChange={(e) => handleInputChange(stat.label, e.target.value)}
                  />
                ) : (
                  // Number Size: Mobile (2xl) vs Desktop (5xl) taaki 2 column me fit ho
                  <h3 className="text-2xl sm:text-5xl font-extrabold tracking-tight text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-indigo-600 transition-all duration-300 break-all sm:break-normal">
                    <span className="stat-number">{stat.value}</span>
                    <span className="text-lg sm:text-3xl text-slate-400 ml-0.5 sm:ml-1 align-top">+</span>
                  </h3>
                )}

                {/* Label Size: Mobile (xs) vs Desktop (sm) */}
                <p className="text-[10px] sm:text-sm font-bold text-slate-500 uppercase tracking-widest group-hover:text-amber-600 transition-colors duration-300 mt-1 sm:mt-2 flex items-center justify-center gap-1">
                  {stat.label}
                  <TrendingUp className="w-3 h-3 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-2 group-hover:translate-x-0" />
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}