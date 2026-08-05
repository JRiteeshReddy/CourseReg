"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Ban, Calendar, CheckCircle2, ShieldAlert, Sparkles, X } from "lucide-react";

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationNoticeModal({ isOpen, onClose }: NoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-panel bg-[#041C19]/95 border border-[#7ECEB7]/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl shadow-[#037A74]/30 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#D6C7A1] hover:text-[#F5EBE0] hover:bg-[#037A74]/30 transition-all border border-[#7ECEB7]/20"
          title="Close Announcement"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 border-b border-[#7ECEB7]/20 pb-4">
          <div className="p-3 bg-[#A07850]/20 rounded-2xl border border-[#A07850]/40 text-[#D6C7A1] flex-shrink-0">
            <AlertTriangle className="w-7 h-7 text-[#7ECEB7]" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-[#037A74]/40 text-[#7ECEB7] border border-[#037A74]/60">
              URGENT COURSE ANNOUNCEMENT
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5EBE0] mt-1">
              Important Course Registration & Schedule Updates
            </h2>
            <p className="text-xs md:text-sm text-[#D6C7A1] mt-0.5">
              Please review the updated course availability and day-wise schedule restrictions before proceeding to registration.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-5 text-sm text-[#F5EBE0]">

          {/* Section 1: Frozen & Closed Courses */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#F5EBE0] text-sm uppercase tracking-wider">
              <Ban className="w-4 h-4 text-red-400" />
              <span>Completely Frozen / Closed Courses</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-200">Communication, Life skills and Soft skills</h4>
                  <p className="text-xs text-red-300/80 mt-0.5">
                    🚫 <strong>Completely Frozen</strong> — No new student registrations accepted.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-200">Contemporary Dance, Hip Hop and Freestyle</h4>
                  <p className="text-xs text-red-300/80 mt-0.5">
                    🚫 <strong>Closed Completely</strong> — Registration is closed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Wednesday Frozen / Friday Open Courses */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#F5EBE0] text-sm uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-[#7ECEB7]" />
              <span>Wednesday-Frozen Courses (Open for Friday Only)</span>
            </div>

            <div className="space-y-2">

              <div className="p-3.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/25 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-[#F5EBE0]">Social Media and Digital Content Creation</h4>
                  <p className="text-xs text-[#D6C7A1]">Frozen for Wednesday | <span className="text-[#7ECEB7] font-semibold">Open ONLY for Friday</span></p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#037A74]/40 border border-[#7ECEB7]/30 text-xs font-mono text-[#7ECEB7] self-start md:self-auto">
                  13 Slots Remaining
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/25 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-[#F5EBE0]">Creative Design, Innovation and Sustainability</h4>
                  <p className="text-xs text-[#D6C7A1]">Frozen for Wednesday | <span className="text-[#7ECEB7] font-semibold">Open for Friday</span></p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#037A74]/40 border border-[#7ECEB7]/30 text-xs font-mono text-[#7ECEB7] self-start md:self-auto">
                  26 Slots Remaining
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/25 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-[#F5EBE0]">Basics of Theatre Acting</h4>
                  <p className="text-xs text-[#D6C7A1]">Frozen for Wednesday | <span className="text-[#7ECEB7] font-semibold">Open for Friday</span></p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#037A74]/40 border border-[#7ECEB7]/30 text-xs font-mono text-[#7ECEB7] self-start md:self-auto">
                  18 Slots Remaining
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#072C28] border border-[#7ECEB7]/25 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-[#F5EBE0]">Mental Wellbeing and Peer Support</h4>
                  <p className="text-xs text-[#D6C7A1]">Frozen for Wednesday | <span className="text-[#7ECEB7] font-semibold">Open for Friday</span></p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#037A74]/40 border border-[#7ECEB7]/30 text-xs font-mono text-[#7ECEB7] self-start md:self-auto">
                  11 Slots Remaining
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-[#7ECEB7]/20 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#037A74] hover:bg-[#7ECEB7] text-[#F5EBE0] hover:text-[#041C19] font-bold text-sm transition-all shadow-lg shadow-[#037A74]/30 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I Understand & Acknowledge</span>
          </button>
        </div>

      </div>
    </div>
  );
}
