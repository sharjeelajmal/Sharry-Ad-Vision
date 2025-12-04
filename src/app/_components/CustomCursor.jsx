'use client';
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { usePathname } from 'next/navigation';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const pathname = usePathname();
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // 1. Mobile Check (Clean disable on touch devices)
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;

    const cursor = cursorRef.current;

    // Initial Center
    gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0 });

    // --- ULTRA-SMOOTH & FAST MOVEMENT ---
    // quickTo use kiya hai taaki performance 60FPS rahe aur koi lag na ho
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3.out" });

    // Mouse Move Handler
    const onMouseMove = (e) => {
      gsap.to(cursor, { opacity: 1, duration: 0.2 }); // Pehli movement pe visible hoga
      xTo(e.clientX);
      yTo(e.clientY);
    };

    // --- SMART HOVER LOGIC ---
    const onHoverStart = () => setIsHovering(true);
    const onHoverEnd = () => setIsHovering(false);

    // Click Animations (Subtle Pulse)
    const onMouseDown = () => gsap.to(cursor, { scale: 0.9, duration: 0.1 });
    const onMouseUp = () => gsap.to(cursor, { scale: isHovering ? 2.5 : 1, duration: 0.2 });

    // Events Attach
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Target Selection
    const attachHoverEvents = () => {
      const targets = document.querySelectorAll('a, button, input, textarea, select, .cursor-pointer, .hover-trigger');
      targets.forEach(el => {
        el.addEventListener('mouseenter', onHoverStart);
        el.addEventListener('mouseleave', onHoverEnd);
      });
      return targets;
    };

    let hoverTargets = attachHoverEvents();

    // Observe DOM updates (Next.js navigation fix)
    const observer = new MutationObserver(attachHoverEvents);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      hoverTargets.forEach(el => {
        el.removeEventListener('mouseenter', onHoverStart);
        el.removeEventListener('mouseleave', onHoverEnd);
      });
      observer.disconnect();
    };
  }, [pathname]);

  // Hover Effect Animation
  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    if (isHovering) {
      // Hover State: Bada Ring (Focus Mode)
      gsap.to(cursor, {
        width: 60,
        height: 60,
        backgroundColor: "rgba(255, 255, 255, 1)", // Solid White (Inverts to black)
        mixBlendMode: "exclusion", // The Professional Blend
        border: "none",
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      // Normal State: Sharp Dot
      gsap.to(cursor, {
        width: 12,
        height: 12,
        backgroundColor: "#0f172a", // Slate-900 (Dark Professional)
        mixBlendMode: "normal",
        border: "1px solid rgba(255,255,255,0.2)", // Subtle border for contrast on dark bg
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [isHovering]);

  return (
    <div 
      ref={cursorRef}
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[99999] hidden md:flex items-center justify-center"
      style={{ 
        position: 'fixed',
        willChange: 'transform, width, height', // Hardware Acceleration
      }}
    >
        {/* Center Dot (Sirf Hover pe dikhega taaki Ring jaisa feel aye) */}
        <div className={`w-1 h-1 bg-black rounded-full transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}></div>
    </div>
  );
};

export default CustomCursor;