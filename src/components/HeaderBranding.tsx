"use client";

import React from "react";

export default function HeaderBranding() {
  return (
    <header className="w-full bg-[#041C19]/95 backdrop-blur-md border-b border-[#7ECEB7]/20 py-2 sm:py-3 px-3 sm:px-6 md:px-8 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side Logo */}
        <div className="flex items-center">
          <img 
            src="/images/1.png" 
            alt="Side Logo Left" 
            className="h-8 sm:h-12 md:h-16 w-auto object-contain transition-transform hover:scale-105" 
          />
        </div>

        {/* Center Main Important Logo */}
        <div className="flex flex-col items-center justify-center text-center">
          <img 
            src="/images/2.png" 
            alt="Main Center Logo" 
            className="h-10 sm:h-14 md:h-20 w-auto object-contain filter drop-shadow-[0_4px_12px_rgba(126,206,183,0.3)] transition-transform hover:scale-105" 
          />
        </div>

        {/* Right Side Logo */}
        <div className="flex items-center justify-end">
          <img 
            src="/images/3.png" 
            alt="Side Logo Right" 
            className="h-6 sm:h-8 md:h-12 w-auto object-contain transition-transform hover:scale-105" 
          />
        </div>
      </div>
    </header>
  );
}
