"use client";

import React from "react";

export default function HeaderBranding() {
  return (
    <header className="w-full bg-[#041C19]/95 backdrop-blur-md border-b border-[#7ECEB7]/20 py-4 px-4 md:px-8 sticky top-0 z-50 shadow-xl">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center gap-3">
        {/* Tier 1: Apex Primary Logo (Logo 2) */}
        <div className="flex flex-col items-center justify-center text-center">
          <img 
            src="/images/2.png" 
            alt="Main Institution Logo (Primary)" 
            className="h-16 md:h-24 w-auto object-contain filter drop-shadow-[0_4px_16px_rgba(126,206,183,0.4)] transition-transform hover:scale-105" 
          />
        </div>

        {/* Hierarchy Divider Line */}
        <div className="w-48 h-[1.5px] bg-gradient-to-r from-transparent via-[#7ECEB7]/60 to-transparent"></div>

        {/* Tier 2: Subordinate Logos (Logo 1 on left, Logo 3 on right) */}
        <div className="w-full flex items-center justify-between px-4 sm:px-12 md:px-20 pt-0.5">
          {/* Subordinate Entity 1 (Logo 1) */}
          <div className="flex items-center">
            <img 
              src="/images/1.png" 
              alt="Subordinate Entity 1" 
              className="h-12 md:h-18 max-h-20 w-auto object-contain transition-transform hover:scale-105" 
            />
          </div>

          {/* Subordinate Entity 3 (Logo 3) */}
          <div className="flex items-center justify-end">
            <img 
              src="/images/3.png" 
              alt="Subordinate Entity 3" 
              className="h-8 md:h-12 max-h-14 w-auto object-contain transition-transform hover:scale-105" 
            />
          </div>
        </div>
      </div>
    </header>
  );
}
