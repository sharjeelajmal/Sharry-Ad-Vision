// components/AnimatedSection.js
'use client';

import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export default function AnimatedSection({ children, animationDelay = 0 }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: false, // 👈 Baar baar animate karne ke liye false
    threshold: 0.2,      // 20% visible hone pe trigger ho
  });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, delay: animationDelay },
      });
    } else {
      controls.start({ opacity: 0, y: 50 }); // View se bahar jaye to wapas invisible ho jaye
    }
  }, [controls, inView, animationDelay]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial={{ opacity: 0, y: 50 }}
    >
      {children}
    </motion.div>
  );
}
