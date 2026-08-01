"use client";

import React from "react";
import { Mail, HelpCircle } from "lucide-react";

export default function FooterSupport() {
  return (
    <footer className="w-full bg-[#041C19]/90 border-t border-[#7ECEB7]/15 py-4 px-4 md:px-8 mt-auto z-20 text-center">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-xs md:text-sm text-[#D6C7A1]">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#7ECEB7]" />
          <span>In case of any issues, please contact:</span>
        </div>
        <a
          href="mailto:directorcampuslife_blr@gitam.edu"
          className="inline-flex items-center gap-1.5 font-semibold text-[#7ECEB7] hover:text-[#F5EBE0] hover:underline transition-colors bg-[#7ECEB7]/10 hover:bg-[#7ECEB7]/20 px-2.5 py-1 rounded-full border border-[#7ECEB7]/30"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>directorcampuslife_blr@gitam.edu</span>
        </a>
      </div>
    </footer>
  );
}
