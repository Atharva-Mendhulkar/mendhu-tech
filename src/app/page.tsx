"use client";

import { useState } from "react";
import CustomCursor from "@/components/CustomCursor";
import BlogSection from "@/components/BlogSection";
import SystemsLab from "@/components/SystemsLab";
import KnowledgeArchive from "@/components/KnowledgeArchive";
import GardenModal from "@/components/GardenModal";
import ProjectModal from "@/components/ProjectModal";

export default function Home() {
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [isGardenOpen, setIsGardenOpen] = useState(false);

  const handleExit = () => {
    window.open("about:blank", "_self");
    window.close();
  };

  return (
    <main className="min-h-screen relative">
      <CustomCursor />

      {/* 
        OUTER CONTAINER 
        Dashed vertical lines marking the 1000px content boundary.
      */}
      <div className="max-w-[1000px] mx-auto border-x border-dashed border-border-strong min-h-screen relative shadow-sm">
        
        {/* 
          PAPER TEXTURE & HATCH 
          The only place the warm paper color is painted.
        */}
        <div 
          aria-hidden 
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: "var(--paper)",
            backgroundImage: `repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.05) 0px, rgba(0, 0, 0, 0.05) 1px, transparent 1px, transparent 9px)`
          }}
        />

        {/* REGISTRATION MARKS */}
        <span className="absolute top-2 left-2 z-20 font-mono text-[9px] text-ink-faint select-none">+</span>
        <span className="absolute top-2 right-2 z-20 font-mono text-[9px] text-ink-faint select-none">+</span>
        <span className="absolute bottom-2 left-2 z-20 font-mono text-[9px] text-ink-faint select-none">+</span>
        <span className="absolute bottom-2 right-2 z-20 font-mono text-[9px] text-ink-faint select-none">+</span>

        <div className="relative z-10 px-8 lg:px-14 py-12">
          
          {/* Introduction Section with Header and Meta Links */}
          <section className="flex flex-col md:flex-row justify-between items-center gap-12 mb-16 pb-16 border-b border-dashed border-border-strong">
            <div className="flex-1">
              <div className="section-tag">[01_ME]</div>
              <div className="fade-in flex items-center gap-6 mb-6">
                <h1 className="font-serif text-[clamp(48px,8vw,72px)] font-normal tracking-[-0.03em] leading-[1] text-ink">
                  Atharva<br /><em className="italic text-accent">Mendhulkar.</em>
                </h1>
                <div className="relative flex items-center justify-center">
                  <img 
                    src="/porygon.svg" 
                    alt="Porygon Icon" 
                    className="w-24 h-24 opacity-90 select-none cursor-pointer hover:scale-110 transition-transform duration-500 ease-in-out relative z-10" 
                  />
                </div>
              </div>
              
              <div className="fade-in">
                <p className="font-mono text-[14px] text-ink-muted tracking-[0.01em] mb-8 max-w-[480px] leading-relaxed">
                  Systems Engineer & AI Researcher. Exploring the intersection of physics-informed machine learning and kernel-level infrastructure.
                </p>
              </div>

              <div className="fade-in flex gap-3 flex-wrap">
                <a 
                  href="https://github.com/Atharva-Mendhulkar" 
                  target="_blank" 
                  className="group flex items-center gap-2 font-mono text-[11px] text-accent border border-dashed border-accent px-4 py-2 hover:bg-accent-light hover:border-solid transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  <span>github.com ↗</span>
                </a>
                <a 
                  href="https://x.com/atharvarta" 
                  target="_blank" 
                  className="group flex items-center gap-2 font-mono text-[11px] text-accent border border-dashed border-accent px-4 py-2 hover:bg-accent-light hover:border-solid transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  <span>x.com ↗</span>
                </a>
                <a 
                  href="mailto:mendhu36@outlook.com" 
                  className="group flex items-center gap-2 font-mono text-[11px] text-accent border border-dashed border-accent px-4 py-2 hover:bg-accent-light hover:border-solid transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  <span>email ↗</span>
                </a>
                <a 
                  href="#" 
                  className="group flex items-center gap-2 font-mono text-[11px] text-accent border border-dashed border-accent px-4 py-2 hover:bg-accent-light hover:border-solid transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span>resume ↗</span>
                </a>
              </div>
            </div>
          </section>

          {/* ─── PHASE 4: BLOG ─── */}
          <BlogSection />

          {/* ─── PHASE 5: LAB ─── */}
          <SystemsLab onOpenModal={setActiveModalId} />

          {/* ─── PHASE 7: KNOWLEDGE ─── */}
          <KnowledgeArchive onOpenGarden={() => setIsGardenOpen(true)} />

          {/* ─── FOOTER ─── */}
          <footer className="pt-20 pb-8 flex justify-between items-center border-t border-dashed border-border-strong mt-12">
            <div className="font-mono text-[10px] text-ink-faint uppercase tracking-widest flex items-center gap-4">
              <button onClick={handleExit} className="hover:text-ink transition-colors cursor-pointer">$ exit</button>
              <span className="text-border-strong">|</span>
              <span>v2.0.4-stable</span>
              <span className="text-border-strong">|</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            <div className="font-mono text-[10px] text-ink-faint uppercase tracking-widest">
              mendhu.tech
            </div>
          </footer>

        </div>
      </div>

      <ProjectModal activeId={activeModalId} onClose={() => setActiveModalId(null)} />
      <GardenModal isOpen={isGardenOpen} onClose={() => setIsGardenOpen(false)} />
    </main>
  );
}