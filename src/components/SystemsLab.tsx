"use client";

/* REFINED VERSION - NO ANALYSIS BUTTON ON TILES */
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Share2, Check } from 'lucide-react';
import { projects, categories } from '@/data/projects';

const GithubGraph = dynamic(() => import('@/components/GithubGraph'), { ssr: false });

interface SystemsLabProps {
  onOpenModal: (id: string) => void;
}

export default function SystemsLab({ onOpenModal }: SystemsLabProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleShareProject = async (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.mendhu.tech';
    const shareUrl = `${origin}/project/${slug}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedId(slug);
      setTimeout(() => setCopiedId(null), 2000);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message: `Link copied: /project/${slug}` }
        })
      );
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const filteredProjects = activeFilter === "all" 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  const displayedProjects = (showAll || activeFilter !== "all")
    ? filteredProjects
    : filteredProjects.slice(0, 4);

  return (
    <section className="pt-8 pb-10 relative z-10">
      <div className="section-tag mb-8">[03_SYSTEMS_LAB]</div>

      {/* Github Graph */}
      <GithubGraph />

      {/* Filter Row */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setActiveFilter(cat);
              if (cat !== "all") setShowAll(true);
            }}
            className={`font-mono text-[9.5px] px-4 py-1.5 border border-dashed transition-all cursor-pointer rounded-[2px] ${
              activeFilter === cat 
                ? "border-solid border-accent text-accent bg-accent-light" 
                : "border-border-strong text-ink-muted hover:border-solid hover:border-ink hover:text-ink"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
        {displayedProjects.map((project) => (
          <div 
            key={project.id}
            onClick={() => onOpenModal(project.id)}
            className="project-card group relative border border-dashed border-[rgba(0,71,255,0.3)] bg-paper p-6 rounded-xl hover:border-solid hover:border-accent hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all cursor-pointer overflow-hidden fade-in"
          >
            <div className="font-mono text-[9px] text-ink-faint tracking-[0.07em] mb-1 uppercase">
              {project.category}
            </div>
            
            <div className="flex justify-between items-center mb-2 gap-3">
              <h3 className="font-serif text-[19px] font-medium text-ink flex-1">
                {project.title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => handleShareProject(e, project.slug)}
                  title={`Share ${project.title}`}
                  aria-label={`Copy link for ${project.title}`}
                  className={`font-mono text-[10px] px-2.5 py-1.5 rounded-[2px] transition-all flex items-center gap-1 cursor-pointer border ${
                    copiedId === project.slug
                      ? "bg-green-500/10 text-green-600 border-green-500/40 border-solid"
                      : "text-ink-muted hover:text-accent border-dashed border-border-strong hover:bg-accent-light hover:border-solid hover:border-accent"
                  }`}
                >
                  {copiedId === project.slug ? (
                    <Check size={11} className="text-green-600" />
                  ) : (
                    <Share2 size={11} />
                  )}
                  <span>{copiedId === project.slug ? "COPIED" : "SHARE"}</span>
                </button>
                {project.links.demo && (
                  <a 
                    href={project.links.demo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-mono text-[10px] text-white bg-accent border border-solid border-accent px-3 py-1.5 rounded-[2px] hover:bg-accent/90 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    DEMO
                  </a>
                )}
                {project.links.github && (
                  <a 
                    href={project.links.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="font-mono text-[10px] text-ink-muted hover:text-accent border border-dashed border-border-strong px-3 py-1.5 rounded-[2px] hover:bg-accent-light hover:border-solid hover:border-accent transition-all flex items-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    GITHUB
                  </a>
                )}
              </div>
            </div>
            
            <p className="font-mono text-[9.5px] text-ink-muted leading-relaxed mb-6 h-8 line-clamp-2">
              {project.oneLiner}
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-[1px] bg-border-strong border border-dashed border-border-strong mb-6">
              {project.metrics.map((metric, i) => (
                <div key={i} className="bg-card p-3">
                  <div className="font-mono text-[11px] font-medium text-ink">
                    {metric.value}
                  </div>
                  <div className="font-mono text-[7.5px] text-ink-faint uppercase tracking-wider">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex gap-1.5 flex-wrap mb-6">
              {project.tags.map(tag => (
                <span key={tag} className="font-mono text-[8.5px] text-ink-muted border border-dashed border-border-strong px-2 py-0.5 rounded-[2px]">
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-dashed border-border-strong">
              <div className="flex gap-4">
                {/* Footer links removed - moved to top right */}
              </div>
              <span className="font-mono text-[9px] text-accent uppercase font-medium group-hover:underline">
                {project.statusLabel} →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* See All Projects Button */}
      {activeFilter === "all" && filteredProjects.length > 4 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll(prev => !prev)}
            className="group font-mono text-[10px] text-accent border border-dashed border-accent hover:border-solid hover:bg-accent hover:text-white px-6 py-2.5 rounded-[2px] transition-all flex items-center gap-2 cursor-pointer shadow-sm tracking-widest uppercase"
          >
            <span>{showAll ? "COLLAPSE TO TOP 4" : `SEE ALL PROJECTS (${filteredProjects.length})`}</span>
            <span className="transition-transform duration-200 group-hover:translate-y-0.5 font-bold">
              {showAll ? "↑" : "↓"}
            </span>
          </button>
        </div>
      )}
    </section>
  );
}
