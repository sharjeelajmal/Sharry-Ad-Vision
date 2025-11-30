import React from 'react';
// Import the CSS module we just created
import styles from './Loader.module.css';

const PremiumLoader = () => {
  return (
    // Full screen glass backdrop
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#020617]/60 backdrop-blur-xl transition-all">
      
      {/* The main loader structure */}
      <div className={styles.loaderContainer}>
        
        {/* The central glowing core */}
        <div className={styles.core}></div>
        
        {/* Orbital Ring 1 (Outer Blue) */}
        <div className={`${styles.ring} ${styles.ring1}`}></div>
        
        {/* Orbital Ring 2 (Inner Gold) */}
        <div className={`${styles.ring} ${styles.ring2}`}></div>
        
      </div>
      
      {/* Optional: Loading Text underneath */}
      <div className="absolute mt-36 text-center">
        <p className="text-slate-300 font-medium tracking-[0.3em] text-sm animate-pulse uppercase">
            Loading System
        </p>
      </div>
    </div>
  );
};

export default PremiumLoader;