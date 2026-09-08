"use client";

import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function ScrollProgressButtons() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollProgress(Math.max(0, Math.min(1, window.scrollY / 150)));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const phrases = ["Click Here", "[Ctrl + `]"];
    let currentPhraseIndex = 0;
    let currentText = "";
    let isDeletingText = false;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      const fullPhrase = phrases[currentPhraseIndex];

      if (isDeletingText) {
        currentText = fullPhrase.substring(0, currentText.length - 1);
      } else {
        currentText = fullPhrase.substring(0, currentText.length + 1);
      }

      setDisplayText(currentText);

      let typeSpeed = 80;

      if (isDeletingText) {
        typeSpeed = 40;
      }

      if (!isDeletingText && currentText === fullPhrase) {
        typeSpeed = 2500; 
        isDeletingText = true;
      } else if (isDeletingText && currentText === "") {
        isDeletingText = false;
        currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
        typeSpeed = 500; 
      }

      timeoutId = setTimeout(type, typeSpeed);
    };

    timeoutId = setTimeout(type, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {/* Spotlight Quick-Trigger (Top Pill) — hero utilities: search + theme,
          side by side on the same plane, theme toggle on the RIGHT */}
      <div 
        className="md:absolute md:top-1 md:right-8 lg:right-14 z-[210] flex flex-col items-center md:items-end gap-1 mb-8 md:mb-0 w-full md:w-auto transition-all duration-300"
        style={{
          opacity: 1 - scrollProgress,
          transform: `scale(${1 - scrollProgress * 0.15})`,
          pointerEvents: scrollProgress > 0.8 ? 'none' : 'auto'
        }}
      >
        {/* Arrow + text ABOVE the button */}
        <svg 
          width="300" 
          height="110" 
          viewBox="0 0 300 110" 
          xmlns="http://www.w3.org/2000/svg"
          className="select-none pointer-events-none mb-[-12px] md:mr-[-35px]"
        >
          {/* Text at the top */}
          <style>{`
            @keyframes handWiggle {
              0%, 100% { transform: rotate(-2deg) translate(0, 0); }
              33% { transform: rotate(-1deg) translate(0.5px, -0.5px); }
              66% { transform: rotate(-3deg) translate(-0.5px, 0.5px); }
            }
            .hand-drawn-wiggle {
              animation: handWiggle 1.2s ease-in-out infinite;
              transform-origin: 50px 25px;
            }
          `}</style>
          <text 
            x="10" 
            y="30" 
            fill="var(--accent)" 
            className="text-[26px] md:text-[16px] hand-drawn-wiggle"
            fontFamily="Caveat, cursive"
            opacity="0.85"
          >
            need to find something fast?
          </text>

          {/* Dashed Path */}
          <path 
            d="M100,45 C130,45 175,50 175,88"
            fill="none" 
            stroke="var(--accent)" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 7"
            opacity="0.75"
          />

          {/* Arrowhead */}
          <path 
            d="M167,86 L175,95 L183,86" 
            fill="none" 
            stroke="var(--accent)" 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.75"
          />
        </svg>

        {/* Hero utilities row: search button + theme toggle side by side */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => window.dispatchEvent(new Event('toggle-terminal'))}
            className="h-12 px-7 border border-dashed border-border-strong bg-paper rounded-[18px] shadow-sm hover:text-accent hover:border-accent flex items-center justify-center cursor-pointer font-mono text-[12px] select-none min-w-[130px] transition-[border-color,color,background] duration-200"
          >
            <span className="text-[12px] font-normal text-ink text-center flex items-center justify-center transition-colors duration-200">
              <span className="hidden md:inline">{displayText}</span>
              <span className="inline md:hidden">Search.</span>
              <span className="animate-pulse text-accent ml-0.5 font-bold hidden md:inline">|</span>
            </span>
          </button>
          <ThemeToggle />
        </div>
      </div>

    </>
  );
}
