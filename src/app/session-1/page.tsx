"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Session1Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/session-2");
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center bg-[#041C19]">
      <Loader2 className="w-8 h-8 text-[#7ECEB7] animate-spin" />
    </div>
  );
}
