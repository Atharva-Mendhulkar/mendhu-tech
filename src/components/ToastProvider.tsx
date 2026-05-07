"use client";

import { useState, useEffect } from "react";

export default function ToastProvider() {
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: "", show: false });

  useEffect(() => {
    const handleToast = (e: Event) => {
      const { message } = (e as CustomEvent<{ message: string }>).detail;
      setToast({ message, show: true });
      setTimeout(() => setToast({ message: "", show: false }), 2500);
    };
    window.addEventListener("show-toast", handleToast);
    return () => window.removeEventListener("show-toast", handleToast);
  }, []);

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[2000000] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
      <div className="px-6 py-3 rounded-full bg-paper border border-dashed border-border-strong shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] flex items-center gap-3 overflow-hidden">
        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        <span className="font-mono text-[11px] tracking-wider text-ink font-bold uppercase">
          {toast.message}
        </span>
      </div>
    </div>
  );
}
