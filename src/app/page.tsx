"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CustomCursor from "@/components/CustomCursor";
import BlogSection from "@/components/BlogSection";
import SystemsLab from "@/components/SystemsLab";
import KnowledgeArchive from "@/components/KnowledgeArchive";
import GardenModal from "@/components/GardenModal";
import ProjectModal from "@/components/ProjectModal";
import MinimizedPill from "@/components/MinimizedPill";
import DraggablePorygon from '@/components/DraggablePorygon';
import Terminal from "@/components/Terminal";
import LogBar from "@/components/LogBar";

export default function Home() {
  const router = useRouter();
  const [activeModalId, setActiveModalId] = useState<string | null>(null);
  const [isGardenOpen, setIsGardenOpen] = useState(false);
  const [activeGardenFileId, setActiveGardenFileId] = useState<string | undefined>(undefined);
  const [minimizedItems, setMinimizedItems] = useState<{ id: string, title: string, type: 'garden' | 'project' }[]>([]);
  const [restoredId, setRestoredId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isNavigatingToBlog, setIsNavigatingToBlog] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const pct = Math.max(0, Math.min(1, window.scrollY / 150));
      setScrollProgress(pct);
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

  const handleMinimizeModal = (id: string, title: string, type: 'garden' | 'project') => {
    if (type === 'garden') setIsGardenOpen(false);
    else setActiveModalId(null);
    setRestoredId(null);
    
    if (!minimizedItems.find(item => item.id === id)) {
      setMinimizedItems(prev => [...prev, { id, title, type }]);
    }
  };

  const handleRestoreModal = (id: string, type: 'garden' | 'project') => {
    setRestoredId(id);
    if (type === 'garden') setIsGardenOpen(true);
    else setActiveModalId(id);
    
    setMinimizedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClosePill = (id: string) => {
    setMinimizedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleExit = () => {
    window.open("about:blank", "_self");
    window.close();
  };

  return (
    <main className="min-h-screen relative">
      <CustomCursor />

      {/* OUTER CONTAINER */}
      <div className="max-w-[1000px] mx-auto border-x border-dashed border-border-strong min-h-[85vh] relative shadow-sm">
        
        {/* PAPER TEXTURE & HATCH */}
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

          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name: "Atharva Mendhulkar",
                url: "https://mendhu.tech",
                jobTitle: "Systems Engineer & AI Researcher",
                sameAs: [
                  "https://github.com/Atharva-Mendhulkar",
                  "https://x.com/atharvarta",
                ],
                description: "Systems Engineer & AI Researcher specializing in physics-informed machine learning and kernel-level infrastructure.",
              }),
            }}
          />

        <LogBar mode="projects" />

        <div className="relative z-10 px-8 lg:px-14 py-12">
          
          {/* Spotlight Quick-Trigger (Top Pill) */}
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
              <text 
                x="10" 
                y="30" 
                fill="var(--accent)" 
                className="text-[26px] md:text-[16px]"
                fontFamily="Caveat, cursive"
                transform="rotate(-2 10,30)"
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

            {/* Pill Button */}
            <button 
              onClick={() => window.dispatchEvent(new Event('toggle-terminal'))}
              className="px-5 py-2 border border-dashed border-border-strong bg-paper/60 backdrop-blur-md rounded-full shadow-sm hover:text-accent hover:border-accent flex items-center justify-center cursor-pointer font-mono select-none min-w-[130px]"
            >
              <span className="text-[12px] font-normal text-ink text-center flex items-center justify-center">
                <span className="hidden md:inline">{displayText}</span>
                <span className="inline md:hidden">Search.</span>
                <span className="animate-pulse text-accent ml-0.5 font-bold hidden md:inline">|</span>
              </span>
            </button>
          </div>

          {/* Floating Bottom-Right Search Icon (Mobile Only) */}
          <button 
            onClick={() => window.dispatchEvent(new Event('toggle-terminal'))}
            className="md:hidden fixed bottom-6 right-6 w-12 h-12 rounded-full border border-dashed border-accent bg-paper/60 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-paper/80 z-[220] transition-all duration-300"
            style={{
              opacity: scrollProgress,
              transform: `scale(${0.7 + scrollProgress * 0.3})`,
              pointerEvents: scrollProgress < 0.2 ? 'none' : 'auto'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
          
          {/* Introduction Section with Header and Meta Links */}
          <section className="fade-in flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 mb-8 pb-8 border-b border-dashed border-border-strong relative z-[200]">
            <div className="flex-1">
              <div className="section-tag">[01_ABOUT_ME]</div>
              <div className="flex items-center gap-6 mb-6">
                <h1 data-name-target className="font-serif text-[clamp(48px,8vw,72px)] font-normal tracking-[-0.03em] leading-[1] text-ink transition-transform hover:scale-[1.01]">
                  Atharva<br /><em className="italic text-accent">Mendhulkar.</em>
                </h1>
                <div className="relative flex items-center justify-center z-[500]">
                  <DraggablePorygon />
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
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 font-mono text-[11px] text-accent border border-dashed border-accent px-4 py-2 hover:bg-accent-light hover:border-solid transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  <span>github.com ↗</span>
                </a>
                <a 
                  href="https://x.com/atharvarta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 font-mono text-[11px] text-accent border border-dashed border-accent px-4 py-2 hover:bg-accent-light hover:border-solid transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  <span>x.com ↗</span>
                </a>
                <a 
                  href="https://www.linkedin.com/in/mendhu36/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 font-mono text-[11px] text-accent border border-dashed border-accent px-4 py-2 hover:bg-accent-light hover:border-solid transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  <span>linkedin ↗</span>
                </a>
                <a 
                  href="mailto:mendhu36@outlook.com" 
                  className="group flex items-center gap-2 font-mono text-[11px] text-accent border border-dashed border-accent px-4 py-2 hover:bg-accent-light hover:border-solid transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  <span>email ↗</span>
                </a>
                <button 
                  onClick={() => {
                    setIsNavigatingToBlog(true);
                    setTimeout(() => router.push("/blog"), 500);
                  }}
                  className="group flex items-center gap-2 font-mono text-[11px] text-accent border border-dashed border-accent px-4 py-2 hover:bg-accent-light hover:border-solid transition-all cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M6.5 18H20"></path></svg>
                  <span>blogs ↗</span>
                </button>
                <a 
                  href="https://drive.google.com/file/d/1fRhtpOOUqrIayHYB34IQtjnDG0x1sL3l/view?usp=sharing" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 font-mono text-[11px] text-accent border border-dashed border-accent px-4 py-2 hover:bg-accent-light hover:border-solid transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  <span>resume ↗</span>
                </a>
              </div>
            </div>
          </section>

          {/* ─── PHASE 4: BLOG ─── */}
          <div data-logs-target>
            <BlogSection />
          </div>

          {/* ─── PHASE 5: LAB ─── */}
          <div data-projects-target>
            <SystemsLab onOpenModal={setActiveModalId} />
          </div>

          {/* ─── PHASE 7: KNOWLEDGE ─── */}
          <div data-garden-target>
            <KnowledgeArchive onOpenGarden={() => setIsGardenOpen(true)} />
          </div>

          {/* ─── FOOTER ─── */}
          <footer className="pt-20 pb-8 flex flex-col md:flex-row gap-6 justify-between items-center border-t border-dashed border-border-strong mt-12">
            <div className="font-mono text-[10px] text-ink-faint uppercase tracking-widest flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <button onClick={() => window.dispatchEvent(new Event('toggle-terminal'))} className="hover:text-ink transition-colors cursor-pointer">$ search</button>
              <span className="hidden sm:inline text-border-strong">|</span>
              <button onClick={handleExit} className="hover:text-ink transition-colors cursor-pointer">$ exit</button>
              <span className="hidden sm:inline text-border-strong">|</span>
              <span>v2.0.4-stable</span>
              <span className="hidden sm:inline text-border-strong">|</span>
              <span>© Atharva Mendhulkar {new Date().getFullYear()}</span>
            </div>
            <div className="font-mono text-[10px] text-ink-faint uppercase tracking-widest">
              mendhu.tech
            </div>
          </footer>

        </div>
      </div>

      {/* MODALS */}
      <GardenModal 
        isOpen={isGardenOpen} 
        onClose={() => setIsGardenOpen(false)} 
        onMinimize={(id, title) => handleMinimizeModal(id, title, 'garden')}
        initialFileId={activeGardenFileId}
      />
      <ProjectModal 
        activeId={activeModalId} 
        onClose={() => setActiveModalId(null)}
        onMinimize={(id, title) => handleMinimizeModal(id, title, 'project')}
        skipBoot={restoredId === activeModalId}
      />

      {/* MINIMIZED PILLS */}
      <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-3 items-end">
        {minimizedItems.map((item) => (
          <MinimizedPill 
            key={item.id}
            item={item}
            onRestore={() => handleRestoreModal(item.id, item.type)}
            onClose={() => handleClosePill(item.id)}
          />
        ))}
      </div>
      <Terminal 
        onOpenProject={(id) => setActiveModalId(id)}
        onOpenGarden={(fileId) => {
          setIsGardenOpen(true);
          setActiveGardenFileId(fileId);
        }}
      />

      {isNavigatingToBlog && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{
            backgroundColor: "var(--paper)",
            animation: "fadeInBlog 0.6s ease-in-out forwards",
          }}
        >
          <div className="font-serif text-[24px] italic text-accent animate-pulse">Entering Intellectual Log...</div>
          <style>{`
            @keyframes fadeInBlog {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </main>
  );
}