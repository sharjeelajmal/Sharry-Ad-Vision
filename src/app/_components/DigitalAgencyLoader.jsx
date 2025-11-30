// src/app/_components/DigitalAgencyLoader.jsx
import React from 'react';

const DigitalAgencyLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-64 space-y-6">
      {/* Animated Growth Bars */}
      <div className="flex items-end space-x-2 h-16">
        <div className="w-4 bg-blue-600 rounded-t-md animate-[bounce_1s_infinite] h-8 shadow-lg shadow-blue-200"></div>
        <div className="w-4 bg-indigo-600 rounded-t-md animate-[bounce_1.2s_infinite] h-12 shadow-lg shadow-indigo-200"></div>
        <div className="w-4 bg-purple-600 rounded-t-md animate-[bounce_0.8s_infinite] h-6 shadow-lg shadow-purple-200"></div>
        <div className="w-4 bg-pink-600 rounded-t-md animate-[bounce_1.1s_infinite] h-14 shadow-lg shadow-pink-200"></div>
        <div className="w-4 bg-amber-500 rounded-t-md animate-[bounce_0.9s_infinite] h-10 shadow-lg shadow-amber-200"></div>
      </div>
      
      {/* Text */}
      <div className="text-center space-y-1">
        <p className="text-slate-700 font-bold text-lg tracking-tight animate-pulse">
          Analyzing Best Strategies...
        </p>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          Please Wait
        </p>
      </div>
    </div>
  );
};

export default DigitalAgencyLoader;